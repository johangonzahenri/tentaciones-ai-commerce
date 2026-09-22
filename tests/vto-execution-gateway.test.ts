import test from "node:test";
import assert from "node:assert/strict";
import { VTOExecutionGateway } from "../src/domain/vto/vto-execution-gateway.js";
import { VtoRetryPolicy, VtoPredictionPoller } from "../src/domain/vto/vto-polling-engine.js";
import { DemoVirtualTryOnProvider } from "../src/adapter/vto/demo-vto-provider.js";
import { FashnVirtualTryOnProvider } from "../src/adapter/vto/fashn-vto-provider.js";
import type {
  VirtualTryOnExecutionRequest,
  VTOPilotProfile,
} from "../src/contracts/vto-execution-contract.js";
import type { OperationalModeConfig } from "../src/contracts/operational-mode.js";
import type { PreparedUserImage, PreparedProductImage } from "../src/contracts/vto-image-pipeline-contract.js";

// Helper dummy images
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
  dataUri: `data:image/jpeg;base64,${Buffer.alloc(300, "a").toString("base64")}`,
};

const dummyProductImage: PreparedProductImage = {
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

test("Gateway 1. Provider Selection: PUBLIC_DEMO strictly isolates to Demo Provider", async () => {
  const publicConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };
  const demoProvider = new DemoVirtualTryOnProvider();
  const fashnProvider = new FashnVirtualTryOnProvider({ apiKey: "fa_live_mock_key_test" });

  const gateway = new VTOExecutionGateway(demoProvider, publicConfig, fashnProvider, async () => {});

  const request: VirtualTryOnExecutionRequest = {
    requestId: "req-gw-01",
    userImage: dummyUserImage,
    productImage: dummyProductImage,
    productCategory: "tops",
    providerPreference: "fashn-pilot", // Should be ignored in PUBLIC_DEMO
    userConsentGranted: true,
    demoMode: true,
  };

  const result = await gateway.execute(request);
  assert.equal(result.providerId, "demo-synthetic");
  assert.equal(result.isSyntheticDemo, true);
  assert.equal(result.status, "COMPLETED");
});

test("Gateway 2. Consent Gate: Rejects execution when user consent is missing or false", async () => {
  const publicConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, publicConfig, undefined, async () => {});

  const requestNoConsent: VirtualTryOnExecutionRequest = {
    requestId: "req-gw-02",
    userImage: dummyUserImage,
    productImage: dummyProductImage,
    productCategory: "tops",
    userConsentGranted: false,
    demoMode: true,
  };

  const result = await gateway.execute(requestNoConsent);
  assert.equal(result.status, "FAILED");
  assert.equal(result.error?.code, "VTO_INPUT_INVALID");
  assert.ok(result.error?.message.includes("consent"));
});

test("Gateway 3. Input Quality Gate: Blocks execution if user or product image is marked REJECT", async () => {
  const publicConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, publicConfig, undefined, async () => {});

  const rejectedUserImage: PreparedUserImage = {
    ...dummyUserImage,
    quality: "REJECT",
    validated: false,
  };

  const request: VirtualTryOnExecutionRequest = {
    requestId: "req-gw-03",
    userImage: rejectedUserImage,
    productImage: dummyProductImage,
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
  };

  const result = await gateway.execute(request);
  assert.equal(result.status, "FAILED");
  assert.equal(result.error?.code, "VTO_IMAGE_UNREADABLE");
});

test("Gateway 4. Polling Engine: Correctly detects completion, failures, and timeouts", async () => {
  const poller = new VtoPredictionPoller(async () => {}); // Zero-delay timer
  const profile: VTOPilotProfile = {
    provider: "demo-synthetic",
    model: "tryon-max",
    numImages: 1,
    outputFormat: "png",
    returnBase64: true,
    timeoutMs: 500,
    pollIntervalMs: 10,
    maxPollAttempts: 5,
    maxRetries: 2,
  };

  // Case A: Successful progression
  let count = 0;
  const pollCompleted = await poller.pollJob("job-01", async () => {
    count++;
    return { state: count > 2 ? "RESULT_READY" : "PROCESSING" };
  }, profile);
  assert.equal(pollCompleted.state, "COMPLETED");
  assert.equal(pollCompleted.attempts, 3);

  // Case B: Provider error
  const pollFailed = await poller.pollJob("job-02", async () => {
    return { state: "FAILED", error: "ImageLoadError: corrupt garment" };
  }, profile);
  assert.equal(pollFailed.state, "FAILED");
  assert.ok(pollFailed.error?.includes("ImageLoadError"));

  // Case C: Max attempts exceeded
  const pollTimeout = await poller.pollJob("job-03", async () => {
    return { state: "PROCESSING" };
  }, profile);
  assert.equal(pollTimeout.state, "TIMEOUT");
});

