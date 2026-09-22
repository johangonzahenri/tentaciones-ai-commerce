/**
 * Polling Engine & Retry Policy for Virtual Try-On Execution
 * Bounded state polling with exponential backoff and deterministic error classification.
 */

import type {
  VTOErrorCode,
  RetryEvaluation,
  VTOPilotProfile,
} from "../../contracts/vto-execution-contract.js";

export type SleepFunction = (ms: number) => Promise<void>;

export class VtoRetryPolicy {
  private maxRetries: number;
  private baseDelayMs: number;
  private maxDelayMs: number;

  constructor(maxRetries = 2, baseDelayMs = 500, maxDelayMs = 5000) {
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
  }

  /**
   * Evaluates if a given error is retryable according to the VTO error taxonomy.
   */
  public evaluate(
    statusOrError: number | string | Error,
    currentAttempt: number
  ): RetryEvaluation {
    if (currentAttempt >= this.maxRetries) {
      return {
        shouldRetry: false,
        retryAfterMs: 0,
        reason: `Exceeded maximum retry attempts (${this.maxRetries})`,
        errorCode: "VTO_PROVIDER_FAILED",
      };
    }

    const errStr = typeof statusOrError === "number" ? String(statusOrError) : String(statusOrError);
    const lower = errStr.toLowerCase();

    // 1. Authentication errors (401 / 403 / Auth) -> NEVER RETRY
    if (lower.includes("401") || lower.includes("403") || lower.includes("unauthorized") || lower.includes("auth")) {
      return {
        shouldRetry: false,
        retryAfterMs: 0,
        reason: "Authentication error or invalid API credentials (Fail-Closed)",
        errorCode: "VTO_AUTH_ERROR",
      };
    }

    // 2. Input validation & corrupt images (400 / Validation / ImageLoad) -> NEVER RETRY
    if (
      lower.includes("400") ||
      lower.includes("validation") ||
      lower.includes("invalid input") ||
      lower.includes("imageloaderror") ||
      lower.includes("could not load")
    ) {
      return {
        shouldRetry: false,
        retryAfterMs: 0,
        reason: "Client input validation failed or image payload is unreadable",
        errorCode: lower.includes("image") ? "VTO_IMAGE_UNREADABLE" : "VTO_INPUT_INVALID",
      };
    }

    // 3. Content safety / Moderation violation -> NEVER RETRY
    if (lower.includes("moderation") || lower.includes("nsfw") || lower.includes("policy")) {
      return {
        shouldRetry: false,
        retryAfterMs: 0,
        reason: "Image rejected by provider content safety policy",
        errorCode: "VTO_CONTENT_BLOCKED",
      };
    }

    // 4. Rate Limits (429 / RateLimit) -> CONTROLLED BACKOFF RETRY
    if (lower.includes("429") || lower.includes("rate limit") || lower.includes("too many requests")) {
      const delay = Math.min(this.maxDelayMs, this.baseDelayMs * Math.pow(2, currentAttempt));
      return {
        shouldRetry: true,
        retryAfterMs: delay,
        reason: "Provider rate limit reached; retrying with exponential backoff",
        errorCode: "VTO_PROVIDER_RATE_LIMIT",
      };
    }

    // 5. Temporary Unavailability (502 / 503 / 504 / Unavailable / GPU busy) -> CONTROLLED RETRY
    if (
      lower.includes("502") ||
      lower.includes("503") ||
      lower.includes("504") ||
      lower.includes("unavailable") ||
      lower.includes("busy")
    ) {
      const delay = Math.min(this.maxDelayMs, this.baseDelayMs * Math.pow(2, currentAttempt));
      return {
        shouldRetry: true,
        retryAfterMs: delay,
        reason: "Provider worker temporarily unavailable; executing controlled retry",
        errorCode: "VTO_PROVIDER_UNAVAILABLE",
      };
    }

    // 6. Generic Internal Server Error (500) -> CONTROLLED RETRY
    if (lower.includes("500") || lower.includes("internal server error")) {
      const delay = Math.min(this.maxDelayMs, this.baseDelayMs * Math.pow(2, currentAttempt));
      return {
        shouldRetry: true,
        retryAfterMs: delay,
        reason: "Internal provider server error; attempting single retry",
        errorCode: "VTO_PROVIDER_FAILED",
      };
    }

    // Default: Non-retryable failure
    return {
      shouldRetry: false,
      retryAfterMs: 0,
      reason: "Non-transient provider failure",
      errorCode: "VTO_PROVIDER_FAILED",
    };
  }
}

export class VtoPredictionPoller {
  private sleepFn: SleepFunction;

  constructor(sleepFn: SleepFunction = (ms) => new Promise((resolve) => setTimeout(resolve, ms))) {
    this.sleepFn = sleepFn;
  }

  /**
   * Polls a job until it completes, fails, is cancelled, or reaches timeout.
   */
  public async pollJob(
    jobId: string,
    queryStatus: (jobId: string) => Promise<{ state: string; error?: string }>,
    profile: VTOPilotProfile,
    isCancelled?: () => boolean
  ): Promise<{ state: string; attempts: number; elapsedMs: number; error?: string }> {
    const startTime = Date.now();
    let attempts = 0;

    while (attempts < profile.maxPollAttempts) {
      attempts++;

      if (isCancelled && isCancelled()) {
        return {
          state: "CANCELLED",
          attempts,
          elapsedMs: Date.now() - startTime,
          error: "Execution was cancelled by client request.",
        };
      }

      if (Date.now() - startTime >= profile.timeoutMs) {
        return {
          state: "TIMEOUT",
          attempts,
          elapsedMs: Date.now() - startTime,
          error: `Virtual Try-On execution exceeded maximum timeout of ${profile.timeoutMs} ms`,
        };
      }

      const status = await queryStatus(jobId);
      const state = status.state.toUpperCase();

      if (state === "RESULT_READY" || state === "COMPLETED") {
        return {
          state: "COMPLETED",
          attempts,
          elapsedMs: Date.now() - startTime,
        };
      }

      if (state === "FAILED" || state === "ERROR") {
        return {
          state: "FAILED",
          attempts,
          elapsedMs: Date.now() - startTime,
          error: status.error || "Provider reported inference failure.",
        };
      }

      if (state === "CANCELLED") {
        return {
          state: "CANCELLED",
          attempts,
          elapsedMs: Date.now() - startTime,
        };
      }

      // Wait interval before next poll
      await this.sleepFn(profile.pollIntervalMs);
    }

    return {
      state: "TIMEOUT",
      attempts,
      elapsedMs: Date.now() - startTime,
      error: `Polling stopped: Exceeded max poll attempts (${profile.maxPollAttempts})`,
    };
  }
}
