/**
 * VTO Execution Gateway
 * Central coordination layer enforcing consent, provider selection, timeout,
 * polling, output domain validation, and result normalization.
 */

import type {
  VirtualTryOnExecutionRequest,
  VirtualTryOnExecutionResult,
  VTOPilotProfile,
  VTOErrorCode,
  VTOExecutionStatus,
} from "../../contracts/vto-execution-contract.js";
import { DEFAULT_PILOT_PROFILE } from "../../contracts/vto-execution-contract.js";
import type { IVirtualTryOnProvider, TryOnInput, TryOnCategory } from "../../contracts/vto-contract.js";
import type { OperationalModeConfig } from "../../contracts/operational-mode.js";
import { assertSafeVTOMode, sanitizeVTOResponse, redactVTOSecrets } from "../../security/vto-guardrails.js";
import { VtoPredictionPoller, VtoRetryPolicy, type SleepFunction } from "./vto-polling-engine.js";

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
  private activeJobs = new Map<string, { jobId: string; providerId: string; cancelled: boolean }>();
  private inFlightRequests = new Set<string>();

  constructor(
    demoProvider: IVirtualTryOnProvider,
    modeConfig: OperationalModeConfig,
    fashnProvider?: IVirtualTryOnProvider,
    customSleep?: SleepFunction
  ) {
    this.demoProvider = demoProvider;
    this.modeConfig = modeConfig;
    this.fashnProvider = fashnProvider;
    this.poller = new VtoPredictionPoller(customSleep);
    this.retryPolicy = new VtoRetryPolicy();
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
    const idempotencyKey = request.metadata?.idempotencyKey || request.requestId;

    // 1. Duplicate Request / In-Flight Protection
    if (this.inFlightRequests.has(idempotencyKey)) {
      return this.buildErrorResult(
        request,
        "VTO_DUPLICATE_REQUEST",
        "A virtual try-on execution is already in flight for this request ID.",
        profile.provider,
        profile.model,
        "n/a",
        Date.now() - startTime
      );
    }
    this.inFlightRequests.add(idempotencyKey);

    try {
      // 2. Consent Gate Verification
      if (!request.userConsentGranted) {
        return this.buildErrorResult(
          request,
          "VTO_INPUT_INVALID",
          "Explicit user privacy consent must be granted before attempting Virtual Try-On.",
          profile.provider,
          profile.model,
          "n/a",
          Date.now() - startTime
        );
      }

      // 3. Input Readiness & Quality Gate
      if (request.userImage && request.userImage.quality === "REJECT") {
        return this.buildErrorResult(
          request,
          "VTO_IMAGE_UNREADABLE",
          "User photo does not meet minimum technical resolution or format standards.",
          profile.provider,
          profile.model,
          "n/a",
          Date.now() - startTime
        );
      }

      if (request.productImage && request.productImage.quality === "REJECT") {
        return this.buildErrorResult(
          request,
          "VTO_INPUT_INVALID",
          `Product image is not compatible for 2D Virtual Try-On category: ${request.productCategory}`,
          profile.provider,
          profile.model,
          "n/a",
          Date.now() - startTime
        );
      }

      // 4. Provider Selection Policy
      const selectedProvider = this.selectProvider(request, profile);
      assertSafeVTOMode(this.modeConfig, selectedProvider.providerId);

      // 5. Convert neutral request into TryOnInput payload
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

      // 6. Submit Job to Provider
      const preparedInput = await selectedProvider.prepareInput(tryOnInput);
      const submission = await selectedProvider.startTryOn(preparedInput);

      const jobRecord = { jobId: submission.jobId, providerId: selectedProvider.providerId, cancelled: false };
      this.activeJobs.set(submission.jobId, jobRecord);
      this.activeJobs.set(request.requestId, jobRecord);

      // 7. Polling with Bounded Execution
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
        return this.buildCancelledResult(request, selectedProvider.providerId, profile.model, submission.jobId, Date.now() - startTime);
      }

      if (pollResult.state === "TIMEOUT") {
        return this.buildErrorResult(
          request,
          "VTO_TIMEOUT",
          pollResult.error || "Execution timed out.",
          selectedProvider.providerId,
          profile.model,
          submission.jobId,
          Date.now() - startTime
        );
      }

      if (pollResult.state === "FAILED") {
        const retryEval = this.retryPolicy.evaluate(pollResult.error || "Inference failed", 0);
        return this.buildErrorResult(
          request,
          retryEval.errorCode,
          pollResult.error || "Provider inference failed.",
          selectedProvider.providerId,
          profile.model,
          submission.jobId,
          Date.now() - startTime,
          retryEval.shouldRetry
        );
      }

      // 8. Fetch Result & Validate Output
      const rawResult = await selectedProvider.getResult(submission.jobId);
      const validatedOutputUrl = this.validateOutputUrl(rawResult.resultImageUrl);

      // 9. Normalize Result
      const normalizedResult: VirtualTryOnExecutionResult = {
        requestId: request.requestId,
        jobId: submission.jobId,
        providerId: selectedProvider.providerId,
        modelName: profile.model,
        status: "COMPLETED",
        resultImageUrl: validatedOutputUrl,
        isSyntheticDemo: selectedProvider.isSynthetic,
        category: request.productCategory,
        recommendedSize: rawResult.recommendedSize || "M",
        fitConfidence: rawResult.fitConfidence ?? 90,
        processingTimeMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
        disclaimer: rawResult.disclaimer,
        metadata: {
          attempts: pollResult.attempts,
          sourceType: request.userImage?.sourceType || "SYNTHETIC_AVATAR",
          sanitizedMimeType: request.userImage?.mimeType || "image/svg+xml",
          evaluatedResolution: `${request.userImage?.width || 800}x${request.userImage?.height || 1200}`,
        },
      };

      return sanitizeVTOResponse(normalizedResult as unknown as Record<string, unknown>) as unknown as VirtualTryOnExecutionResult;
    } catch (err: unknown) {
      const errMessage = (err as Error).message || "Unknown error";
      const retryEval = this.retryPolicy.evaluate(errMessage, 0);

      return this.buildErrorResult(
        request,
        retryEval.errorCode,
        redactVTOSecrets(errMessage),
        profile.provider,
        profile.model,
        "err",
        Date.now() - startTime,
        retryEval.shouldRetry
      );
    } finally {
      this.inFlightRequests.delete(idempotencyKey);
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
    retryable = false
  ): VirtualTryOnExecutionResult {
    return {
      requestId: request.requestId,
      jobId,
      providerId,
      modelName,
      status: "FAILED",
      isSyntheticDemo: providerId === "demo-synthetic",
      category: request.productCategory,
      processingTimeMs: durationMs,
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
    durationMs: number
  ): VirtualTryOnExecutionResult {
    return {
      requestId: request.requestId,
      jobId,
      providerId,
      modelName,
      status: "CANCELLED",
      isSyntheticDemo: providerId === "demo-synthetic",
      category: request.productCategory,
      processingTimeMs: durationMs,
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
