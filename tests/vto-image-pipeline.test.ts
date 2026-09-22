import test from "node:test";
import assert from "node:assert/strict";
import { TryOnImagePipeline } from "../src/domain/vto/vto-image-pipeline.js";
import { VTO_IMAGE_LIMITS, type PreparedUserImage } from "../src/contracts/vto-image-pipeline-contract.js";
import { DemoVirtualTryOnProvider } from "../src/adapter/vto/demo-vto-provider.js";
import { FashnVirtualTryOnProvider } from "../src/adapter/vto/fashn-vto-provider.js";

// Helper function to synthesize valid test image buffers with exact headers and dimensions
function createTestJpegBuffer(width: number, height: number, totalSizeBytes = 10000): Buffer {
  const buf = Buffer.alloc(totalSizeBytes, 0);
  // SOI marker
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  buf[3] = 0xe0; // APP0 marker
  buf[4] = 0x00;
  buf[5] = 0x10; // Length
  // SOF0 marker at offset 20
  buf[20] = 0xff;
  buf[21] = 0xc0;
  buf[22] = 0x00;
  buf[23] = 0x11; // Length
  buf[24] = 0x08; // Precision
  buf.writeUInt16BE(height, 25);
  buf.writeUInt16BE(width, 27);
  buf[29] = 0x03; // Components
  return buf;
}

