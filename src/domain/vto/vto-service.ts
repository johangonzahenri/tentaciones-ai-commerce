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

export class VirtualTryOnService {
  private provider: IVirtualTryOnProvider;
  private modeConfig: OperationalModeConfig;

  constructor(provider: IVirtualTryOnProvider, modeConfig: OperationalModeConfig) {
    assertSafeVTOMode(modeConfig, provider.providerId);
    this.provider = provider;
    this.modeConfig = modeConfig;
  }

  public get activeProviderId(): string {
    return this.provider.providerId;
  }

  public get isSyntheticMode(): boolean {
    return this.provider.isSynthetic;
  }

  public resolveCapability(product: Pick<Product, "id" | "category" | "name" | "slug"> | { category: string; id?: string; name?: string; slug?: string }): VTOCapabilityDescriptor {
    return resolveVTOCapability(product, this.provider.providerId);
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
