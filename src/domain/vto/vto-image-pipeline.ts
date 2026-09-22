/**
 * TryOnImagePipeline & Input Quality Engine
 * Core Domain Service for Validating, Normalizing, and Preparing User & Garment Images
 */

import {
  type QualityState,
  type ImageFormat,
  type ImageOrientation,
  type TechnicalImageMetadata,
  type ImageQualityAssessment,
  type PreparedUserImage,
  type PreparedProductImage,
  type PilotReadinessResult,
  VTO_IMAGE_LIMITS,
} from "../../contracts/vto-image-pipeline-contract.js";
import type { TryOnCategory } from "../../contracts/vto-contract.js";
import { isCategoryVTOCompatible } from "./vto-capability-resolver.js";

export class TryOnImagePipeline {
  /**
   * Detects and verifies binary magic headers to prevent MIME spoofing,
   * polyglot payloads, and corrupted files.
   */
  public analyzeMagicHeader(buffer: Buffer | Uint8Array): {
    format: ImageFormat;
    mimeType: string;
    valid: boolean;
  } {
    if (!buffer || buffer.length < 12) {
      return { format: "unknown", mimeType: "application/octet-stream", valid: false };
    }

    // JPEG: 0xFF 0xD8 0xFF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { format: "jpeg", mimeType: "image/jpeg", valid: true };
    }

    // PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { format: "png", mimeType: "image/png", valid: true };
    }

    // WebP: RIFF ... WEBP
    if (
      buffer[0] === 0x52 && // R
      buffer[1] === 0x49 && // I
      buffer[2] === 0x46 && // F
      buffer[3] === 0x46 && // F
      buffer[8] === 0x57 && // W
      buffer[9] === 0x45 && // E
      buffer[10] === 0x42 && // B
      buffer[11] === 0x50    // P
    ) {
      return { format: "webp", mimeType: "image/webp", valid: true };
    }

    // SVG textual check
    const headerStr = Buffer.from(buffer.slice(0, 100)).toString("utf8").toLowerCase();
    if (headerStr.includes("<svg") || headerStr.includes("<?xml")) {
      return { format: "svg", mimeType: "image/svg+xml", valid: true };
    }

    return { format: "unknown", mimeType: "application/octet-stream", valid: false };
  }

  /**
   * Safely extracts pixel dimensions directly from image binary headers
   * without requiring native binary dependencies.
   */
  public extractDimensions(
    buffer: Buffer,
    format: ImageFormat
  ): { width: number; height: number } {
    try {
      if (format === "png" && buffer.length >= 24) {
        // PNG IHDR chunk stores dimensions at offset 16 (width) and 20 (height)
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { width, height };
      }

      if (format === "jpeg" && buffer.length > 2) {
        // Parse JPEG markers to locate SOF0 / SOF2 (Start of Frame)
        let offset = 2;
        while (offset < buffer.length - 8) {
          if (buffer[offset] !== 0xff) {
            offset++;
            continue;
          }
          const marker = buffer[offset + 1];
          // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
          if (marker >= 0xc0 && marker <= 0xc3) {
            const height = buffer.readUInt16BE(offset + 5);
            const width = buffer.readUInt16BE(offset + 7);
            return { width, height };
          }
          const length = buffer.readUInt16BE(offset + 2);
          offset += 2 + length;
        }
      }

      if (format === "webp" && buffer.length >= 30) {
        const subchunk = buffer.slice(12, 16).toString("ascii");
        if (subchunk === "VP8 " && buffer.length >= 30) {
          const width = buffer.readUInt16LE(26) & 0x3fff;
          const height = buffer.readUInt16LE(28) & 0x3fff;
          return { width, height };
        }
        if (subchunk === "VP8L" && buffer.length >= 25) {
          const b1 = buffer[21];
          const b2 = buffer[22];
          const b3 = buffer[23];
          const b4 = buffer[24];
          const width = 1 + (((b2 & 0x3f) << 8) | b1);
          const height = 1 + (((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
          return { width, height };
        }
        if (subchunk === "VP8X" && buffer.length >= 30) {
          const width = 1 + buffer.readUIntLE(24, 3);
          const height = 1 + buffer.readUIntLE(27, 3);
          return { width, height };
        }
      }

      if (format === "svg") {
        return { width: 800, height: 1200 };
      }
    } catch {
      // Return fallback dimensions on corrupted chunk parse
    }

    return { width: 0, height: 0 };
  }

  /**
   * Assesses the quality, dimensions, format, and aspect ratio of a user image or avatar.
   */
  public async assessUserImage(input: {
    buffer?: Buffer;
    base64?: string;
    mimeType?: string;
    isAvatar?: boolean;
    avatarProfile?: "Nova" | "Sora" | "Mateo";
    userConsentGranted?: boolean;
    explicitDimensions?: { width: number; height: number };
  }): Promise<{ assessment: ImageQualityAssessment; preparedUserImage?: PreparedUserImage }> {
    const reasons: string[] = [];
    const warnings: string[] = [];

    // Synthetic avatar fast path
    if (input.isAvatar || input.avatarProfile) {
      const profile = input.avatarProfile || "Nova";
      const techMeta: TechnicalImageMetadata = {
        format: "svg",
        mimeType: "image/svg+xml",
        width: 800,
        height: 1200,
        aspectRatio: 1.5,
        orientation: "portrait",
        fileSizeBytes: 2048,
        pixelCount: 960000,
        hasMagicHeader: true,
      };

      const assessment: ImageQualityAssessment = {
        state: "EXCELLENT",
        reasons: [`Synthetic demo avatar profile '${profile}' calibrated for virtual fitting.`],
        warnings: [],
        feedback: {
          es: "Avatar de modelo seleccionado y listo para la prueba virtual.",
          en: "Demo avatar model selected and ready for virtual try-on.",
        },
        technicalSummary: techMeta,
        readyForTryOn: true,
      };

      const preparedUserImage: PreparedUserImage = {
        inputType: "DEMO_AVATAR",
        format: "svg",
        mimeType: "image/svg+xml",
        width: 800,
        height: 1200,
        aspectRatio: 1.5,
        orientation: "portrait",
        quality: "EXCELLENT",
        qualityAssessment: assessment,
        validated: true,
        validatedAt: new Date().toISOString(),
        sourceType: "SYNTHETIC_AVATAR",
      };

      return { assessment, preparedUserImage };
    }

    // Process user photo payload
    let rawBuffer = input.buffer;
    if (!rawBuffer && input.base64) {
      const cleanBase64 = input.base64.replace(/^data:image\/[a-z+]+;base64,/, "");
      rawBuffer = Buffer.from(cleanBase64, "base64");
    }

    if (!rawBuffer || rawBuffer.length === 0) {
      const emptyMeta: TechnicalImageMetadata = {
        format: "unknown",
        mimeType: "application/octet-stream",
        width: 0,
        height: 0,
        aspectRatio: 0,
        orientation: "unknown",
        fileSizeBytes: 0,
        pixelCount: 0,
        hasMagicHeader: false,
      };

      const assessment: ImageQualityAssessment = {
        state: "REJECT",
        reasons: ["No image data provided or empty file payload."],
        warnings: [],
        feedback: {
          es: "No podemos utilizar esta imagen para la prueba virtual. Prueba con una fotografía de cuerpo completo y buena iluminación.",
          en: "We cannot use this image for virtual try-on. Please try with a full-body photo with good lighting.",
        },
        technicalSummary: emptyMeta,
        readyForTryOn: false,
      };

      return { assessment };
    }

    const fileSizeBytes = rawBuffer.length;
    const headerAnalysis = this.analyzeMagicHeader(rawBuffer);

    // Payload size guardrails
    if (fileSizeBytes > VTO_IMAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
      reasons.push(
        `File size (${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 10 MB.`
      );
    }
    if (fileSizeBytes < VTO_IMAGE_LIMITS.MIN_FILE_SIZE_BYTES) {
      reasons.push(
        `File size (${fileSizeBytes} bytes) is too small to contain a valid high-resolution photograph.`
      );
    }

    // Binary magic bytes validation
    if (!headerAnalysis.valid || headerAnalysis.format === "unknown") {
      reasons.push("Invalid image header: File is corrupted, polyglot, or not a supported JPEG/PNG/WebP image.");
    }

    // MIME type consistency check
    if (input.mimeType && headerAnalysis.valid) {
      const claimedMime = input.mimeType.toLowerCase().trim();
      if (!claimedMime.includes(headerAnalysis.format)) {
        warnings.push(
          `Declared MIME '${claimedMime}' differs from binary magic header '${headerAnalysis.mimeType}'. Normalizing to header type.`
        );
      }
    }

    // Extract or assign dimensions
    let dimensions = input.explicitDimensions || this.extractDimensions(rawBuffer, headerAnalysis.format);
    if (dimensions.width === 0 || dimensions.height === 0) {
      // Default to standard portrait if header parser couldn't read chunk safely
      dimensions = { width: 768, height: 1024 };
      warnings.push("Dimension metadata could not be parsed from stream; assigned default bounded frame.");
    }

    const pixelCount = dimensions.width * dimensions.height;
    if (dimensions.width < VTO_IMAGE_LIMITS.MIN_WIDTH || dimensions.height < VTO_IMAGE_LIMITS.MIN_HEIGHT) {
      reasons.push(
        `Image dimensions (${dimensions.width}x${dimensions.height}) below minimum required resolution (${VTO_IMAGE_LIMITS.MIN_WIDTH}x${VTO_IMAGE_LIMITS.MIN_HEIGHT} px).`
      );
    }

    if (dimensions.width > VTO_IMAGE_LIMITS.MAX_WIDTH || dimensions.height > VTO_IMAGE_LIMITS.MAX_HEIGHT) {
      reasons.push(
        `Image dimensions (${dimensions.width}x${dimensions.height}) exceed maximum allowed boundaries (${VTO_IMAGE_LIMITS.MAX_WIDTH}x${VTO_IMAGE_LIMITS.MAX_HEIGHT} px).`
      );
    }

    if (pixelCount > VTO_IMAGE_LIMITS.MAX_PIXEL_COUNT) {
      reasons.push(
        `Total pixel count (${(pixelCount / 1_000_000).toFixed(1)} MP) exceeds maximum safe ceiling (16 MP).`
      );
    }

    const aspectRatio = dimensions.width > 0 ? Number((dimensions.height / dimensions.width).toFixed(2)) : 1.0;
    let orientation: ImageOrientation = "portrait";
    if (aspectRatio > 1.15) {
      orientation = "portrait";
    } else if (aspectRatio < 0.85) {
      orientation = "landscape";
      warnings.push("Fotografía en formato horizontal; es preferible una toma vertical para evaluar el calce completo.");
    } else {
      orientation = "square";
      warnings.push("Fotografía cuadrada; asegúrate de que el torso y prenda superior estén completamente visibles.");
    }

    // Determine QualityState
    let state: QualityState = "EXCELLENT";
    if (reasons.length > 0) {
      state = "REJECT";
    } else if (warnings.length > 0) {
      state = "WARNING";
    } else if (aspectRatio >= 1.25 && fileSizeBytes >= 50 * 1024) {
      state = "EXCELLENT";
    } else {
      state = "ACCEPTABLE";
    }

    const technicalSummary: TechnicalImageMetadata = {
      format: headerAnalysis.format,
      mimeType: headerAnalysis.mimeType,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio,
      orientation,
      fileSizeBytes,
      pixelCount,
      hasMagicHeader: headerAnalysis.valid,
    };

    let feedback = {
      es: "Imagen lista para la prueba virtual. La imagen cumple las condiciones técnicas mínimas para intentar la generación.",
      en: "Image ready for virtual try-on. The image meets the minimum technical conditions to attempt generation.",
    };

    if (state === "WARNING") {
      feedback = {
        es: "La imagen puede producir un resultado menos preciso. Se recomienda fotografía vertical y buena iluminación.",
        en: "The image may produce a less accurate result. A vertical photograph with good lighting is recommended.",
      };
    } else if (state === "REJECT") {
      feedback = {
        es: "No podemos utilizar esta imagen para la prueba virtual. Prueba con una fotografía de cuerpo completo y buena iluminación.",
        en: "We cannot use this image for virtual try-on. Please try with a full-body photo with good lighting.",
      };
    }

    const assessment: ImageQualityAssessment = {
      state,
      reasons,
      warnings,
      feedback,
      technicalSummary,
      readyForTryOn: state !== "REJECT",
    };

    let preparedUserImage: PreparedUserImage | undefined = undefined;
    if (state !== "REJECT") {
      preparedUserImage = {
        inputType: "USER_IMAGE",
        format: headerAnalysis.format,
        mimeType: headerAnalysis.mimeType,
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio,
        orientation,
        quality: state,
        qualityAssessment: assessment,
        validated: true,
        validatedAt: new Date().toISOString(),
        sourceType: "USER_PHOTO",
      };
    }

    return { assessment, preparedUserImage };
  }

  /**
   * Assesses and normalizes product catalog images for compatibility with the VTO engine.
   */
  public async assessProductImage(product: {
    id: string;
    slug: string;
    name: string;
    category: TryOnCategory;
    imageUrl: string;
    dimensions?: { width: number; height: number };
  }): Promise<PreparedProductImage> {
    const isCatSupported = isCategoryVTOCompatible(product.category);
    const dimensions = product.dimensions || { width: 800, height: 1000 };
    const aspectRatio = Number((dimensions.height / dimensions.width).toFixed(2));

    let format: ImageFormat = "jpeg";
    if (product.imageUrl.endsWith(".png")) format = "png";
    else if (product.imageUrl.endsWith(".webp")) format = "webp";
    else if (product.imageUrl.endsWith(".svg")) format = "svg";

    const quality: QualityState = isCatSupported ? "EXCELLENT" : "REJECT";

    return {
      productId: product.id,
      productSlug: product.slug,
      category: product.category,
      format,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio,
      sourceType: "PRODUCT_IMAGE",
      validated: isCatSupported && Boolean(product.imageUrl),
      quality,
      url: product.imageUrl,
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluates readiness for executing a real Virtual Try-On pilot.
   * Fail-Closed check preventing unnecessary network calls if prerequisites are missing.
   */
  public isReadyForRealVTO(params: {
    preparedUserImage?: PreparedUserImage;
    preparedProductImage?: PreparedProductImage;
    hasApiKey: boolean;
    userConsentGranted: boolean;
  }): PilotReadinessResult {
    const reasons: string[] = [];

    const userValid = Boolean(
      params.preparedUserImage &&
      params.preparedUserImage.validated &&
      params.preparedUserImage.quality !== "REJECT"
    );
    if (!userValid) {
      reasons.push("User image is invalid or has not passed technical quality guardrails.");
    }

    const productValid = Boolean(
      params.preparedProductImage &&
      params.preparedProductImage.validated &&
      params.preparedProductImage.quality !== "REJECT"
    );
    if (!productValid) {
      reasons.push("Product image is incompatible or belongs to an unsupported category.");
    }

    if (!params.userConsentGranted) {
      reasons.push("Explicit user privacy consent is required before processing.");
    }

    if (!params.hasApiKey) {
      reasons.push("FASHN API credentials are not configured on the secure server runtime.");
    }

    const ready = userValid && productValid && params.userConsentGranted && params.hasApiKey;

    return {
      ready,
      status: ready ? "READY" : "BLOCKED",
      reasons,
      checklist: {
        userImageValid: userValid,
        productImageValid: productValid,
        providerConfigured: params.hasApiKey,
        userConsentGranted: params.userConsentGranted,
      },
    };
  }
}
