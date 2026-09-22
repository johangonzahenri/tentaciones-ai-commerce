/**
 * Domain Contracts for VTO Execution Gateway, Polling Engine, and Result Normalization
 * Defines provider-agnostic execution requests, responses, models, and error taxonomy.
 */

import type { TryOnCategory } from "./vto-contract.js";
import type { PreparedUserImage, PreparedProductImage } from "./vto-image-pipeline-contract.js";

export type FashnModel = "tryon-max" | "tryon-v1.6";

export type VTOExecutionStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMEOUT";

export type VTOErrorCode =
  | "VTO_AUTH_ERROR"
  | "VTO_INPUT_INVALID"
  | "VTO_IMAGE_UNREADABLE"
  | "VTO_PROVIDER_RATE_LIMIT"
  | "VTO_PROVIDER_UNAVAILABLE"
  | "VTO_PROVIDER_FAILED"
  | "VTO_CONTENT_BLOCKED"
  | "VTO_TIMEOUT"
  | "VTO_CANCELLED"
  | "VTO_MISSING_CREDENTIAL"
  | "VTO_RESULT_INVALID"
  | "VTO_DUPLICATE_REQUEST";

export interface VTOPilotProfile {
  provider: "demo-synthetic" | "fashn-pilot";
  model: FashnModel;
  numImages: 1; // Strict single-image inference for pilot to preserve quota
  outputFormat: "png" | "jpeg" | "webp";
  returnBase64: boolean;
  timeoutMs: number;
  pollIntervalMs: number;
  maxPollAttempts: number;
  maxRetries: number;
}

export const DEFAULT_PILOT_PROFILE: VTOPilotProfile = {
  provider: "demo-synthetic",
  model: "tryon-max",
  numImages: 1,
  outputFormat: "png",
  returnBase64: true,
  timeoutMs: 30000,
  pollIntervalMs: 1500,
  maxPollAttempts: 25,
  maxRetries: 2,
};

export interface VirtualTryOnExecutionRequest {
  requestId: string;
  userImage?: PreparedUserImage;
  productImage: PreparedProductImage;
  productCategory: TryOnCategory;
  providerPreference?: "demo-synthetic" | "fashn-pilot";
  modelPreference?: FashnModel;
  userConsentGranted: boolean;
  demoMode: boolean;
  locale?: string;
  metadata?: {
    clientSessionId?: string;
    avatarProfile?: "Nova" | "Sora" | "Mateo";
    idempotencyKey?: string;
  };
}

export interface VirtualTryOnExecutionResult {
  requestId: string;
  jobId: string;
  providerId: string;
  modelName: string;
  status: VTOExecutionStatus;
  resultImageUrl?: string;
  isSyntheticDemo: boolean;
  category: TryOnCategory;
  recommendedSize?: string;
  fitConfidence?: number;
  processingTimeMs: number;
  completedAt: string;
  disclaimer: {
    es: string;
    en: string;
  };
  error?: {
    code: VTOErrorCode;
    message: string;
    retryable: boolean;
  };
  metadata: {
    attempts: number;
    sourceType: "USER_PHOTO" | "SYNTHETIC_AVATAR";
    sanitizedMimeType: string;
    evaluatedResolution: string;
  };
}

export interface RetryEvaluation {
  shouldRetry: boolean;
  retryAfterMs: number;
  reason: string;
  errorCode: VTOErrorCode;
}
