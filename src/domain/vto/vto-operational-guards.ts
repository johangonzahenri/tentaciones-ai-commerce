/**
 * VTO Operational Guards & Reliability Controls
 * Implements Concurrency Management, Idempotency Caching, Cost Guardrails,
 * Provider Circuit Breaker, and Rate Limiting.
 */

import type {
  VTOPilotProfile,
  VirtualTryOnExecutionResult,
} from "../../contracts/vto-execution-contract.js";
import { VTOLogger } from "./vto-observability.js";

export class VTOConcurrencyManager {
  private inFlightBySession = new Map<string, string>(); // sessionId -> executionId
  private inFlightByKey = new Set<string>(); // idempotencyKey / requestId
  private completedCache = new Map<string, { result: VirtualTryOnExecutionResult; expiresAt: number }>();
  private cacheTtlMs: number;

  constructor(cacheTtlMs = 5 * 60 * 1000) {
    this.cacheTtlMs = cacheTtlMs;
  }

  /**
   * Checks if an execution is allowed or if an existing result / in-flight conflict exists.
   */
  public acquireExecution(
    key: string,
    sessionId?: string
  ): { allowed: boolean; cachedResult?: VirtualTryOnExecutionResult; reason?: string } {
    this.cleanExpiredCache();

    // 1. Check idempotency cache for completed executions
    const cached = this.completedCache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return { allowed: false, cachedResult: cached.result, reason: "IDEMPOTENT_CACHED_RESULT" };
    }

    // 2. Check in-flight duplicate by key
    if (this.inFlightByKey.has(key)) {
      return { allowed: false, reason: "DUPLICATE_IN_FLIGHT" };
    }

    // 3. Check per-session concurrency limit (1 concurrent job per session)
    if (sessionId && this.inFlightBySession.has(sessionId)) {
      return { allowed: false, reason: "SESSION_CONCURRENCY_LIMIT" };
    }

    // Acquire lock
    this.inFlightByKey.add(key);
    if (sessionId) {
      this.inFlightBySession.set(sessionId, key);
    }

    return { allowed: true };
  }

  /**
   * Releases lock and optionally stores completed result in idempotency cache.
   */
  public releaseExecution(
    key: string,
    sessionId?: string,
    completedResult?: VirtualTryOnExecutionResult
  ): void {
    this.inFlightByKey.delete(key);
    if (sessionId && this.inFlightBySession.get(sessionId) === key) {
      this.inFlightBySession.delete(sessionId);
    }

    if (completedResult && completedResult.status === "COMPLETED") {
      this.completedCache.set(key, {
        result: completedResult,
        expiresAt: Date.now() + this.cacheTtlMs,
      });
    }
  }

  public getInFlightCount(): number {
    return this.inFlightByKey.size;
  }

  public clearAll(): void {
    this.inFlightByKey.clear();
    this.inFlightBySession.clear();
    this.completedCache.clear();
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [k, v] of this.completedCache.entries()) {
      if (now >= v.expiresAt) {
        this.completedCache.delete(k);
      }
    }
  }
}

/**
 * Cost Guardrail: Strict checks on inference budgets.
 */
export function assertVTOCostBudget(profile: VTOPilotProfile): void {
  // 1. Single-image inference strict invariant
  if (profile.numImages !== 1) {
    throw new Error(
      `Cost Guardrail Violation: 'numImages' (${profile.numImages}) must be exactly 1 for controlled pilot executions.`
    );
  }

  // 2. Maximum retry limit ceiling
  if (profile.maxRetries > 3) {
    throw new Error(
      `Execution Budget Violation: 'maxRetries' (${profile.maxRetries}) exceeds safety ceiling of 3.`
    );
  }

  // 3. Maximum poll attempts ceiling
  if (profile.maxPollAttempts > 60) {
    throw new Error(
      `Execution Budget Violation: 'maxPollAttempts' (${profile.maxPollAttempts}) exceeds safety ceiling of 60.`
    );
  }

  // 4. Overall timeout ceiling
  if (profile.timeoutMs > 120000) {
    throw new Error(
      `Execution Budget Violation: 'timeoutMs' (${profile.timeoutMs} ms) exceeds maximum allowed ceiling of 120,000 ms.`
    );
  }
}

/**
 * Simple in-memory Circuit Breaker to prevent hammering unavailable providers.
 */
export class VTOProviderCircuitBreaker {
  private failures = new Map<string, { count: number; lastFailureTime: number }>();
  private openUntil = new Map<string, number>();
  private threshold: number;
  private cooldownMs: number;

  constructor(threshold = 5, cooldownMs = 30000) {
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
  }

  public isCircuitOpen(providerId: string): boolean {
    const openTime = this.openUntil.get(providerId);
    if (!openTime) return false;

    if (Date.now() < openTime) {
      return true;
    }

    // Half-open: Cooldown expired
    this.openUntil.delete(providerId);
    this.failures.delete(providerId);
    return false;
  }

  public recordSuccess(providerId: string): void {
    this.failures.delete(providerId);
    this.openUntil.delete(providerId);
  }

  public recordFailure(providerId: string): void {
    const now = Date.now();
    const current = this.failures.get(providerId) || { count: 0, lastFailureTime: now };
    current.count++;
    current.lastFailureTime = now;
    this.failures.set(providerId, current);

    if (current.count >= this.threshold) {
      this.openUntil.set(providerId, now + this.cooldownMs);
      VTOLogger.logEvent({
        eventType: "vto.circuit.opened",
        executionId: "system",
        requestId: "system",
        providerId,
        isSynthetic: providerId === "demo-synthetic",
        errorSummary: `Circuit opened for provider ${providerId} after ${current.count} consecutive failures. Cooldown: ${this.cooldownMs} ms.`,
      });
    }
  }

  public reset(): void {
    this.failures.clear();
    this.openUntil.clear();
  }
}

/**
 * In-memory sliding rate limiter per clientSessionId or IP.
 */
export class VTORateLimiter {
  private requests = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public checkLimit(identifier: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const timestamps = (this.requests.get(identifier) || []).filter((t) => now - t < this.windowMs);

    if (timestamps.length >= this.maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    return { allowed: true, remaining: this.maxRequests - timestamps.length };
  }

  public reset(): void {
    this.requests.clear();
  }
}
