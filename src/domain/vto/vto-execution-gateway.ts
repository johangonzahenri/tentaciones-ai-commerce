/**
 * VTO Execution Gateway (Hardened)
 * Central coordination layer enforcing consent, quality gates, idempotency,
 * concurrency limits, cost guardrails, circuit breakers, timeout, cancellation,
 * bounded polling, and structured observability.
 */

import type {
  VirtualTryOnExecutionRequest,
  VirtualTryOnExecutionResult,
  VTOPilotProfile,
  VTOErrorCode,
  VTOExecutionStatus,
} from "../../contracts/vto-execution-contract.js";
import { DEFAULT_PILOT_PROFILE } from "../../contracts/vto-execution-contract.js";
import type { IVirtualTryOnProvider, TryOnInput } from "../../contracts/vto-contract.js";
import type { OperationalModeConfig } from "../../contracts/operational-mode.js";
import { assertSafeVTOMode, sanitizeVTOResponse, redactVTOSecrets } from "../../security/vto-guardrails.js";
import { VtoPredictionPoller, VtoRetryPolicy, type SleepFunction } from "./vto-polling-engine.js";
import {
  VTOConcurrencyManager,
  assertVTOCostBudget,
  VTOProviderCircuitBreaker,
  VTORateLimiter,
} from "./vto-operational-guards.js";
import { VTOLogger } from "./vto-observability.js";

const ALLOWED_OUTPUT_DOMAINS = [
  "https://cdn.fashn.ai/",
  "https://media.fashn.ai/",
];

export class VTOExecutionGateway {
  private demoProvider: IVirtualTryOnProvider;
  private fashnProvider?: IVirtualTryOnProvider;
  private modeConfig: OperationalModeConfig;
  private poller: VtoPredictionPoller;
  private retryPolicy: VtoRetryPolicy;
  private concurrencyManager: VTOConcurrencyManager;
  private circuitBreaker: VTOProviderCircuitBreaker;
  private rateLimiter: VTORateLimiter;
  private activeJobs = new Map<string, { jobId: string; providerId: string; cancelled: boolean; timedOut: boolean }>();

  constructor(
    demoProvider: IVirtualTryOnProvider,
    modeConfig: OperationalModeConfig,
    fashnProvider?: IVirtualTryOnProvider,
    customSleep?: SleepFunction,
    concurrencyManager?: VTOConcurrencyManager,
    circuitBreaker?: VTOProviderCircuitBreaker,
    rateLimiter?: VTORateLimiter
  ) {
    this.demoProvider = demoProvider;
    this.modeConfig = modeConfig;
    this.fashnProvider = fashnProvider;
    this.poller = new VtoPredictionPoller(customSleep);
    this.retryPolicy = new VtoRetryPolicy();
    this.concurrencyManager = concurrencyManager || new VTOConcurrencyManager();
    this.circuitBreaker = circuitBreaker || new VTOProviderCircuitBreaker();
    this.rateLimiter = rateLimiter || new VTORateLimiter();
  }

  public getConcurrencyManager(): VTOConcurrencyManager {
    return this.concurrencyManager;
  }

  public getCircuitBreaker(): VTOProviderCircuitBreaker {
    return this.circuitBreaker;
  }

  public getRateLimiter(): VTORateLimiter {
    return this.rateLimiter;
  }

