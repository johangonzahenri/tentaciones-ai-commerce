import type {
  IVirtualTryOnProvider,
  TryOnInput,
  TryOnValidationResult,
  TryOnJobSubmission,
  TryOnJobStatus,
  TryOnResult,
} from "../../contracts/vto-contract.js";
import type { OperationalModeConfig } from "../../contracts/operational-mode.js";
import type { Product } from "../types.js";
import { resolveVTOCapability, type VTOCapabilityDescriptor } from "./vto-capability-resolver.js";
import { assertSafeVTOMode, sanitizeVTOResponse } from "../../security/vto-guardrails.js";
import { TryOnImagePipeline } from "./vto-image-pipeline.js";
import type {
  ImageQualityAssessment,
  PreparedUserImage,
  PreparedProductImage,
  PilotReadinessResult,
} from "../../contracts/vto-image-pipeline-contract.js";

export class VirtualTryOnService {
  private provider: IVirtualTryOnProvider;
  private modeConfig: OperationalModeConfig;
  private imagePipeline: TryOnImagePipeline;

  constructor(provider: IVirtualTryOnProvider, modeConfig: OperationalModeConfig) {
    assertSafeVTOMode(modeConfig, provider.providerId);
    this.provider = provider;
    this.modeConfig = modeConfig;
    this.imagePipeline = new TryOnImagePipeline();
  }

  public get activeProviderId(): string {
    return this.provider.providerId;
  }

  public get isSyntheticMode(): boolean {
    return this.provider.isSynthetic;
  }

  public getImagePipeline(): TryOnImagePipeline {
    return this.imagePipeline;
  }

  public resolveCapability(
    product: Pick<Product, "id" | "category" | "name" | "slug"> | { category: string; id?: string; name?: string; slug?: string }
  ): VTOCapabilityDescriptor {
    return resolveVTOCapability(product, this.provider.providerId);
  }

  public async assessUserImage(input: {
    buffer?: Buffer;
    base64?: string;
    mimeType?: string;
    isAvatar?: boolean;
    avatarProfile?: "Nova" | "Sora" | "Mateo";
    userConsentGranted?: boolean;
    explicitDimensions?: { width: number; height: number };
  }): Promise<{ assessment: ImageQualityAssessment; preparedUserImage?: PreparedUserImage }> {
    return this.imagePipeline.assessUserImage(input);
  }

  public async assessProductImage(product: {
    id: string;
    slug: string;
    name: string;
    category: any;
    imageUrl: string;
    dimensions?: { width: number; height: number };
  }): Promise<PreparedProductImage> {
    return this.imagePipeline.assessProductImage(product);
  }

  public checkPilotReadiness(params: {
    preparedUserImage?: PreparedUserImage;
    preparedProductImage?: PreparedProductImage;
    hasApiKey: boolean;
    userConsentGranted: boolean;
  }): PilotReadinessResult {
    return this.imagePipeline.isReadyForRealVTO(params);
  }

  public async validateTryOn(input: TryOnInput): Promise<TryOnValidationResult> {
    assertSafeVTOMode(this.modeConfig, this.provider.providerId);
    return this.provider.validateInput(input);
  }

  public async submitTryOn(input: TryOnInput): Promise<TryOnJobSubmission> {
    assertSafeVTOMode(this.modeConfig, this.provider.providerId);

    const capability = this.resolveCapability({
      id: input.productId,
      category: input.category,
      name: input.productName,
      slug: input.productSlug,
    });

    if (capability.capability === "UNSUPPORTED") {
      throw new Error(`Product ${input.productId} is not supported for Virtual Try-On: ${capability.reason.es}`);
    }

    const validatedInput = await this.provider.prepareInput(input);
    const submission = await this.provider.startTryOn(validatedInput);

    return sanitizeVTOResponse(submission as unknown as Record<string, unknown>) as unknown as TryOnJobSubmission;
  }

  public async checkStatus(jobId: string): Promise<TryOnJobStatus> {
    const status = await this.provider.getStatus(jobId);
    return sanitizeVTOResponse(status as unknown as Record<string, unknown>) as unknown as TryOnJobStatus;
  }

  public async fetchResult(jobId: string): Promise<TryOnResult> {
    const result = await this.provider.getResult(jobId);
    return sanitizeVTOResponse(result as unknown as Record<string, unknown>) as unknown as TryOnResult;
  }

  public async cancelJob(jobId: string): Promise<void> {
    await this.provider.cancel(jobId);
  }
}
