/**
 * Core Domain Contract for AI Virtual Try-On (VTO) Engine
 * Provider-Agnostic Abstraction for Image-Based Try-On Pipelines
 */

export type TryOnState =
  | "IDLE"
  | "INPUT_VALIDATING"
  | "SUBMITTING"
  | "PROCESSING"
  | "RESULT_READY"
  | "FAILED"
  | "CANCELLED";

export type TryOnCategory =
  | "tops"
  | "dresses"
  | "outerwear"
  | "pants"
  | "skirts"
  | "shoes"
  | "accessories";

export type TryOnInputMode = "USER_PHOTO" | "SYNTHETIC_AVATAR";

export type ProductVTOCapability = "SUPPORTED" | "UNSUPPORTED" | "UNKNOWN";

export interface TryOnInput {
  requestId: string;
  productId: string;
  productSlug: string;
  productName: string;
  category: TryOnCategory;
  productImageUrl: string;
  userImageBase64?: string;
  userImageUrl?: string;
  userImageMimeType?: string;
  inputMode: TryOnInputMode;
  selectedAvatarProfile?: "Nova" | "Sora" | "Mateo";
  userConsentGranted: boolean;
  locale?: string;
}

export interface ValidatedTryOnInput extends TryOnInput {
  validatedAt: string;
  sanitizedMimeType: string;
  fileSizeBytes: number;
}

export interface TryOnValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedInput?: ValidatedTryOnInput;
}

export interface TryOnJobSubmission {
  jobId: string;
  providerId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  submittedAt: string;
  estimatedDurationSeconds?: number;
}

export interface TryOnJobStatus {
  jobId: string;
  providerId: string;
  state: TryOnState;
  progressPercent: number;
  stageMessage: {
    es: string;
    en: string;
  };
  updatedAt: string;
  error?: string;
}

export interface TryOnResult {
  jobId: string;
  requestId: string;
  productId: string;
  productName: string;
  status: "SUCCESS" | "FAILED" | "CANCELLED";
  resultImageUrl?: string;
  isSyntheticDemo: boolean;
  providerId: string;
  category: TryOnCategory;
  recommendedSize?: string;
  fitConfidence?: number;
  processingTimeMs: number;
  completedAt: string;
  disclaimer: {
    es: string;
    en: string;
  };
  error?: string;
}

export interface IVirtualTryOnProvider {
  readonly providerId: string;
  readonly isSynthetic: boolean;
  readonly supportedCategories: readonly TryOnCategory[];

  validateInput(input: TryOnInput): TryOnValidationResult;
  prepareInput(input: TryOnInput): Promise<ValidatedTryOnInput>;
  startTryOn(input: ValidatedTryOnInput): Promise<TryOnJobSubmission>;
  getStatus(jobId: string): Promise<TryOnJobStatus>;
  getResult(jobId: string): Promise<TryOnResult>;
  cancel(jobId: string): Promise<void>;
}