  /**
   * Primary entry point to execute an end-to-end Virtual Try-On workflow.
   */
  public async execute(
    request: VirtualTryOnExecutionRequest,
    customProfile?: Partial<VTOPilotProfile>
  ): Promise<VirtualTryOnExecutionResult> {
    const profile: VTOPilotProfile = { ...DEFAULT_PILOT_PROFILE, ...customProfile };
    const startTime = Date.now();
    const executionId = `vto-exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = request.metadata?.idempotencyKey || request.requestId;
    const clientSessionId = request.clientSessionId || request.metadata?.clientSessionId;

    VTOLogger.logEvent({
      eventType: "vto.execution.started",
      executionId,
      requestId: request.requestId,
      clientSessionId,
      providerId: profile.provider,
      isSynthetic: profile.provider === "demo-synthetic",
      modelName: profile.model,
    });

    // 1. Cost & Execution Budget Validation
    try {
      assertVTOCostBudget(profile);
    } catch (budgetErr: unknown) {
      const msg = (budgetErr as Error).message;
      VTOLogger.logEvent({
        eventType: "vto.execution.failed",
        executionId,
        requestId: request.requestId,
        clientSessionId,
        providerId: profile.provider,
        isSynthetic: true,
        errorCode: "VTO_COST_LIMIT_EXCEEDED",
        errorSummary: msg,
      });
      return this.buildErrorResult(
        request,
        "VTO_COST_LIMIT_EXCEEDED",
        msg,
        profile.provider,
        profile.model,
        "n/a",
        Date.now() - startTime,
        false,
        executionId,
        clientSessionId
      );
    }

    // 2. Rate Limiting Guard
    const rateCheckKey = clientSessionId || request.requestId;
    const rateResult = this.rateLimiter.checkLimit(rateCheckKey);
    if (!rateResult.allowed) {
      VTOLogger.logEvent({
        eventType: "vto.rate_limit.exceeded",
        executionId,
        requestId: request.requestId,
        clientSessionId,
        providerId: profile.provider,
        isSynthetic: true,
        errorCode: "VTO_PROVIDER_RATE_LIMIT",
        errorSummary: `Rate limit exceeded for session ${rateCheckKey}`,
      });
      return this.buildErrorResult(
        request,
        "VTO_PROVIDER_RATE_LIMIT",
        "Rate limit exceeded. Please wait before submitting another Virtual Try-On request.",
        profile.provider,
        profile.model,
        "n/a",
        Date.now() - startTime,
        true,
        executionId,
        clientSessionId
      );
    }

    // 3. Idempotency & Concurrency Management
    const lock = this.concurrencyManager.acquireExecution(idempotencyKey, clientSessionId);
    if (!lock.allowed) {
      if (lock.cachedResult) {
        return lock.cachedResult;
      }
      const errCode: VTOErrorCode = lock.reason === "SESSION_CONCURRENCY_LIMIT"
        ? "VTO_CONCURRENCY_LIMIT"
        : "VTO_DUPLICATE_REQUEST";
      const errMsg = lock.reason === "SESSION_CONCURRENCY_LIMIT"
        ? "A virtual try-on session is already active for this client session. Please wait for completion."
        : "A virtual try-on execution is already in flight for this request ID.";

      VTOLogger.logEvent({
        eventType: "vto.execution.failed",
        executionId,
        requestId: request.requestId,
        clientSessionId,
        providerId: profile.provider,
        isSynthetic: true,
        errorCode: errCode,
        errorSummary: errMsg,
      });

      return this.buildErrorResult(
        request,
        errCode,
        errMsg,
        profile.provider,
        profile.model,
        "n/a",
        Date.now() - startTime,
        false,
        executionId,
        clientSessionId
      );
    }

    let finalResult: VirtualTryOnExecutionResult | undefined;

    try {
      // 4. Consent Gate Verification
      if (!request.userConsentGranted) {
        finalResult = this.buildErrorResult(
          request,
          "VTO_INPUT_INVALID",
          "Explicit user privacy consent must be granted before attempting Virtual Try-On.",
          profile.provider,
          profile.model,
          "n/a",
          Date.now() - startTime,
          false,
          executionId,
          clientSessionId
        );
        return finalResult;
      }

      // 5. Input Readiness & Quality Gate
      if (request.userImage && request.userImage.quality === "REJECT") {
        finalResult = this.buildErrorResult(
          request,
          "VTO_IMAGE_UNREADABLE",
          "User photo does not meet minimum technical resolution or format standards.",
          profile.provider,
          profile.model,
          "n/a",
          Date.now() - startTime,
          false,
          executionId,
          clientSessionId
        );
        return finalResult;
      }

      if (request.productImage && request.productImage.quality === "REJECT") {
        finalResult = this.buildErrorResult(
          request,
          "VTO_INPUT_INVALID",
          `Product image is not compatible for 2D Virtual Try-On category: ${request.productCategory}`,
          profile.provider,
          profile.model,
          "n/a",
          Date.now() - startTime,
          false,
          executionId,
          clientSessionId
        );
        return finalResult;
      }

      // 6. Provider Selection Policy & Circuit Breaker
      const selectedProvider = this.selectProvider(request, profile);
      assertSafeVTOMode(this.modeConfig, selectedProvider.providerId);

      if (this.circuitBreaker.isCircuitOpen(selectedProvider.providerId)) {
        finalResult = this.buildErrorResult(
          request,
          "VTO_CIRCUIT_OPEN",
          `Provider '${selectedProvider.providerId}' is temporarily unavailable due to consecutive downstream failures.`,
          selectedProvider.providerId,
          profile.model,
          "n/a",
          Date.now() - startTime,
          true,
          executionId,
          clientSessionId
        );
        return finalResult;
      }

      VTOLogger.logEvent({
        eventType: "vto.provider.selected",
        executionId,
        requestId: request.requestId,
        clientSessionId,
        providerId: selectedProvider.providerId,
        isSynthetic: selectedProvider.isSynthetic,
      });

      // 7. Convert neutral request into TryOnInput payload
      const tryOnInput: TryOnInput = {
        requestId: request.requestId,
        productId: request.productImage.productId,
        productSlug: request.productImage.productSlug,
        productName: request.productImage.productId,
        category: request.productCategory,
        productImageUrl: request.productImage.url,
        inputMode: request.userImage?.sourceType === "USER_PHOTO" ? "USER_PHOTO" : "SYNTHETIC_AVATAR",
        selectedAvatarProfile: request.metadata?.avatarProfile || "Nova",
        userConsentGranted: request.userConsentGranted,
        userImageBase64: request.userImage?.dataUri,
        userImageMimeType: request.userImage?.mimeType,
        locale: request.locale || "es-419",
      };

      // 8. Submit Job to Provider
      const preparedInput = await selectedProvider.prepareInput(tryOnInput);
      const submission = await selectedProvider.startTryOn(preparedInput);

      const jobRecord = {
        jobId: submission.jobId,
        providerId: selectedProvider.providerId,
        cancelled: false,
        timedOut: false,
      };
      this.activeJobs.set(submission.jobId, jobRecord);
      this.activeJobs.set(request.requestId, jobRecord);

      VTOLogger.logEvent({
        eventType: "vto.job.submitted",
        executionId,
        requestId: request.requestId,
        clientSessionId,
        providerId: selectedProvider.providerId,
        isSynthetic: selectedProvider.isSynthetic,
      });

      // 9. Polling with Bounded Execution & Cancellation Watcher
      const pollResult = await this.poller.pollJob(
        submission.jobId,
        async (id) => {
          const status = await selectedProvider.getStatus(id);
          return { state: status.state, error: status.error };
        },
        profile,
        () => jobRecord.cancelled
      );

      if (pollResult.state === "CANCELLED") {
        finalResult = this.buildCancelledResult(
          request,
          selectedProvider.providerId,
          profile.model,
          submission.jobId,
          Date.now() - startTime,
          executionId,
          clientSessionId
        );
        VTOLogger.logEvent({
          eventType: "vto.execution.cancelled",
          executionId,
          requestId: request.requestId,
          clientSessionId,
          providerId: selectedProvider.providerId,
          isSynthetic: selectedProvider.isSynthetic,
          durationMs: Date.now() - startTime,
        });
        return finalResult;
      }

      if (pollResult.state === "TIMEOUT") {
        jobRecord.timedOut = true;
        finalResult = this.buildErrorResult(
          request,
          "VTO_TIMEOUT",
          pollResult.error || "Execution timed out.",
          selectedProvider.providerId,
          profile.model,
          submission.jobId,
          Date.now() - startTime,
          false,
          executionId,
          clientSessionId
        );
        VTOLogger.logEvent({
          eventType: "vto.execution.timeout",
          executionId,
          requestId: request.requestId,
          clientSessionId,
          providerId: selectedProvider.providerId,
          isSynthetic: selectedProvider.isSynthetic,
          durationMs: Date.now() - startTime,
        });
        return finalResult;
      }

      if (pollResult.state === "FAILED") {
        this.circuitBreaker.recordFailure(selectedProvider.providerId);
        const retryEval = this.retryPolicy.evaluate(pollResult.error || "Inference failed", 0);
        finalResult = this.buildErrorResult(
          request,
          retryEval.errorCode,
          pollResult.error || "Provider inference failed.",
          selectedProvider.providerId,
          profile.model,
          submission.jobId,
          Date.now() - startTime,
          retryEval.shouldRetry,
          executionId,
          clientSessionId
        );
        VTOLogger.logEvent({
          eventType: "vto.execution.failed",
          executionId,
          requestId: request.requestId,
          clientSessionId,
          providerId: selectedProvider.providerId,
          isSynthetic: selectedProvider.isSynthetic,
          errorCode: retryEval.errorCode,
          errorSummary: pollResult.error,
        });
        return finalResult;
      }

      // 10. Fetch Result & Validate Output (Guard against Stale/Late Callback)
      if (jobRecord.cancelled || jobRecord.timedOut) {
        finalResult = this.buildErrorResult(
          request,
          "VTO_STALE_EXECUTION",
          "Result arrived after job cancellation or timeout; dropped to prevent stale state.",
          selectedProvider.providerId,
          profile.model,
          submission.jobId,
          Date.now() - startTime,
          false,
          executionId,
          clientSessionId
        );
        return finalResult;
      }

      const rawResult = await selectedProvider.getResult(submission.jobId);
      const validatedOutputUrl = this.validateOutputUrl(rawResult.resultImageUrl);
      this.circuitBreaker.recordSuccess(selectedProvider.providerId);

      // 11. Normalize Result
      const totalDuration = Date.now() - startTime;
      const normalizedResult: VirtualTryOnExecutionResult = {
        requestId: request.requestId,
        jobId: submission.jobId,
        executionId,
        clientSessionId,
        providerId: selectedProvider.providerId,
        modelName: profile.model,
        status: "COMPLETED",
        resultImageUrl: validatedOutputUrl,
        isSyntheticDemo: selectedProvider.isSynthetic,
        metricsSource: selectedProvider.isSynthetic ? "DEMO_SYNTHETIC" : "REAL_PROVIDER",
        category: request.productCategory,
        recommendedSize: rawResult.recommendedSize || "M",
        fitConfidence: rawResult.fitConfidence ?? 90,
        processingTimeMs: totalDuration,
        inferenceLatencyMs: selectedProvider.isSynthetic ? 120 : totalDuration,
        totalDurationMs: totalDuration,
        completedAt: new Date().toISOString(),
        disclaimer: rawResult.disclaimer,
        metadata: {
          attempts: pollResult.attempts,
          pollCount: pollResult.attempts,
          retryCount: 0,
          sourceType: request.userImage?.sourceType || "SYNTHETIC_AVATAR",
          sanitizedMimeType: request.userImage?.mimeType || "image/svg+xml",
          evaluatedResolution: `${request.userImage?.width || 800}x${request.userImage?.height || 1200}`,
        },
      };

      finalResult = sanitizeVTOResponse(
        normalizedResult as unknown as Record<string, unknown>
      ) as unknown as VirtualTryOnExecutionResult;

      VTOLogger.logEvent({
        eventType: "vto.execution.completed",
        executionId,
        requestId: request.requestId,
        clientSessionId,
        providerId: selectedProvider.providerId,
        isSynthetic: selectedProvider.isSynthetic,
        durationMs: totalDuration,
        inferenceLatencyMs: normalizedResult.inferenceLatencyMs,
      });

      return finalResult;
    } catch (err: unknown) {
      const errMessage = (err as Error).message || "Unknown error";
      const retryEval = this.retryPolicy.evaluate(errMessage, 0);

      finalResult = this.buildErrorResult(
        request,
        retryEval.errorCode,
        redactVTOSecrets(errMessage),
        profile.provider,
        profile.model,
        "err",
        Date.now() - startTime,
        retryEval.shouldRetry,
        executionId,
        clientSessionId
      );

      VTOLogger.logEvent({
        eventType: "vto.execution.failed",
        executionId,
        requestId: request.requestId,
        clientSessionId,
        providerId: profile.provider,
        isSynthetic: true,
        errorCode: retryEval.errorCode,
        errorSummary: errMessage,
      });

      return finalResult;
    } finally {
      this.concurrencyManager.releaseExecution(idempotencyKey, clientSessionId, finalResult);
    }
  }

  /**
   * Cancels an ongoing try-on job.
   */
  public async cancel(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.cancelled = true;
      if (job.providerId === this.demoProvider.providerId) {
        await this.demoProvider.cancel(jobId);
      } else if (this.fashnProvider && job.providerId === this.fashnProvider.providerId) {
        await this.fashnProvider.cancel(jobId);
      }
    }
  }

  private selectProvider(
    request: VirtualTryOnExecutionRequest,
    profile: VTOPilotProfile
  ): IVirtualTryOnProvider {
    // PUBLIC_DEMO: Strictly Demo provider
    if (this.modeConfig.mode === "PUBLIC_DEMO" || request.demoMode) {
      return this.demoProvider;
    }

    // PRIVATE_CONNECTED_DEMO: Allow FASHN if configured and preferred
    if (
      this.modeConfig.mode === "PRIVATE_CONNECTED_DEMO" &&
      (request.providerPreference === "fashn-pilot" || profile.provider === "fashn-pilot")
    ) {
      if (this.fashnProvider) {
        return this.fashnProvider;
      }
      throw new Error("FASHN provider requested but API credentials are not configured on server.");
    }

    return this.demoProvider;
  }

  private validateOutputUrl(url?: string): string | undefined {
    if (!url) return undefined;

    // 1. Data URI format is trusted (ephemeral Base64)
    if (url.startsWith("data:image/")) {
      return url;
    }

    // 2. Local synthetic showcase assets are trusted
    if (url.startsWith("/assets/")) {
      return url;
    }

    // 3. Whitelisted HTTPS CDN domains
    const isWhitelisted = ALLOWED_OUTPUT_DOMAINS.some((domain) => url.startsWith(domain));
    if (!isWhitelisted) {
      throw new Error(`Output URL '${url}' violates domain whitelist guardrails.`);
    }

    // 4. Must use HTTPS
    if (!url.startsWith("https://")) {
      throw new Error("Output URL must use secure HTTPS protocol.");
    }

    return url;
  }

  private buildErrorResult(
    request: VirtualTryOnExecutionRequest,
    code: VTOErrorCode,
    message: string,
    providerId: string,
    modelName: string,
    jobId: string,
    durationMs: number,
    retryable = false,
    executionId?: string,
    clientSessionId?: string
  ): VirtualTryOnExecutionResult {
    return {
      requestId: request.requestId,
      jobId,
      executionId,
      clientSessionId,
      providerId,
      modelName,
      status: "FAILED",
      isSyntheticDemo: providerId === "demo-synthetic",
      metricsSource: providerId === "demo-synthetic" ? "DEMO_SYNTHETIC" : "REAL_PROVIDER",
      category: request.productCategory,
      processingTimeMs: durationMs,
      totalDurationMs: durationMs,
      completedAt: new Date().toISOString(),
      disclaimer: {
        es: "El procesamiento no pudo completarse con éxito.",
        en: "Processing could not be completed successfully.",
      },
      error: {
        code,
        message: redactVTOSecrets(message),
        retryable,
      },
      metadata: {
        attempts: 1,
        sourceType: request.userImage?.sourceType || "SYNTHETIC_AVATAR",
        sanitizedMimeType: request.userImage?.mimeType || "image/svg+xml",
        evaluatedResolution: `${request.userImage?.width || 0}x${request.userImage?.height || 0}`,
      },
    };
  }

  private buildCancelledResult(
    request: VirtualTryOnExecutionRequest,
    providerId: string,
    modelName: string,
    jobId: string,
    durationMs: number,
    executionId?: string,
    clientSessionId?: string
  ): VirtualTryOnExecutionResult {
    return {
      requestId: request.requestId,
      jobId,
      executionId,
      clientSessionId,
      providerId,
      modelName,
      status: "CANCELLED",
      isSyntheticDemo: providerId === "demo-synthetic",
      metricsSource: providerId === "demo-synthetic" ? "DEMO_SYNTHETIC" : "REAL_PROVIDER",
      category: request.productCategory,
      processingTimeMs: durationMs,
      totalDurationMs: durationMs,
      completedAt: new Date().toISOString(),
      disclaimer: {
        es: "Proceso cancelado por el usuario.",
        en: "Process cancelled by user.",
      },
      error: {
        code: "VTO_CANCELLED",
        message: "Virtual try-on execution cancelled.",
        retryable: false,
      },
      metadata: {
        attempts: 1,
        sourceType: request.userImage?.sourceType || "SYNTHETIC_AVATAR",
        sanitizedMimeType: request.userImage?.mimeType || "image/svg+xml",
        evaluatedResolution: `${request.userImage?.width || 0}x${request.userImage?.height || 0}`,
      },
    };
  }
}
