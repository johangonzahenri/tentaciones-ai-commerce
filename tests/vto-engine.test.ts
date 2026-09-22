import test from "node:test";
import assert from "node:assert/strict";
import { resolveVTOCapability, isCategoryVTOCompatible } from "../src/domain/vto/vto-capability-resolver.js";
import {
  assertSafeVTOMode,
  validateUserImagePayload,
  sanitizeVTOResponse,
  redactVTOSecrets,
} from "../src/security/vto-guardrails.js";
import { DemoVirtualTryOnProvider } from "../src/adapter/vto/demo-vto-provider.js";
import { FashnVirtualTryOnProvider } from "../src/adapter/vto/fashn-vto-provider.js";
import { VirtualTryOnService } from "../src/domain/vto/vto-service.js";
import { createVTOProvider, createVTOService } from "../src/adapter/vto/vto-provider-factory.js";
import type { OperationalModeConfig } from "../src/contracts/operational-mode.js";
import type { TryOnInput } from "../src/contracts/vto-contract.js";

test("VTO 1. Capability Resolver: Maps apparel categories to TryOnCategory correctly", () => {
  assert.equal(resolveVTOCapability({ category: "poleras" }).mappedCategory, "tops");
  assert.equal(resolveVTOCapability({ category: "camisas" }).mappedCategory, "tops");
  assert.equal(resolveVTOCapability({ category: "polerones" }).mappedCategory, "tops");
  assert.equal(resolveVTOCapability({ category: "chaquetas" }).mappedCategory, "outerwear");
  assert.equal(resolveVTOCapability({ category: "vestidos" }).mappedCategory, "dresses");
  assert.equal(resolveVTOCapability({ category: "pantalones" }).mappedCategory, "pants");
  assert.equal(resolveVTOCapability({ category: "faldas" }).mappedCategory, "skirts");
  assert.equal(resolveVTOCapability({ category: "calzado" }).capability, "UNSUPPORTED");
  assert.equal(resolveVTOCapability({ category: "accesorios" }).capability, "UNSUPPORTED");
  assert.equal(resolveVTOCapability({ category: "unknown_cat" }).capability, "UNSUPPORTED");

  assert.equal(isCategoryVTOCompatible("poleras"), true);
  assert.equal(isCategoryVTOCompatible("vestidos"), true);
  assert.equal(isCategoryVTOCompatible("calzado"), false);
  assert.equal(isCategoryVTOCompatible("accesorios"), false);
});

test("VTO 2. Guardrails: assertSafeVTOMode enforces fail-closed isolation in PUBLIC_DEMO", () => {
  const publicConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };

  // Safe with Demo provider
  assert.doesNotThrow(() => assertSafeVTOMode(publicConfig, "demo-synthetic"));

  // Throws if external provider is attempted in PUBLIC_DEMO
  assert.throws(
    () => assertSafeVTOMode(publicConfig, "fashn-pilot"),
    /strictly prohibited in PUBLIC_DEMO/
  );

  // Allowed in PRIVATE_CONNECTED_DEMO
  const privateConfig: OperationalModeConfig = {
    mode: "PRIVATE_CONNECTED_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };
  assert.doesNotThrow(() => assertSafeVTOMode(privateConfig, "fashn-pilot"));
});

test("VTO 3. Guardrails: validateUserImagePayload validates consent, mime and size", () => {
  const validAvatarInput: TryOnInput = {
    requestId: "req-001",
    productId: "prod-polera-essential",
    productSlug: "polera-essential",
    productName: "Polera Essential",
    category: "tops",
    productImageUrl: "/assets/images/polera.png",
    inputMode: "SYNTHETIC_AVATAR",
    selectedAvatarProfile: "Nova",
    userConsentGranted: true,
  };
  const validRes = validateUserImagePayload(validAvatarInput);
  assert.equal(validRes.valid, true);

  // Fails if user consent is missing
  const noConsentInput: TryOnInput = {
    ...validAvatarInput,
    userConsentGranted: false,
  };
  const noConsentRes = validateUserImagePayload(noConsentInput);
  assert.equal(noConsentRes.valid, false);
  assert.ok(noConsentRes.errors.some((e) => e.includes("consent")));

  // Valid user photo
  const validPhotoInput: TryOnInput = {
    ...validAvatarInput,
    inputMode: "USER_PHOTO",
    userImageBase64: Buffer.alloc(300, "a").toString("base64"),
    userImageMimeType: "image/jpeg",
    userConsentGranted: true,
  };
  const validPhotoRes = validateUserImagePayload(validPhotoInput);
  assert.equal(validPhotoRes.valid, true);

  // Invalid MIME
  const invalidMimeInput: TryOnInput = {
    ...validPhotoInput,
    userImageMimeType: "image/gif",
  };
  const invalidMimeRes = validateUserImagePayload(invalidMimeInput);
  assert.equal(invalidMimeRes.valid, false);

  // Oversized photo > 5MB
  const oversizedBase64 = "A".repeat(8 * 1024 * 1024); // ~6MB
  const oversizedInput: TryOnInput = {
    ...validPhotoInput,
    userImageBase64: oversizedBase64,
  };
  const oversizedRes = validateUserImagePayload(oversizedInput);
  assert.equal(oversizedRes.valid, false);
});

