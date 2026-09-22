/**
 * Image Pipeline Contracts & Quality Engine Definitions for AI Virtual Try-On
 * Provider-Agnostic Abstraction for User Photo and Garment Asset Preparation
 */

import type { TryOnCategory } from "./vto-contract.js";

export type QualityState = "EXCELLENT" | "ACCEPTABLE" | "WARNING" | "REJECT" | "UNKNOWN";

export type ImageInputType = "USER_IMAGE" | "PRODUCT_IMAGE" | "DEMO_AVATAR";

export type ImageOrientation = "portrait" | "landscape" | "square" | "unknown";

export type ImageFormat = "jpeg" | "png" | "webp" | "svg" | "unknown";

export interface ImageDimensionLimits {
  readonly MIN_WIDTH: number;
  readonly MIN_HEIGHT: number;
  readonly MAX_WIDTH: number;
  readonly MAX_HEIGHT: number;
  readonly MIN_FILE_SIZE_BYTES: number;
  readonly MAX_FILE_SIZE_BYTES: number;
  readonly MAX_PIXEL_COUNT: number;
}

export const VTO_IMAGE_LIMITS: ImageDimensionLimits = {
  MIN_WIDTH: 384,          // Minimum width required for neural pose estimation and garment landmarking
  MIN_HEIGHT: 512,         // Minimum height for proper upper-body and full-body vertical resolution
  MAX_WIDTH: 4096,         // Guardrail against high-memory decompression hazards / zip-bombs
  MAX_HEIGHT: 4096,        // Guardrail against oversized aspect ratios
  MIN_FILE_SIZE_BYTES: 2048, // 2 KB minimum to prevent truncated or empty byte streams
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB maximum payload boundary
  MAX_PIXEL_COUNT: 16 * 1024 * 1024,    // 16 Megapixels maximum pixel area
};

export interface TechnicalImageMetadata {
  format: ImageFormat;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: ImageOrientation;
  fileSizeBytes: number;
  pixelCount: number;
  hasMagicHeader: boolean;
}

export interface ImageQualityAssessment {
  state: QualityState;
  reasons: string[];
  warnings: string[];
  feedback: {
    es: string;
    en: string;
  };
  technicalSummary: TechnicalImageMetadata;
  readyForTryOn: boolean;
}

export interface PreparedUserImage {
  inputType: "USER_IMAGE" | "DEMO_AVATAR";
  format: ImageFormat;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: ImageOrientation;
  quality: QualityState;
  qualityAssessment: ImageQualityAssessment;
  validated: boolean;
  validatedAt: string;
  sourceType: "USER_PHOTO" | "SYNTHETIC_AVATAR";
  // Ephemeral payload for single-request transport only, stripped upon domain finalization
  dataUri?: string;
}

export interface PreparedProductImage {
  productId: string;
  productSlug: string;
  category: TryOnCategory;
  format: ImageFormat;
  width: number;
  height: number;
  aspectRatio: number;
  sourceType: "PRODUCT_IMAGE";
  validated: boolean;
  quality: QualityState;
  url: string;
  evaluatedAt: string;
}

export interface PilotReadinessResult {
  ready: boolean;
  status: "READY" | "BLOCKED";
  reasons: string[];
  checklist: {
    userImageValid: boolean;
    productImageValid: boolean;
    providerConfigured: boolean;
    userConsentGranted: boolean;
  };
}
