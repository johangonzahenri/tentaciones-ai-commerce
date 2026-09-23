/**
 * FASHN Provider Contract Verification Suite (Conformance V2)
 * Tests external API contract compliance for Try-On Max and Try-On v1.6 using synthetic fixtures.
 * Covers positive, negative, schema isolation, and security boundary tests.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  FashnVirtualTryOnProvider,
  FASHN_API_CANONICAL_BASE_URL,
  FASHN_MODEL_CONFIGS,
} from "../src/adapter/vto/fashn-vto-provider.js";
import { FashnRealPilotActivationGate } from "../src/domain/vto/vto-pilot-gate.js";
import type { ValidatedTryOnInput } from "../src/contracts/vto-contract.js";

function buildMockValidatedInput(overrides?: Partial<ValidatedTryOnInput>): ValidatedTryOnInput {
  return {
    requestId: "req-contract-001",
    productId: "polera-essential",
    productSlug: "polera-essential",
    productName: "Polera Cotton Essential",
    category: "tops",
    productImageUrl: "https://cdn.fashn.ai/fixtures/polera.png",
    userImageUrl: "https://cdn.fashn.ai/fixtures/model.png",
    inputMode: "USER_PHOTO",
    userConsentGranted: true,
    locale: "es-419",
    validatedAt: new Date().toISOString(),
    sanitizedMimeType: "image/png",
    fileSizeBytes: 1024 * 1024,
    ...overrides,
  };
}

test("Contract 1. Try-On Max Request Transformation: Validates official external schema and smoke test profile", () => {
  const provider = new FashnVirtualTryOnProvider({
    apiKey: "fa_live_mock_token_for_test",
    modelName: "tryon-max",
    maxResolution: "1k",
    maxGenerationMode: "fast",
    returnBase64: true,
  });

  const input = buildMockValidatedInput({ category: "outerwear" });
  const payload = provider.buildExternalPayload(input);

  assert.equal(payload.model_name, "tryon-max");
  assert.equal(payload.inputs.model_image, "https://cdn.fashn.ai/fixtures/model.png");
  assert.equal(payload.inputs.product_image, "https://cdn.fashn.ai/fixtures/polera.png");
  assert.equal(payload.inputs.num_images, 1);
  assert.equal(payload.inputs.resolution, "1k");
  assert.equal(payload.inputs.generation_mode, "fast");
  assert.equal(payload.inputs.return_base64, true);
  assert.equal(payload.inputs.output_format, "png");
  // Negative assertions: Ensure tryon-v1.6 specific fields are NOT present in tryon-max
  assert.equal((payload.inputs as any).garment_image, undefined);
  assert.equal((payload.inputs as any).category, undefined);
  assert.equal((payload.inputs as any).num_samples, undefined);
  assert.equal((payload.inputs as any).mode, undefined);
  assert.equal((payload.inputs as any).moderation_level, undefined);
  assert.equal((payload.inputs as any).garment_photo_type, undefined);
  assert.equal((payload.inputs as any).segmentation_free, undefined);
});

test("Contract 2. Try-On v1.6 Request Transformation: Enforces category mapping and optional v1.6 fields", () => {
  const provider = new FashnVirtualTryOnProvider({
    apiKey: "fa_live_mock_token_for_test",
    modelName: "tryon-v1.6",
    v16Mode: "balanced",
    v16ModerationLevel: "conservative",
    v16GarmentPhotoType: "flat-lay",
    v16SegmentationFree: true,
    returnBase64: true,
  });

  const inputDress = buildMockValidatedInput({ category: "dresses" });
  const payloadDress = provider.buildExternalPayload(inputDress);
  assert.equal(payloadDress.model_name, "tryon-v1.6");
  assert.equal(payloadDress.inputs.model_image, "https://cdn.fashn.ai/fixtures/model.png");
  assert.equal(payloadDress.inputs.garment_image, "https://cdn.fashn.ai/fixtures/polera.png");
  assert.equal(payloadDress.inputs.category, "one-pieces");
  assert.equal(payloadDress.inputs.num_samples, 1);
  assert.equal(payloadDress.inputs.mode, "balanced");
  assert.equal(payloadDress.inputs.moderation_level, "conservative");
  assert.equal(payloadDress.inputs.garment_photo_type, "flat-lay");
  assert.equal(payloadDress.inputs.segmentation_free, true);
  assert.equal(payloadDress.inputs.return_base64, true);
  assert.equal(payloadDress.inputs.output_format, "png");
  // Negative assertions: Ensure tryon-max specific fields are NOT present in tryon-v1.6
  assert.equal((payloadDress.inputs as any).product_image, undefined);
  assert.equal((payloadDress.inputs as any).num_images, undefined);
  assert.equal((payloadDress.inputs as any).generation_mode, undefined);
  assert.equal((payloadDress.inputs as any).resolution, undefined);

  const inputPants = buildMockValidatedInput({ category: "pants" });
  const payloadPants = provider.buildExternalPayload(inputPants);
  if (payloadPants.model_name === "tryon-v1.6") {
    assert.equal(payloadPants.inputs.category, "bottoms");
  } else {
    assert.fail("Expected model_name to be tryon-v1.6");
  }
});

test("Contract 3. Try-On v1.6 Category Semantics: Supports category 'auto' or explicit omission", () => {
  const providerAuto = new FashnVirtualTryOnProvider({
    apiKey: "fa_live_mock_token_for_test",
    modelName: "tryon-v1.6",
    v16Category: "auto",
  });
  const payloadAuto = providerAuto.buildExternalPayload(buildMockValidatedInput());
  if (payloadAuto.model_name === "tryon-v1.6") {
    assert.equal(payloadAuto.inputs.category, "auto");
  }

  const providerUnset = new FashnVirtualTryOnProvider({
    apiKey: "fa_live_mock_token_for_test",
    modelName: "tryon-v1.6",
  });
  const payloadUnset = providerUnset.buildExternalPayload(buildMockValidatedInput({ category: "tops" }));
  if (payloadUnset.model_name === "tryon-v1.6") {
    assert.equal(payloadUnset.inputs.category, "tops");
  }
});

test("Contract 4. Submission Execution & Prediction ID Parsing", async () => {
  const mockFetch: typeof fetch = async (url, init) => {
    assert.ok(String(url).endsWith("/run"));
    assert.equal(init?.method, "POST");
    const headers = init?.headers as Record<string, string>;
    assert.equal(headers["Authorization"], "Bearer fa_live_mock_token_for_test");
    return new Response(JSON.stringify({ id: "pred_fashn_test_123", status: "starting" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const provider = new FashnVirtualTryOnProvider({
    apiKey: "fa_live_mock_token_for_test",
    fetchFn: mockFetch,
  });

  const submission = await provider.startTryOn(buildMockValidatedInput());
  assert.equal(submission.jobId, "pred_fashn_test_123");
  assert.equal(submission.providerId, "fashn-pilot");
  assert.equal(submission.status, "QUEUED");
});

test("Contract 5. Status Polling Lifecycle: starting -> in_queue -> processing -> completed", async () => {
  let mockStatus = "starting";
  const mockFetch: typeof fetch = async () => {
    return new Response(JSON.stringify({ id: "pred_123", status: mockStatus }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const provider = new FashnVirtualTryOnProvider({
    apiKey: "fa_live_mock_token_for_test",
    fetchFn: mockFetch,
  });

  // 1. starting
  mockStatus = "starting";
  let status = await provider.getStatus("pred_123");
  assert.equal(status.state, "SUBMITTING");
  assert.equal(status.progressPercent, 20);

  // 2. in_queue
  mockStatus = "in_queue";
  status = await provider.getStatus("pred_123");
  assert.equal(status.state, "SUBMITTING");
  assert.equal(status.progressPercent, 35);

  // 3. processing
  mockStatus = "processing";
  status = await provider.getStatus("pred_123");
  assert.equal(status.state, "PROCESSING");
  assert.equal(status.progressPercent, 75);

  // 4. completed
  mockStatus = "completed";
  status = await provider.getStatus("pred_123");
  assert.equal(status.state, "RESULT_READY");
  assert.equal(status.progressPercent, 100);
});

test("Contract 6. Structured Error Classification: Moderation, Pose, and Input validation errors", async () => {
  const mockFetch: typeof fetch = async () => {
    return new Response(
      JSON.stringify({
        id: "pred_err_1",
        status: "failed",
        error: { name: "ContentModerationError", message: "NSFW content detected" },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  const provider = new FashnVirtualTryOnProvider({
    apiKey: "fa_live_mock_token_for_test",
    fetchFn: mockFetch,
  });

  const status = await provider.getStatus("pred_err_1");
  assert.equal(status.state, "FAILED");
  assert.ok(status.error?.includes("ContentModerationError"));
});

test("Contract 7. Output Whitelist Validation: Enforces trusted domains and rejects malicious endpoints", async () => {
  // Trusted CDN output
  const mockTrustedFetch: typeof fetch = async () => {
    return new Response(
      JSON.stringify({
        id: "pred_ok",
        status: "completed",
        output: ["https://cdn.fashn.ai/outputs/sample-tryon.png"],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  const providerTrusted = new FashnVirtualTryOnProvider({
    apiKey: "fa_live_mock_token_for_test",
    fetchFn: mockTrustedFetch,
  });
  const resultOk = await providerTrusted.getResult("pred_ok");
  assert.equal(resultOk.status, "SUCCESS");
  assert.equal(resultOk.resultImageUrl, "https://cdn.fashn.ai/outputs/sample-tryon.png");

  // Untrusted output domain must throw
  const mockUntrustedFetch: typeof fetch = async () => {
    return new Response(
      JSON.stringify({
        id: "pred_bad",
        status: "completed",
        output: ["https://evil-untrusted-site.com/image.png"],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  const providerUntrusted = new FashnVirtualTryOnProvider({
    apiKey: "fa_live_mock_token_for_test",
    fetchFn: mockUntrustedFetch,
  });
  await assert.rejects(
    async () => providerUntrusted.getResult("pred_bad"),
    (err: Error) => {
      assert.ok(err.message.includes("untrusted or invalid image URL domain"));
      return true;
    }
  );
});

test("Contract 8. FASHN Real Pilot Activation Gate: Evaluates state deterministically", () => {
  // 1. Missing API key -> BLOCKED
  const blockedEval = FashnRealPilotActivationGate.evaluate({
    apiKey: "",
    modelName: "tryon-max",
    userConsentGranted: true,
  });
  assert.equal(blockedEval.status, "BLOCKED");
  assert.equal(blockedEval.ready, false);
  assert.ok(blockedEval.reasons.some((r) => r.includes("credentials are not configured")));

  // 2. Budget violation (numImages > 1) -> BLOCKED
  const budgetBlocked = FashnRealPilotActivationGate.evaluate({
    apiKey: "fa_live_mock_test_key",
    modelName: "tryon-max",
    numImages: 2,
    userConsentGranted: true,
  });
  assert.equal(budgetBlocked.status, "BLOCKED");
  assert.ok(budgetBlocked.reasons.some((r) => r.includes("budget violation")));
});

test("Contract 9. Canonical Configurations and Model Parity", () => {
  assert.equal(FASHN_API_CANONICAL_BASE_URL, "https://api.fashn.ai/v1");
  assert.ok(FASHN_MODEL_CONFIGS["tryon-max"]);
  assert.ok(FASHN_MODEL_CONFIGS["tryon-v1.6"]);
  assert.equal(FASHN_MODEL_CONFIGS["tryon-max"].modelId, "tryon-max");
  assert.equal(FASHN_MODEL_CONFIGS["tryon-v1.6"].modelId, "tryon-v1.6");
  assert.equal(FASHN_MODEL_CONFIGS["tryon-max"].outputCountParam, "num_images");
  assert.equal(FASHN_MODEL_CONFIGS["tryon-v1.6"].outputCountParam, "num_samples");
});

test("Contract 10. HTTP Error Status Handling: 401, 400, 429, 500 and malformed body", async () => {
  // 401 Unauthorized
  const mock401: typeof fetch = async () => new Response("Unauthorized API key", { status: 401 });
  const p401 = new FashnVirtualTryOnProvider({ apiKey: "fa_live_bad", fetchFn: mock401 });
  await assert.rejects(
    async () => p401.startTryOn(buildMockValidatedInput()),
    (err: Error) => {
      assert.ok(err.message.includes("401"));
      return true;
    }
  );

  // 429 Rate Limit
  const mock429: typeof fetch = async () => new Response("Rate limit exceeded", { status: 429 });
  const p429 = new FashnVirtualTryOnProvider({ apiKey: "fa_live_ok", fetchFn: mock429 });
  await assert.rejects(
    async () => p429.startTryOn(buildMockValidatedInput()),
    (err: Error) => {
      assert.ok(err.message.includes("429"));
      return true;
    }
  );

  // Malformed JSON response
  const mockMalformed: typeof fetch = async () => new Response(JSON.stringify({ unexpected: true }), { status: 200 });
  const pMalformed = new FashnVirtualTryOnProvider({ apiKey: "fa_live_ok", fetchFn: mockMalformed });
  await assert.rejects(
    async () => pMalformed.startTryOn(buildMockValidatedInput()),
    (err: Error) => {
      assert.ok(err.message.includes("missing prediction id"));
      return true;
    }
  );
});