test("VTO 4. Guardrails: sanitizeVTOResponse and redactVTOSecrets protect sensitive information", () => {
  const payloadWithSecrets = {
    message: "Operation completed",
    fashnApiKey: "fa_live_secret_key_12345678",
    authorization: "Bearer secret-token-xyz",
  };
  const sanitized = sanitizeVTOResponse(payloadWithSecrets) as Record<string, unknown>;
  assert.equal(sanitized.fashnApiKey, undefined);
  assert.equal(sanitized.authorization, undefined);

  const textWithKey = "Connecting to https://api.fashn.ai with key fa_live_1234567890abcdef";
  const redacted = redactVTOSecrets(textWithKey);
  assert.ok(!redacted.includes("fa_live_1234567890abcdef"));
  assert.ok(redacted.includes("[REDACTED_FASHN_KEY]"));
});

test("VTO 5. Demo Provider: Completes deterministic offline pipeline with realistic output", async () => {
  const provider = new DemoVirtualTryOnProvider();
  assert.equal(provider.providerId, "demo-synthetic");
  assert.equal(provider.isSynthetic, true);
  assert.ok(provider.supportedCategories.includes("tops"));

  const input: TryOnInput = {
    requestId: "req-002",
    productId: "prod-polera-essential",
    productSlug: "polera-essential",
    productName: "Polera Essential",
    category: "tops",
    productImageUrl: "/assets/images/polera.png",
    inputMode: "SYNTHETIC_AVATAR",
    selectedAvatarProfile: "Nova",
    userConsentGranted: true,
  };

  const prepared = await provider.prepareInput(input);
  const submission = await provider.startTryOn(prepared);

  assert.ok(submission.jobId.startsWith("vto-job-"));
  assert.equal(submission.status, "QUEUED");

  const status = await provider.getStatus(submission.jobId);
  assert.ok(["IDLE", "INPUT_VALIDATING", "SUBMITTING", "PROCESSING", "RESULT_READY"].includes(status.state));

  const result = await provider.getResult(submission.jobId);
  assert.equal(result.status, "SUCCESS");
  assert.ok(result.resultImageUrl && result.resultImageUrl.length > 0);
  assert.ok(result.recommendedSize && result.recommendedSize.length > 0);
  assert.ok(result.fitConfidence && result.fitConfidence >= 90);
  assert.equal(result.providerId, "demo-synthetic");
});

test("VTO 6. FASHN Provider: Validates configuration and handles missing credentials fail-closed", async () => {
  assert.throws(
    () => new FashnVirtualTryOnProvider({ apiKey: "" }),
    /FashnVirtualTryOnProvider requires a valid server-side API key/
  );

  const providerWithKey = new FashnVirtualTryOnProvider({ apiKey: "fa_live_mock_key_for_test" });
  assert.equal(providerWithKey.providerId, "fashn-pilot");
  assert.equal(providerWithKey.isSynthetic, false);
  assert.ok(providerWithKey.supportedCategories.includes("dresses"));
});

test("VTO 7. VirtualTryOnService: Orchestrates validation, submission and result lifecycle", async () => {
  const modeConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };
  const demoProvider = new DemoVirtualTryOnProvider();
  const service = new VirtualTryOnService(demoProvider, modeConfig);

  const input: TryOnInput = {
    requestId: "req-004",
    productId: "prod-polera-essential",
    productSlug: "polera-essential",
    productName: "Polera Essential",
    category: "tops",
    productImageUrl: "/assets/images/polera.png",
    inputMode: "SYNTHETIC_AVATAR",
    selectedAvatarProfile: "Mateo",
    userConsentGranted: true,
  };

  // Validation step
  const validation = await service.validateTryOn(input);
  assert.equal(validation.valid, true);

  // Successful submission
  const job = await service.submitTryOn(input);
  assert.ok(job.jobId);

  const status = await service.checkStatus(job.jobId);
  assert.ok(status.jobId === job.jobId);

  const result = await service.fetchResult(job.jobId);
  assert.equal(result.status, "SUCCESS");
  assert.equal(result.recommendedSize, "L"); // Mateo profile sizing
});

test("VTO 8. Factory: createVTOService returns secure service based on operational mode", () => {
  const publicConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };

  const service = createVTOService(publicConfig);
  assert.ok(service instanceof VirtualTryOnService);
  assert.equal(service.activeProviderId, "demo-synthetic");

  const provider = createVTOProvider(publicConfig);
  assert.equal(provider.providerId, "demo-synthetic");
});
