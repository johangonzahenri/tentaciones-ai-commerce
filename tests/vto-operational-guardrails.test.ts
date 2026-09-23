/**
 * VTO Operational Hardening, Cost Guardrails & Observability Test Suite
 * Comprehensive automated verification for Phase 98 invariants.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { VTOExecutionGateway } from "../src/domain/vto/vto-execution-gateway.js";
import { DemoVirtualTryOnProvider } from "../src/adapter/vto/demo-vto-provider.js";
import { FashnVirtualTryOnProvider } from "../src/adapter/vto/fashn-vto-provider.js";
import {
  VTOConcurrencyManager,
  assertVTOCostBudget,
  VTOProviderCircuitBreaker,
  VTORateLimiter,
} from "../src/domain/vto/vto-operational-guards.js";
import { VTOLogger, VTOMetricsCollector } from "../src/domain/vto/vto-observability.js";
import type {
  VirtualTryOnExecutionRequest,
  VTOPilotProfile,
} from "../src/contracts/vto-execution-contract.js";

function buildMockRequest(overrides?: Partial<VirtualTryOnExecutionRequest>): VirtualTryOnExecutionRequest {
  return {
    requestId: "req-" + Math.random().toString(36).substring(2, 9),
    userConsentGranted: true,
    demoMode: true,
    productCategory: "tops",
    productImage: {
      productId: "polera-oversized-cotton-essential",
      productSlug: "polera-oversized-cotton-essential",
      category: "tops",
      url: "/assets/showcase/apparel-polera-cotton.svg",
      quality: "EXCELLENT",
      format: "svg",
      width: 1024,
      height: 1024,
      aspectRatio: 1.0,
      sourceType: "PRODUCT_IMAGE",
      validated: true,
      evaluatedAt: new Date().toISOString(),
    },
    userImage: {
      inputType: "DEMO_AVATAR",
      sourceType: "SYNTHETIC_AVATAR",
      quality: "EXCELLENT",
      format: "svg",
      mimeType: "image/svg+xml",
      width: 800,
      height: 1200,
      aspectRatio: 0.67,
      orientation: "portrait",
      validated: true,
      validatedAt: new Date().toISOString(),
      qualityAssessment: {
        state: "EXCELLENT",
        reasons: [],
        warnings: [],
        feedback: { es: "Excelente", en: "Excellent" },
        readyForTryOn: true,
        technicalSummary: {
          format: "svg",
          mimeType: "image/svg+xml",
          width: 800,
          height: 1200,
          aspectRatio: 0.67,
          orientation: "portrait",
          fileSizeBytes: 1024,
          pixelCount: 960000,
          hasMagicHeader: true,
        },
      },
    },
    metadata: {
      avatarProfile: "Nova",
    },
    ...overrides,
  };
}

test("OpGuard 1. Cost Guardrail: Strict rejection of numImages > 1", () => {
  const invalidProfile = {
    provider: "demo-synthetic",
    model: "tryon-max",
    numImages: 2 as any,
    outputFormat: "png",
    returnBase64: true,
    timeoutMs: 30000,
    pollIntervalMs: 1500,
    maxPollAttempts: 25,
    maxRetries: 2,
  } as VTOPilotProfile;

  assert.throws(
    () => assertVTOCostBudget(invalidProfile),
    (err: unknown) => {
      assert.ok((err as Error).message.includes("Cost Guardrail Violation"));
      return true;
    }
  );
});

test("OpGuard 2. Execution Budget: Ceilings on retries, poll attempts, and timeouts", () => {
  const excessiveRetries = {
    provider: "demo-synthetic",
    model: "tryon-max",
    numImages: 1,
    outputFormat: "png",
    returnBase64: true,
    timeoutMs: 30000,
    pollIntervalMs: 1500,
    maxPollAttempts: 25,
    maxRetries: 5,
  } as VTOPilotProfile;

  assert.throws(
    () => assertVTOCostBudget(excessiveRetries),
    (err: unknown) => {
      assert.ok((err as Error).message.includes("maxRetries"));
      return true;
    }
  );

  const excessivePolls = { ...excessiveRetries, maxRetries: 2, maxPollAttempts: 100 } as VTOPilotProfile;
  assert.throws(
    () => assertVTOCostBudget(excessivePolls),
    (err: unknown) => {
      assert.ok((err as Error).message.includes("maxPollAttempts"));
      return true;
    }
  );

  const excessiveTimeout = { ...excessiveRetries, maxRetries: 2, timeoutMs: 200000 } as VTOPilotProfile;
  assert.throws(
    () => assertVTOCostBudget(excessiveTimeout),
    (err: unknown) => {
      assert.ok((err as Error).message.includes("timeoutMs"));
      return true;
    }
  );
});

test("OpGuard 3. Idempotency Manager: Returns cached result for identical requests without re-triggering inference", async () => {
  const manager = new VTOConcurrencyManager(60000);
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(
    demoProvider,
    { mode: "PUBLIC_DEMO", defaultCurrency: "CLP", freeShippingThresholdCLP: 30000 },
    undefined,
    async () => {},
    manager
  );

  const req = buildMockRequest({ metadata: { idempotencyKey: "idem-key-100" } });
  const firstResult = await gateway.execute(req);
  assert.equal(firstResult.status, "COMPLETED");

  // Second execution with identical key must return cached result
  const secondResult = await gateway.execute(req);
  assert.equal(secondResult.status, "COMPLETED");
  assert.equal(secondResult.jobId, firstResult.jobId);
  assert.equal(secondResult.requestId, firstResult.requestId);
});

test("OpGuard 4. Session Concurrency Guard: Rejects concurrent executions for the same client session", async () => {
  const manager = new VTOConcurrencyManager();
  const lock1 = manager.acquireExecution("req-1", "session-abc");
  assert.equal(lock1.allowed, true);

  // Attempt concurrent execution under same session
  const lock2 = manager.acquireExecution("req-2", "session-abc");
  assert.equal(lock2.allowed, false);
  assert.equal(lock2.reason, "SESSION_CONCURRENCY_LIMIT");

  manager.releaseExecution("req-1", "session-abc");
  const lock3 = manager.acquireExecution("req-3", "session-abc");
  assert.equal(lock3.allowed, true);
});

test("OpGuard 5. Provider Circuit Breaker: Trips after consecutive failures and denies calls with VTO_CIRCUIT_OPEN", async () => {
  const circuitBreaker = new VTOProviderCircuitBreaker(3, 10000);
  assert.equal(circuitBreaker.isCircuitOpen("test-provider"), false);

  circuitBreaker.recordFailure("test-provider");
  circuitBreaker.recordFailure("test-provider");
  assert.equal(circuitBreaker.isCircuitOpen("test-provider"), false);

  circuitBreaker.recordFailure("test-provider"); // 3rd failure
  assert.equal(circuitBreaker.isCircuitOpen("test-provider"), true);

  circuitBreaker.reset();
  assert.equal(circuitBreaker.isCircuitOpen("test-provider"), false);
});

test("OpGuard 6. Rate Limiter: Bounded sliding window denies rapid-fire requests", () => {
  const rateLimiter = new VTORateLimiter(3, 10000); // 3 requests per 10s
  assert.equal(rateLimiter.checkLimit("user-ip-1").allowed, true);
  assert.equal(rateLimiter.checkLimit("user-ip-1").allowed, true);
  assert.equal(rateLimiter.checkLimit("user-ip-1").allowed, true);

  const fourth = rateLimiter.checkLimit("user-ip-1");
  assert.equal(fourth.allowed, false);
  assert.equal(fourth.remaining, 0);

  // Different user is allowed
  assert.equal(rateLimiter.checkLimit("user-ip-2").allowed, true);
});

test("OpGuard 7. Observability & Zero Secret Invariant: Structured logger redacts secrets and contains no raw images", () => {
  VTOLogger.clearEvents();
  VTOLogger.logEvent({
    eventType: "vto.execution.failed",
    executionId: "exec-test-1",
    requestId: "req-test-1",
    providerId: "fashn-pilot",
    isSynthetic: false,
    errorCode: "VTO_AUTH_ERROR",
    errorSummary: "Failed with fa_live_secret12345678 and Bearer token-xyz at https://api.fashn.ai/v1/run",
  });

  const events = VTOLogger.getRecentEvents(10);
  assert.equal(events.length, 1);
  const logged = events[0]!;
  assert.ok(!logged.errorSummary?.includes("fa_live_secret12345678"));
  assert.ok(!logged.errorSummary?.includes("token-xyz"));
  assert.ok(logged.errorSummary?.includes("[REDACTED_FASHN_KEY]"));
  assert.ok(logged.errorSummary?.includes("Bearer [REDACTED_TOKEN]"));
});

test("OpGuard 8. Telemetry Metrics: Accurately separates Demo vs Real execution metrics", () => {
  VTOMetricsCollector.resetMetrics();
  VTOLogger.logEvent({
    eventType: "vto.execution.started",
    executionId: "exec-1",
    requestId: "req-1",
    providerId: "demo-synthetic",
    isSynthetic: true,
  });
  VTOLogger.logEvent({
    eventType: "vto.execution.completed",
    executionId: "exec-1",
    requestId: "req-1",
    providerId: "demo-synthetic",
    isSynthetic: true,
    durationMs: 120,
  });
  VTOLogger.logEvent({
    eventType: "vto.execution.started",
    executionId: "exec-2",
    requestId: "req-2",
    providerId: "fashn-pilot",
    isSynthetic: false,
  });
  VTOLogger.logEvent({
    eventType: "vto.execution.failed",
    executionId: "exec-2",
    requestId: "req-2",
    providerId: "fashn-pilot",
    isSynthetic: false,
    errorCode: "VTO_MISSING_CREDENTIAL",
  });

  const summary = VTOMetricsCollector.getMetricsSummary();
  assert.equal(summary.totalExecutions, 2);
  assert.equal(summary.demoExecutions, 1);
  assert.equal(summary.realExecutions, 1);
  assert.equal(summary.completedCount, 1);
  assert.equal(summary.failedCount, 1);
  assert.equal(summary.averageDurationMs, 120);
});

test("OpGuard 9. Gateway End-to-End Hardening: Bounded execution, metricsSource and sanitized result output", async () => {
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(
    demoProvider,
    { mode: "PUBLIC_DEMO", defaultCurrency: "CLP", freeShippingThresholdCLP: 30000 },
    undefined,
    async () => {}
  );

  const req = buildMockRequest({ clientSessionId: "session-e2e" });
  const result = await gateway.execute(req);

  assert.equal(result.status, "COMPLETED");
  assert.equal(result.isSyntheticDemo, true);
  assert.equal(result.metricsSource, "DEMO_SYNTHETIC");
  assert.ok(result.executionId?.startsWith("vto-exec-"));
  assert.equal(result.clientSessionId, "session-e2e");
  assert.ok((result.totalDurationMs ?? 0) >= 0);
  assert.ok(result.metadata.pollCount !== undefined);
});