function createTestPngBuffer(width: number, height: number, totalSizeBytes = 10000): Buffer {
  const buf = Buffer.alloc(totalSizeBytes, 0);
  // PNG signature
  buf.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  // IHDR chunk length (13) + type 'IHDR'
  buf.writeUInt32BE(13, 8);
  buf.write("IHDR", 12, "ascii");
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

function createTestWebpBuffer(width: number, height: number, totalSizeBytes = 10000): Buffer {
  const buf = Buffer.alloc(totalSizeBytes, 0);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(totalSizeBytes - 8, 4);
  buf.write("WEBP", 8, "ascii");
  buf.write("VP8X", 12, "ascii");
  buf.writeUInt32LE(10, 16);
  // VP8X 24-bit width and height (value - 1)
  buf.writeUIntLE(width - 1, 24, 3);
  buf.writeUIntLE(height - 1, 27, 3);
  return buf;
}

test("Pipeline 1. Magic Header Analysis: Accurately identifies JPEG, PNG, and WebP binaries", () => {
  const pipeline = new TryOnImagePipeline();

  const jpegBuf = createTestJpegBuffer(800, 1200);
  const pngBuf = createTestPngBuffer(800, 1200);
  const webpBuf = createTestWebpBuffer(800, 1200);

  const jpegRes = pipeline.analyzeMagicHeader(jpegBuf);
  assert.equal(jpegRes.format, "jpeg");
  assert.equal(jpegRes.mimeType, "image/jpeg");
  assert.equal(jpegRes.valid, true);

  const pngRes = pipeline.analyzeMagicHeader(pngBuf);
  assert.equal(pngRes.format, "png");
  assert.equal(pngRes.mimeType, "image/png");
  assert.equal(pngRes.valid, true);

  const webpRes = pipeline.analyzeMagicHeader(webpBuf);
  assert.equal(webpRes.format, "webp");
  assert.equal(webpRes.mimeType, "image/webp");
  assert.equal(webpRes.valid, true);

  // Corrupted / random binary
  const randomBuf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const randomRes = pipeline.analyzeMagicHeader(randomBuf);
  assert.equal(randomRes.valid, false);
  assert.equal(randomRes.format, "unknown");
});

test("Pipeline 2. Dimension Extraction: Reads dimensions safely from binary chunks", () => {
  const pipeline = new TryOnImagePipeline();

  const jpegBuf = createTestJpegBuffer(768, 1024);
  const jpegDim = pipeline.extractDimensions(jpegBuf, "jpeg");
  assert.equal(jpegDim.width, 768);
  assert.equal(jpegDim.height, 1024);

  const pngBuf = createTestPngBuffer(1080, 1920);
  const pngDim = pipeline.extractDimensions(pngBuf, "png");
  assert.equal(pngDim.width, 1080);
  assert.equal(pngDim.height, 1920);

  const webpBuf = createTestWebpBuffer(600, 900);
  const webpDim = pipeline.extractDimensions(webpBuf, "webp");
  assert.equal(webpDim.width, 600);
  assert.equal(webpDim.height, 900);
});

test("Pipeline 3. User Image Quality: Validates optimal portrait photograph (EXCELLENT)", async () => {
  const pipeline = new TryOnImagePipeline();
  const validJpeg = createTestJpegBuffer(800, 1200, 100 * 1024); // 800x1200, 100KB

  const { assessment, preparedUserImage } = await pipeline.assessUserImage({
    buffer: validJpeg,
    mimeType: "image/jpeg",
    userConsentGranted: true,
  });

  assert.equal(assessment.state, "EXCELLENT");
  assert.equal(assessment.readyForTryOn, true);
  assert.equal(assessment.technicalSummary.orientation, "portrait");
  assert.equal(assessment.technicalSummary.aspectRatio, 1.5);
  assert.ok(preparedUserImage);
  assert.equal(preparedUserImage?.quality, "EXCELLENT");
  assert.equal(preparedUserImage?.validated, true);
  assert.ok(assessment.feedback.es.includes("Imagen lista"));
});

test("Pipeline 4. Orientation Warnings: Flags landscape and square formats (WARNING)", async () => {
  const pipeline = new TryOnImagePipeline();

  // Landscape image 1200x800
  const landscapeBuf = createTestJpegBuffer(1200, 800, 80 * 1024);
  const landscapeRes = await pipeline.assessUserImage({ buffer: landscapeBuf });

  assert.equal(landscapeRes.assessment.state, "WARNING");
  assert.equal(landscapeRes.assessment.technicalSummary.orientation, "landscape");
  assert.ok(landscapeRes.assessment.warnings.length > 0);
  assert.ok(landscapeRes.assessment.feedback.es.includes("menos preciso"));

  // Square image 800x800
  const squareBuf = createTestPngBuffer(800, 800, 80 * 1024);
  const squareRes = await pipeline.assessUserImage({ buffer: squareBuf });
  assert.equal(squareRes.assessment.technicalSummary.orientation, "square");
});

test("Pipeline 5. Negative Test: Rejects oversized images (> 10 MB)", async () => {
  const pipeline = new TryOnImagePipeline();
  // 11 MB buffer
  const oversizedBuf = createTestJpegBuffer(1000, 1500, 11 * 1024 * 1024);
  const { assessment, preparedUserImage } = await pipeline.assessUserImage({ buffer: oversizedBuf });

  assert.equal(assessment.state, "REJECT");
  assert.equal(assessment.readyForTryOn, false);
  assert.equal(preparedUserImage, undefined);
  assert.ok(assessment.reasons.some((r) => r.includes("exceeds maximum allowed limit of 10 MB")));
});

test("Pipeline 6. Negative Test: Rejects too small / truncated files (< 2 KB)", async () => {
  const pipeline = new TryOnImagePipeline();
  const tinyBuf = createTestJpegBuffer(800, 1200, 500); // 500 bytes (< 2KB)
  const { assessment, preparedUserImage } = await pipeline.assessUserImage({ buffer: tinyBuf });

  assert.equal(assessment.state, "REJECT");
  assert.equal(assessment.readyForTryOn, false);
  assert.equal(preparedUserImage, undefined);
  assert.ok(assessment.reasons.some((r) => r.includes("too small")));
});

test("Pipeline 7. Negative Test: Rejects below-minimum resolution (< 384x512)", async () => {
  const pipeline = new TryOnImagePipeline();
  const lowResBuf = createTestJpegBuffer(200, 300, 10 * 1024);
  const { assessment, preparedUserImage } = await pipeline.assessUserImage({ buffer: lowResBuf });

  assert.equal(assessment.state, "REJECT");
  assert.equal(assessment.readyForTryOn, false);
  assert.ok(assessment.reasons.some((r) => r.includes("below minimum required resolution")));
});

test("Pipeline 8. Synthetic Avatar Profile: Fast-path evaluation yields EXCELLENT status", async () => {
  const pipeline = new TryOnImagePipeline();
  const { assessment, preparedUserImage } = await pipeline.assessUserImage({
    isAvatar: true,
    avatarProfile: "Nova",
    userConsentGranted: true,
  });

  assert.equal(assessment.state, "EXCELLENT");
  assert.equal(assessment.readyForTryOn, true);
  assert.equal(preparedUserImage?.inputType, "DEMO_AVATAR");
  assert.equal(preparedUserImage?.sourceType, "SYNTHETIC_AVATAR");
  assert.equal(preparedUserImage?.orientation, "portrait");
});

test("Pipeline 9. Product Image Quality: Validates catalog garment compatibility", async () => {
  const pipeline = new TryOnImagePipeline();

  const validTop = await pipeline.assessProductImage({
    id: "prod-polera-01",
    slug: "polera-essential-negra",
    name: "Polera Essential Negra",
    category: "tops",
    imageUrl: "https://tentaciones.cl/assets/polera.jpg",
    dimensions: { width: 800, height: 1000 },
  });

  assert.equal(validTop.validated, true);
  assert.equal(validTop.quality, "EXCELLENT");
  assert.equal(validTop.sourceType, "PRODUCT_IMAGE");

  const unsupportedShoe = await pipeline.assessProductImage({
    id: "prod-shoe-01",
    slug: "pro-carbon-racer",
    name: "Zapatillas Pro Carbon",
    category: "shoes",
    imageUrl: "https://tentaciones.cl/assets/shoe.jpg",
  });

  assert.equal(unsupportedShoe.validated, false);
  assert.equal(unsupportedShoe.quality, "REJECT");
});

test("Pipeline 10. Privacy & Ephemeral Invariant: Domain contracts do not retain raw image buffers", async () => {
  const pipeline = new TryOnImagePipeline();
  const validJpeg = createTestJpegBuffer(800, 1200, 50 * 1024);

  const { preparedUserImage } = await pipeline.assessUserImage({
    buffer: validJpeg,
    mimeType: "image/jpeg",
    userConsentGranted: true,
  });

  assert.ok(preparedUserImage);
  // Domain entity must contain metadata only
  const keys = Object.keys(preparedUserImage as object);
  assert.ok(!keys.includes("rawBuffer"));
  assert.ok(!keys.includes("buffer"));
  assert.ok(!keys.includes("diskPath"));
  assert.equal(preparedUserImage?.quality, "EXCELLENT");
});

test("Pipeline 11. Provider Swappability: Prepared input interfaces seamlessly with Demo & Fashn", async () => {
  const pipeline = new TryOnImagePipeline();
  const validJpeg = createTestJpegBuffer(800, 1200, 50 * 1024);

  const { preparedUserImage } = await pipeline.assessUserImage({
    buffer: validJpeg,
    mimeType: "image/jpeg",
    userConsentGranted: true,
  });

  assert.ok(preparedUserImage);

  const demoProvider = new DemoVirtualTryOnProvider();
  const fashnProvider = new FashnVirtualTryOnProvider({ apiKey: "fa_live_mock_test_key" });

  const tryOnInput = {
    requestId: "req-swappability-test",
    productId: "prod-polera-01",
    productSlug: "polera-essential",
    productName: "Polera Essential",
    category: "tops" as const,
    productImageUrl: "/assets/images/polera.png",
    inputMode: "USER_PHOTO" as const,
    userImageBase64: validJpeg.toString("base64"),
    userImageMimeType: "image/jpeg",
    userConsentGranted: true,
  };

  const demoValidation = demoProvider.validateInput(tryOnInput);
  const fashnValidation = fashnProvider.validateInput(tryOnInput);

  assert.equal(demoValidation.valid, true);
  assert.equal(fashnValidation.valid, true);
});

test("Pipeline 12. Real Pilot Readiness: isReadyForRealVTO enforces all 4 prerequisites fail-closed", () => {
  const pipeline = new TryOnImagePipeline();

  const dummyUserImage: PreparedUserImage = {
    inputType: "USER_IMAGE",
    format: "jpeg",
    mimeType: "image/jpeg",
    width: 800,
    height: 1200,
    aspectRatio: 1.5,
    orientation: "portrait",
    quality: "EXCELLENT",
    qualityAssessment: {} as any,
    validated: true,
    validatedAt: new Date().toISOString(),
    sourceType: "USER_PHOTO",
  };

  const dummyProductImage = {
    productId: "prod-01",
    productSlug: "polera-01",
    category: "tops" as const,
    format: "jpeg" as const,
    width: 800,
    height: 1000,
    aspectRatio: 1.25,
    sourceType: "PRODUCT_IMAGE" as const,
    validated: true,
    quality: "EXCELLENT" as const,
    url: "/assets/polera.jpg",
    evaluatedAt: new Date().toISOString(),
  };

  // 1. All prerequisites met
  const readyRes = pipeline.isReadyForRealVTO({
    preparedUserImage: dummyUserImage,
    preparedProductImage: dummyProductImage,
    hasApiKey: true,
    userConsentGranted: true,
  });
  assert.equal(readyRes.ready, true);
  assert.equal(readyRes.status, "READY");
  assert.equal(readyRes.reasons.length, 0);

  // 2. Missing API key -> BLOCKED
  const noKeyRes = pipeline.isReadyForRealVTO({
    preparedUserImage: dummyUserImage,
    preparedProductImage: dummyProductImage,
    hasApiKey: false,
    userConsentGranted: true,
  });
  assert.equal(noKeyRes.ready, false);
  assert.equal(noKeyRes.status, "BLOCKED");
  assert.ok(noKeyRes.reasons.some((r) => r.includes("credentials")));

  // 3. Missing user consent -> BLOCKED
  const noConsentRes = pipeline.isReadyForRealVTO({
    preparedUserImage: dummyUserImage,
    preparedProductImage: dummyProductImage,
    hasApiKey: true,
    userConsentGranted: false,
  });
  assert.equal(noConsentRes.ready, false);
  assert.equal(noConsentRes.status, "BLOCKED");
  assert.ok(noConsentRes.reasons.some((r) => r.includes("consent")));
});
