import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveOperationalMode } from "../src/contracts/operational-mode.js";
import { createVTOService } from "../src/adapter/vto/vto-provider-factory.js";
import { VTOExecutionGateway } from "../src/domain/vto/vto-execution-gateway.js";
import { DemoVirtualTryOnProvider } from "../src/adapter/vto/demo-vto-provider.js";
import { TryOnImagePipeline } from "../src/domain/vto/vto-image-pipeline.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname.includes("dist")
  ? path.resolve(__dirname, "../..")
  : path.resolve(__dirname, "..");

test("1. VTO Storefront Integration: Frontend DOM hygiene and no dangerous methods", () => {
  const appJsPath = path.join(ROOT_DIR, "public", "app.js");
  const indexHtmlPath = path.join(ROOT_DIR, "public", "index.html");

  const appJsContent = fs.readFileSync(appJsPath, "utf8");
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, "utf8");

  // Strict DOM hygiene checks: 0 innerHTML, 0 outerHTML, 0 eval, 0 document.write
  assert.ok(!appJsContent.includes(".innerHTML"), "app.js must not contain innerHTML");
  assert.ok(!appJsContent.includes(".outerHTML"), "app.js must not contain outerHTML");
  assert.ok(!appJsContent.includes("eval("), "app.js must not contain eval()");
  assert.ok(!appJsContent.includes("document.write("), "app.js must not contain document.write()");

  // Modal and quality box presence in HTML
  assert.ok(indexHtmlContent.includes('id="vto-modal"'), "index.html must have vto-modal");
  assert.ok(indexHtmlContent.includes('id="vto-consent-box"'), "index.html must have vto-consent-box");
  assert.ok(indexHtmlContent.includes('id="vto-quality-feedback-box"'), "index.html must have vto-quality-feedback-box");
  assert.ok(indexHtmlContent.includes('id="vto-quality-badge"'), "index.html must have vto-quality-badge");
});

test("2. VTO Storefront Controller: Memory lifecycle function releaseVTOObjectUrl is defined", () => {
  const appJsPath = path.join(ROOT_DIR, "public", "app.js");
  const appJsContent = fs.readFileSync(appJsPath, "utf8");

  assert.ok(appJsContent.includes("function releaseVTOObjectUrl()"), "app.js must define releaseVTOObjectUrl");
  assert.ok(appJsContent.includes("URL.revokeObjectURL"), "app.js must invoke URL.revokeObjectURL for memory cleanup");
  assert.ok(appJsContent.includes("setVTOUIState("), "app.js must implement setVTOUIState state transitions");
});

test("3. VTO Assess Endpoint & Image Pipeline: Correctly evaluates quality states", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PUBLIC_DEMO" });
  const vtoService = createVTOService(modeConfig);

  // Assess Synthetic Avatar
  const avatarAssessment = await vtoService.assessUserImage({
    isAvatar: true,
    avatarProfile: "Nova",
    userConsentGranted: true,
  });

  assert.equal(avatarAssessment.assessment.state, "EXCELLENT");
  assert.equal(avatarAssessment.assessment.readyForTryOn, true);
  assert.equal(avatarAssessment.preparedUserImage?.width, 800);
  assert.equal(avatarAssessment.preparedUserImage?.height, 1200);

  // Assess Invalid/Corrupted Payload (REJECT)
  const invalidAssessment = await vtoService.assessUserImage({
    base64: "dGVzdC1pbnZhbGlkLWJ5dGVz", // Not a valid image
    mimeType: "text/plain",
    userConsentGranted: true,
  });

  assert.equal(invalidAssessment.assessment.state, "REJECT");
  assert.equal(invalidAssessment.assessment.readyForTryOn, false);
});

test("4. VTO Secret Redaction: Frontend error mapping protects API credentials", () => {
  const appJsPath = path.join(ROOT_DIR, "public", "app.js");
  const appJsContent = fs.readFileSync(appJsPath, "utf8");

  // Verify redaction regex in alert handlers
  assert.ok(appJsContent.includes("fa_live_"), "app.js must contain redaction regex for fashn keys");
  assert.ok(appJsContent.includes("[REDACTED]"), "app.js must replace secret tokens with [REDACTED]");
});

test("5. VTO Execution Gateway: Storefront execution with duplicate and consent safety", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PUBLIC_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  // Reject without consent
  const noConsentRes = await gateway.execute({
    requestId: "req-storefront-test-1",
    productImage: {
      productId: "prod-polera-essential",
      productSlug: "polera-oversized-cotton-essential",
      category: "tops",
      format: "svg",
      width: 800,
      height: 1000,
      aspectRatio: 1.25,
      sourceType: "PRODUCT_IMAGE",
      validated: true,
      quality: "EXCELLENT",
      url: "/assets/images/demo-vto-composite.svg",
      evaluatedAt: new Date().toISOString(),
    },
    productCategory: "tops",
    userConsentGranted: false,
    demoMode: true,
  });

  assert.equal(noConsentRes.status, "FAILED");
  assert.equal(noConsentRes.error?.code, "VTO_INPUT_INVALID");

  // Pass with consent and synthetic demo
  const successRes = await gateway.execute({
    requestId: "req-storefront-test-2",
    productImage: {
      productId: "prod-polera-essential",
      productSlug: "polera-oversized-cotton-essential",
      category: "tops",
      format: "svg",
      width: 800,
      height: 1000,
      aspectRatio: 1.25,
      sourceType: "PRODUCT_IMAGE",
      validated: true,
      quality: "EXCELLENT",
      url: "/assets/images/demo-vto-composite.svg",
      evaluatedAt: new Date().toISOString(),
    },
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
  });

  assert.equal(successRes.status, "COMPLETED");
  assert.equal(successRes.isSyntheticDemo, true);
  assert.ok(successRes.recommendedSize);
});

test("6. VTO Direct Execution Bypass Gate: Direct request with consent=false fails closed in domain", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PRIVATE_CONNECTED_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  const bypassAttemptRes = await gateway.execute({
    requestId: "req-direct-bypass-test",
    productImage: {
      productId: "prod-polera-essential",
      productSlug: "polera-oversized-cotton-essential",
      category: "tops",
      format: "svg",
      width: 800,
      height: 1000,
      aspectRatio: 1.25,
      sourceType: "PRODUCT_IMAGE",
      validated: true,
      quality: "EXCELLENT",
      url: "/assets/images/demo-vto-composite.svg",
      evaluatedAt: new Date().toISOString(),
    },
    productCategory: "tops",
    userConsentGranted: false, // Attempt bypass directly
    demoMode: false,
  });

  assert.equal(bypassAttemptRes.status, "FAILED");
  assert.equal(bypassAttemptRes.error?.code, "VTO_INPUT_INVALID");
  assert.ok(bypassAttemptRes.error?.message.includes("consent"));
});
