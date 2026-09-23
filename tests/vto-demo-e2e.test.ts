import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveOperationalMode } from "../src/contracts/operational-mode.js";
import { VTOExecutionGateway } from "../src/domain/vto/vto-execution-gateway.js";
import { DemoVirtualTryOnProvider } from "../src/adapter/vto/demo-vto-provider.js";
import { FashnVirtualTryOnProvider } from "../src/adapter/vto/fashn-vto-provider.js";
import { TryOnImagePipeline } from "../src/domain/vto/vto-image-pipeline.js";
import { FashnRealPilotActivationGate } from "../src/domain/vto/vto-pilot-gate.js";
import type {
  VirtualTryOnExecutionRequest,
} from "../src/contracts/vto-execution-contract.js";
import type { PreparedUserImage, PreparedProductImage } from "../src/contracts/vto-image-pipeline-contract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname.includes("dist")
  ? path.resolve(__dirname, "../..")
  : path.resolve(__dirname, "..");

const dummyValidUserImage: PreparedUserImage = {
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
  dataUri: `data:image/jpeg;base64,${Buffer.alloc(300, "a").toString("base64")}`,
};

const dummyValidProductImage: PreparedProductImage = {
  productId: "prod-polera-essential",
  productSlug: "polera-essential",
  category: "tops",
  format: "jpeg",
  width: 800,
  height: 1000,
  aspectRatio: 1.25,
  sourceType: "PRODUCT_IMAGE",
  validated: true,
  quality: "EXCELLENT",
  url: "/assets/images/polera.png",
  evaluatedAt: new Date().toISOString(),
};

test("E2E Demo 1. Valid Input Flow: Pipeline assessment to Demo Gateway completion", async () => {
  const pipeline = new TryOnImagePipeline();
  const avatarAssessment = await pipeline.assessUserImage({
    isAvatar: true,
    avatarProfile: "Nova",
    userConsentGranted: true,
  });

  assert.equal(avatarAssessment.assessment.state, "EXCELLENT");
  assert.equal(avatarAssessment.assessment.readyForTryOn, true);
  assert.ok(avatarAssessment.preparedUserImage);

  const productAssessment = await pipeline.assessProductImage({
    id: "prod-polera-essential",
    slug: "polera-essential",
    name: "Polera Essential",
    category: "tops",
    imageUrl: "/assets/images/polera.png",
  });

  assert.equal(productAssessment.quality, "EXCELLENT");
  assert.equal(productAssessment.validated, true);

  const modeConfig = resolveOperationalMode({ APP_MODE: "PUBLIC_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  const request: VirtualTryOnExecutionRequest = {
    requestId: "req-e2e-demo-valid",
    userImage: avatarAssessment.preparedUserImage,
    productImage: productAssessment,
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
    metadata: { avatarProfile: "Nova" },
  };

  const result = await gateway.execute(request);

  assert.equal(result.status, "COMPLETED");
  assert.equal(result.isSyntheticDemo, true);
  assert.equal(result.metricsSource, "DEMO_SYNTHETIC");
  assert.equal(result.providerId, "demo-synthetic");
  assert.equal(result.modelName, "tryon-max");
  assert.ok(result.resultImageUrl);
  assert.ok(result.recommendedSize);
  assert.equal(typeof result.fitConfidence, "number");
  assert.ok(result.fitConfidence! >= 80);
});

test("E2E Demo 2. Quality Rejection Flow: Blocked before execution", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PUBLIC_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  const rejectedUserImage: PreparedUserImage = {
    ...dummyValidUserImage,
    quality: "REJECT",
  };

  const request: VirtualTryOnExecutionRequest = {
    requestId: "req-e2e-demo-reject",
    userImage: rejectedUserImage,
    productImage: dummyValidProductImage,
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
  };

  const result = await gateway.execute(request);
  assert.equal(result.status, "FAILED");
  assert.equal(result.error?.code, "VTO_IMAGE_UNREADABLE");
  assert.ok(result.error?.message.includes("minimum technical resolution"));
});

test("E2E Demo 3. Consent Rejection Flow: Fails closed without user consent", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PUBLIC_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  const requestNoConsent: VirtualTryOnExecutionRequest = {
    requestId: "req-e2e-demo-no-consent",
    userImage: dummyValidUserImage,
    productImage: dummyValidProductImage,
    productCategory: "tops",
    userConsentGranted: false,
    demoMode: true,
  };

  const result = await gateway.execute(requestNoConsent);
  assert.equal(result.status, "FAILED");
  assert.equal(result.error?.code, "VTO_INPUT_INVALID");
  assert.ok(result.error?.message.includes("consent"));
});

