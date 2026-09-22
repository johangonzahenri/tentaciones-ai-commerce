import type { OperationalModeConfig } from "../contracts/operational-mode.js";
import type { TryOnInput, TryOnValidationResult, ValidatedTryOnInput } from "../contracts/vto-contract.js";
import { SecurityViolationError } from "./demo-guardrails.js";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function assertSafeVTOMode(config: OperationalModeConfig, requestedProviderId?: string): void {
  if (config.mode === "PUBLIC_DEMO") {
    if (requestedProviderId && requestedProviderId !== "demo-synthetic") {
      throw new SecurityViolationError(
        `External VTO provider '${requestedProviderId}' is strictly prohibited in PUBLIC_DEMO mode. Use 'demo-synthetic'.`
      );
    }
  }
}

export function validateUserImagePayload(input: TryOnInput): TryOnValidationResult {
  const errors: string[] = [];

  if (!input.requestId || typeof input.requestId !== "string") {
    errors.push("Missing or invalid requestId");
  }

  if (!input.productId || typeof input.productId !== "string") {
    errors.push("Missing or invalid productId");
  }

  if (!input.userConsentGranted) {
    errors.push("User consent must be explicitly granted before processing try-on photo");
  }

  // Handle synthetic avatar preset
  if (input.inputMode === "SYNTHETIC_AVATAR") {
    if (!input.selectedAvatarProfile || !["Nova", "Sora", "Mateo"].includes(input.selectedAvatarProfile)) {
      errors.push("Invalid or missing synthetic avatar profile (must be Nova, Sora, or Mateo)");
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    const validated: ValidatedTryOnInput = {
      ...input,
      validatedAt: new Date().toISOString(),
      sanitizedMimeType: "image/svg+xml",
      fileSizeBytes: 1024,
    };
    return { valid: true, errors: [], sanitizedInput: validated };
  }

  // Handle uploaded user photo
  if (input.inputMode === "USER_PHOTO") {
    const mime = (input.userImageMimeType || "image/jpeg").toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.has(mime)) {
      errors.push(`Unsupported image MIME type '${mime}'. Allowed types: image/jpeg, image/png, image/webp`);
    }

    if (!input.userImageBase64 && !input.userImageUrl) {
      errors.push("User photo must provide base64 payload or verified image URL");
    }

    let approxSizeBytes = 0;
    if (input.userImageBase64) {
      // Calculate byte size from base64 string
      const cleanBase64 = input.userImageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      approxSizeBytes = Math.round((cleanBase64.length * 3) / 4);

      if (approxSizeBytes > MAX_IMAGE_SIZE_BYTES) {
        errors.push(`Image size (${(approxSizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 5 MB`);
      }

      if (approxSizeBytes < 100) {
        errors.push("Image payload is corrupted or too small to be a valid photograph");
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    const validated: ValidatedTryOnInput = {
      ...input,
      userImageMimeType: mime,
      validatedAt: new Date().toISOString(),
      sanitizedMimeType: mime,
      fileSizeBytes: approxSizeBytes,
    };
    return { valid: true, errors: [], sanitizedInput: validated };
  }

  errors.push(`Unknown inputMode '${input.inputMode}'`);
  return { valid: false, errors };
}

export function redactVTOSecrets(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/(?:fa_live_|fashn_)[a-zA-Z0-9_-]+/gi, "[REDACTED_FASHN_KEY]")
    .replace(/sk_live_[a-zA-Z0-9_-]+/gi, "[REDACTED_SECRET]")
    .replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED_TOKEN]")
    .replace(/https:\/\/(?:api\.fashn\.ai|api\.perfectcorp\.com|api\.banuba\.com)[^\s"']*/gi, "[REDACTED_PROVIDER_ENDPOINT]");
}

export function sanitizeVTOResponse<T extends Record<string, unknown>>(payload: T): Partial<T> {
  const sanitized: Record<string, unknown> = {};

  const forbiddenKeys = new Set([
    "apiKey",
    "api_key",
    "token",
    "authorization",
    "Authorization",
    "secret",
    "client_secret",
    "internal_trace",
    "raw_provider_payload",
    "user_image_raw",
  ]);

  for (const [key, value] of Object.entries(payload)) {
    if (forbiddenKeys.has(key) || /apiKey|secret|token|password/i.test(key)) {
      continue;
    } else if (typeof value === "string") {
      sanitized[key] = redactVTOSecrets(value);
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeVTOResponse(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as Partial<T>;
}