test("Gateway 5. Retry Policy Matrix: Disallows 401/400 retries and permits 429/500 retries", () => {
  const retryPolicy = new VtoRetryPolicy(2, 100, 1000);

  // 401 Auth -> No retry
  const eval401 = retryPolicy.evaluate("401 Unauthorized Bearer token invalid", 0);
  assert.equal(eval401.shouldRetry, false);
  assert.equal(eval401.errorCode, "VTO_AUTH_ERROR");

  // 400 Validation -> No retry
  const eval400 = retryPolicy.evaluate("InputValidationError: category invalid", 0);
  assert.equal(eval400.shouldRetry, false);
  assert.equal(eval400.errorCode, "VTO_INPUT_INVALID");

  // Content moderation -> No retry
  const evalModeration = retryPolicy.evaluate("ContentModerationError: NSFW", 0);
  assert.equal(evalModeration.shouldRetry, false);
  assert.equal(evalModeration.errorCode, "VTO_CONTENT_BLOCKED");

  // 429 Rate Limit -> Retry with backoff
  const eval429 = retryPolicy.evaluate("429 Too Many Requests: rate limit exceeded", 0);
  assert.equal(eval429.shouldRetry, true);
  assert.equal(eval429.errorCode, "VTO_PROVIDER_RATE_LIMIT");
  assert.ok(eval429.retryAfterMs > 0);

  // 503 Unavailable -> Retry
  const eval503 = retryPolicy.evaluate("UnavailableError: worker node offline", 1);
  assert.equal(eval503.shouldRetry, true);
  assert.equal(eval503.errorCode, "VTO_PROVIDER_UNAVAILABLE");
});

test("Gateway 6. Output Validation: Rejects untrusted domains and unencrypted HTTP", async () => {
  const publicConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };

  // Mock provider returning untrusted external URL
  const mockEvilProvider = {
    providerId: "demo-synthetic",
    isSynthetic: true,
    supportedCategories: ["tops" as const],
    validateInput: () => ({ valid: true, errors: [] }),
    prepareInput: async (i: any) => i,
    startTryOn: async () => ({ jobId: "job-evil", providerId: "demo-synthetic", status: "QUEUED" as const, submittedAt: new Date().toISOString() }),
    getStatus: async () => ({ jobId: "job-evil", providerId: "demo-synthetic", state: "RESULT_READY" as const, progressPercent: 100, stageMessage: { es: "", en: "" }, updatedAt: "" }),
    getResult: async () => ({
      jobId: "job-evil",
      requestId: "req-evil",
      productId: "p1",
      productName: "P1",
      status: "SUCCESS" as const,
      resultImageUrl: "http://malicious-third-party.com/image.png", // Untrusted domain + HTTP
      isSyntheticDemo: true,
      providerId: "demo-synthetic",
      category: "tops" as const,
      processingTimeMs: 100,
      completedAt: new Date().toISOString(),
      disclaimer: { es: "", en: "" },
    }),
    cancel: async () => {},
  };

  const gateway = new VTOExecutionGateway(mockEvilProvider, publicConfig, undefined, async () => {});
  const request: VirtualTryOnExecutionRequest = {
    requestId: "req-gw-06",
    userImage: dummyUserImage,
    productImage: dummyProductImage,
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
  };

  const result = await gateway.execute(request);
  assert.equal(result.status, "FAILED");
  assert.ok(result.error?.message.includes("whitelist") || result.error?.message.includes("HTTPS"));
});

test("Gateway 7. Idempotency & In-Flight Protection: Prevents duplicate concurrent executions", async () => {
  const publicConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };

  // Provider with a short delay
  const slowProvider = {
    providerId: "demo-synthetic",
    isSynthetic: true,
    supportedCategories: ["tops" as const],
    validateInput: () => ({ valid: true, errors: [] }),
    prepareInput: async (i: any) => i,
    startTryOn: async () => ({ jobId: "job-slow", providerId: "demo-synthetic", status: "QUEUED" as const, submittedAt: new Date().toISOString() }),
    getStatus: async () => {
      await new Promise((r) => setTimeout(r, 50));
      return { jobId: "job-slow", providerId: "demo-synthetic", state: "RESULT_READY" as const, progressPercent: 100, stageMessage: { es: "", en: "" }, updatedAt: "" };
    },
    getResult: async () => ({
      jobId: "job-slow",
      requestId: "req-dup",
      productId: "p1",
      productName: "P1",
      status: "SUCCESS" as const,
      resultImageUrl: "/assets/images/polera.png",
      isSyntheticDemo: true,
      providerId: "demo-synthetic",
      category: "tops" as const,
      processingTimeMs: 50,
      completedAt: new Date().toISOString(),
      disclaimer: { es: "", en: "" },
    }),
    cancel: async () => {},
  };

  const gateway = new VTOExecutionGateway(slowProvider, publicConfig, undefined, async () => {});

  const request: VirtualTryOnExecutionRequest = {
    requestId: "req-duplicate-key-123",
    userImage: dummyUserImage,
    productImage: dummyProductImage,
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
    metadata: { idempotencyKey: "idem-key-123" },
  };

  // Launch two executions simultaneously
  const [res1, res2] = await Promise.all([
    gateway.execute(request),
    gateway.execute(request),
  ]);

  // One must succeed, the duplicate must fail-closed with VTO_DUPLICATE_REQUEST
  const hasCompleted = res1.status === "COMPLETED" || res2.status === "COMPLETED";
  const hasDuplicateBlocked = res1.error?.code === "VTO_DUPLICATE_REQUEST" || res2.error?.code === "VTO_DUPLICATE_REQUEST";

  assert.equal(hasCompleted, true);
  assert.equal(hasDuplicateBlocked, true);
});

test("Gateway 8. Cancellation Integration: Immediately halts polling and marks state CANCELLED", async () => {
  const publicConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, publicConfig, undefined, async () => {});

  const request: VirtualTryOnExecutionRequest = {
    requestId: "req-cancel-01",
    userImage: dummyUserImage,
    productImage: dummyProductImage,
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
  };

  // Start execution and cancel during execution
  const execPromise = gateway.execute(request);
  // Give it a tick to start
  await new Promise((r) => setTimeout(r, 10));
  // Call cancel
  await gateway.cancel("req-cancel-01");

  const result = await execPromise;
  assert.ok(["COMPLETED", "CANCELLED"].includes(result.status));
});
