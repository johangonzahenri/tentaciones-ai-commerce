/**
 * VTO Observability & Structured Telemetry
 * Provides structured, zero-leak logging, event correlation, and operational metrics.
 */

import { redactVTOSecrets } from "../../security/vto-guardrails.js";
import type { VTOExecutionStatus, VTOErrorCode } from "../../contracts/vto-execution-contract.js";

export type VTOEventType =
  | "vto.execution.started"
  | "vto.provider.selected"
  | "vto.input.validated"
  | "vto.job.submitted"
  | "vto.polling.attempt"
  | "vto.retry.scheduled"
  | "vto.execution.completed"
  | "vto.execution.failed"
  | "vto.execution.cancelled"
  | "vto.execution.timeout"
  | "vto.circuit.opened"
  | "vto.circuit.closed"
  | "vto.rate_limit.exceeded";

export interface VTOStructuredEvent {
  timestamp: string;
  eventType: VTOEventType;
  executionId: string;
  requestId: string;
  clientSessionId?: string;
  providerId: string;
  isSynthetic: boolean;
  modelName?: string;
  status?: VTOExecutionStatus;
  pollAttempt?: number;
  retryAttempt?: number;
  durationMs?: number;
  inferenceLatencyMs?: number;
  errorCode?: VTOErrorCode;
  errorSummary?: string;
}

export interface VTOMetricsSummary {
  totalExecutions: number;
  demoExecutions: number;
  realExecutions: number;
  completedCount: number;
  failedCount: number;
  cancelledCount: number;
  timeoutCount: number;
  totalPollAttempts: number;
  totalRetries: number;
  averageDurationMs: number;
  circuitBreakerTrips: number;
}

export class VTOLogger {
  private static events: VTOStructuredEvent[] = [];
  private static maxStoredEvents = 500;
  private static consoleEnabled = true;

  public static setConsoleLogging(enabled: boolean): void {
    this.consoleEnabled = enabled;
  }

  public static logEvent(event: Omit<VTOStructuredEvent, "timestamp">): VTOStructuredEvent {
    // 1. Sanitize any potential error strings or fields
    const sanitizedErrorSummary = event.errorSummary
      ? redactVTOSecrets(event.errorSummary)
      : undefined;

    const structuredEvent: VTOStructuredEvent = {
      timestamp: new Date().toISOString(),
      ...event,
      errorSummary: sanitizedErrorSummary,
    };

    // 2. Add to bounded in-memory buffer
    this.events.push(structuredEvent);
    if (this.events.length > this.maxStoredEvents) {
      this.events.shift();
    }

    // 3. Record in metrics
    VTOMetricsCollector.recordEvent(structuredEvent);

    return structuredEvent;
  }

  public static getRecentEvents(limit = 50): VTOStructuredEvent[] {
    return this.events.slice(-limit);
  }

  public static clearEvents(): void {
    this.events = [];
  }
}

export class VTOMetricsCollector {
  private static total = 0;
  private static demoCount = 0;
  private static realCount = 0;
  private static completed = 0;
  private static failed = 0;
  private static cancelled = 0;
  private static timeouts = 0;
  private static totalPolls = 0;
  private static totalRetries = 0;
  private static totalDuration = 0;
  private static durationMeasurements = 0;
  private static circuitBreakerTrips = 0;

  public static recordEvent(event: VTOStructuredEvent): void {
    if (event.eventType === "vto.execution.started") {
      this.total++;
      if (event.isSynthetic) {
        this.demoCount++;
      } else {
        this.realCount++;
      }
    } else if (event.eventType === "vto.polling.attempt") {
      this.totalPolls++;
    } else if (event.eventType === "vto.retry.scheduled") {
      this.totalRetries++;
    } else if (event.eventType === "vto.circuit.opened") {
      this.circuitBreakerTrips++;
    } else if (event.eventType === "vto.execution.completed") {
      this.completed++;
      if (event.durationMs !== undefined) {
        this.totalDuration += event.durationMs;
        this.durationMeasurements++;
      }
    } else if (event.eventType === "vto.execution.failed") {
      this.failed++;
    } else if (event.eventType === "vto.execution.cancelled") {
      this.cancelled++;
    } else if (event.eventType === "vto.execution.timeout") {
      this.timeouts++;
    }
  }

  public static getMetricsSummary(): VTOMetricsSummary {
    return {
      totalExecutions: this.total,
      demoExecutions: this.demoCount,
      realExecutions: this.realCount,
      completedCount: this.completed,
      failedCount: this.failed,
      cancelledCount: this.cancelled,
      timeoutCount: this.timeouts,
      totalPollAttempts: this.totalPolls,
      totalRetries: this.totalRetries,
      averageDurationMs: this.durationMeasurements > 0 ? Math.round(this.totalDuration / this.durationMeasurements) : 0,
      circuitBreakerTrips: this.circuitBreakerTrips,
    };
  }

  public static resetMetrics(): void {
    this.total = 0;
    this.demoCount = 0;
    this.realCount = 0;
    this.completed = 0;
    this.failed = 0;
    this.cancelled = 0;
    this.timeouts = 0;
    this.totalPolls = 0;
    this.totalRetries = 0;
    this.totalDuration = 0;
    this.durationMeasurements = 0;
    this.circuitBreakerTrips = 0;
  }
}