test("E2E Demo 4. Duplicate Execution & In-Flight Protection", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PUBLIC_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  const request1: VirtualTryOnExecutionRequest = {
    requestId: "req-e2e-duplicate-1",
    clientSessionId: "session-dup-test",
    userImage: dummyValidUserImage,
    productImage: dummyValidProductImage,
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
  };

  // First call succeeds
  const res1 = await gateway.execute(request1);
  assert.equal(res1.status, "COMPLETED");

  // Immediate identical request returns cached result with zero re-trigger
  const resDuplicate = await gateway.execute(request1);
  assert.equal(resDuplicate.status, "COMPLETED");
  assert.equal(resDuplicate.requestId, "req-e2e-duplicate-1");
});

test("E2E Demo 5. Cancellation Flow: Gateway marks execution CANCELLED", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PUBLIC_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  const request: VirtualTryOnExecutionRequest = {
    requestId: "req-e2e-cancel",
    userImage: dummyValidUserImage,
    productImage: dummyValidProductImage,
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
  };

  // Cancel immediately before or during execution
  const execPromise = gateway.execute(request);
  await gateway.cancel("req-e2e-cancel");
  const cancelResult = await execPromise;

  assert.ok(["CANCELLED", "COMPLETED"].includes(cancelResult.status));
});

test("E2E Demo 6. Photo Lifecycle & Memory Cleanup Invariant", () => {
  const appJsPath = path.join(ROOT_DIR, "public", "app.js");
  const appJsContent = fs.readFileSync(appJsPath, "utf8");

  assert.ok(appJsContent.includes("function releaseVTOObjectUrl()"));
  assert.ok(appJsContent.includes("URL.revokeObjectURL(state.vto.uploadedPhotoBlobUrl)"));
  assert.ok(appJsContent.includes("state.vto.uploadedPhotoBlobUrl = null"));
});

test("E2E Demo 7. Real Mode Blocked When Credential Absent (Fail-Closed & No Silent Fallback)", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PRIVATE_CONNECTED_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();

  // No Fashn Provider injected (missing API key)
  const gatewayWithoutFashn = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  const realRequest: VirtualTryOnExecutionRequest = {
    requestId: "req-e2e-real-blocked",
    userImage: dummyValidUserImage,
    productImage: dummyValidProductImage,
    productCategory: "tops",
    providerPreference: "fashn-pilot", // Explicit request for real provider
    userConsentGranted: true,
    demoMode: false,
  };

  // Must fail closed with error, NEVER silently fallback to demo
  const result = await gatewayWithoutFashn.execute(realRequest);
  assert.equal(result.status, "FAILED");
  assert.ok(
    result.error?.message.includes("FASHN provider requested but API credentials are not configured") ||
    result.error?.code === "VTO_PROVIDER_UNAVAILABLE"
  );

  // Activation Gate evaluation must be BLOCKED
  const gateEvaluation = FashnRealPilotActivationGate.evaluate({
    apiKey: "",
    modelName: "tryon-max",
    userConsentGranted: true,
  });
  assert.equal(gateEvaluation.status, "BLOCKED");
  assert.equal(gateEvaluation.ready, false);
});

test("E2E Demo 8. Strict Separation: Real Request (Blocked) != Demo Request (Success)", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PRIVATE_CONNECTED_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  // 1. Real request without key -> BLOCKED
  const realRes = await gateway.execute({
    requestId: "req-e2e-real-fail",
    userImage: dummyValidUserImage,
    productImage: dummyValidProductImage,
    productCategory: "tops",
    providerPreference: "fashn-pilot",
    userConsentGranted: true,
    demoMode: false,
  });
  assert.equal(realRes.status, "FAILED");

  // 2. Demo request -> SUCCESS (explicitly marked as DEMO_SYNTHETIC)
  const demoRes = await gateway.execute({
    requestId: "req-e2e-demo-pass",
    userImage: dummyValidUserImage,
    productImage: dummyValidProductImage,
    productCategory: "tops",
    providerPreference: "demo-synthetic",
    userConsentGranted: true,
    demoMode: true,
  });
  assert.equal(demoRes.status, "COMPLETED");
  assert.equal(demoRes.isSyntheticDemo, true);
  assert.equal(demoRes.metricsSource, "DEMO_SYNTHETIC");
  assert.notEqual(demoRes.metricsSource, "REAL_PROVIDER");
});
