import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PUBLIC_DEMO_RELEASE_POLICY,
  getDemoReleasePolicy,
  assertFeatureReleaseEligibility,
} from "../src/config/demo-release-policy.js";
import { resolveOperationalMode } from "../src/contracts/operational-mode.js";
import { DemoVirtualTryOnProvider } from "../src/adapter/vto/demo-vto-provider.js";
import { VTOExecutionGateway } from "../src/domain/vto/vto-execution-gateway.js";
import type { VirtualTryOnExecutionRequest } from "../src/contracts/vto-execution-contract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname.includes("dist")
  ? path.resolve(__dirname, "../..")
  : path.resolve(__dirname, "..");

test("1. Public Demo Entry: public/index.html exists and contains essential brand and demo elements", () => {
  const indexHtmlPath = path.join(ROOT_DIR, "public", "index.html");
  assert.ok(fs.existsSync(indexHtmlPath), "public/index.html must exist");

  const htmlContent = fs.readFileSync(indexHtmlPath, "utf8");
  assert.ok(htmlContent.includes("TENTACIONES"), "index.html must feature TENTACIONES brand");
  assert.ok(htmlContent.includes("demo-banner"), "index.html must include demo disclosure banner");
  assert.ok(htmlContent.includes("id=\"vto-modal\""), "index.html must contain VTO modal");
  assert.ok(htmlContent.includes("id=\"cart-drawer\""), "index.html must contain shopping cart drawer");
  assert.ok(htmlContent.includes("id=\"checkout-modal\""), "index.html must contain checkout demo modal");
});

test("2. Demo Release Boundary: Policy enforces strict isolation in PUBLIC_DEMO", () => {
  const policy = getDemoReleasePolicy("PUBLIC_DEMO");
  assert.equal(policy.isPublicDemo, true);
  assert.equal(policy.allowsSyntheticData, true);
  assert.equal(policy.allowsDemoVTO, true);
  assert.equal(policy.allowsRealVTO, false);
  assert.equal(policy.requiresExternalApiKey, false);
  assert.equal(policy.allowsSimulatedCheckout, true);

  assert.equal(assertFeatureReleaseEligibility("DEMO_VTO", "PUBLIC_DEMO"), true);
  assert.equal(assertFeatureReleaseEligibility("REAL_FASHN_INFERENCE", "PUBLIC_DEMO"), false);
  assert.equal(assertFeatureReleaseEligibility("WEBPAY_DEMO", "PUBLIC_DEMO"), true);
  assert.equal(assertFeatureReleaseEligibility("REAL_PAYMENT", "PUBLIC_DEMO"), false);
});

test("3. Public Assets Integrity: Required SVGs and 3D GLB/GLTF assets exist and are non-empty", () => {
  const mandatoryAssets = [
    "public/assets/images/hero-cover.svg",
    "public/assets/images/walkthrough-step1.svg",
    "public/assets/images/walkthrough-step2.svg",
    "public/assets/images/walkthrough-step3.svg",
    "public/assets/images/walkthrough-step4.svg",
    "public/assets/images/walkthrough-step5.svg",
    "public/assets/3d/footwear/pro-carbon-racer.glb",
    "public/assets/3d/apparel/polera-essential.gltf",
    "public/assets/3d/accessories/reloj-titanio.glb",
  ];

  for (const assetRelPath of mandatoryAssets) {
    const fullPath = path.join(ROOT_DIR, assetRelPath);
    assert.ok(fs.existsSync(fullPath), `Asset ${assetRelPath} must exist`);
    const stats = fs.statSync(fullPath);
    assert.ok(stats.size > 100, `Asset ${assetRelPath} must not be empty (size: ${stats.size} bytes)`);
  }
});

test("4. Zero Public Credentials Invariant: No API keys in client code or static bundles", () => {
  const publicFiles = ["public/index.html", "public/app.js", "public/styles.css"];
  for (const relPath of publicFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, relPath), "utf8");
    assert.ok(!content.includes("fa_live_1"), `No live keys in ${relPath}`);
    assert.ok(!content.includes("sk_live_1"), `No stripe keys in ${relPath}`);
    assert.ok(!content.includes("FASHN_API_KEY="), `No env assignment in ${relPath}`);
  }
});

test("5. Public VTO Demo Route: Fully functional with Demo Provider and 0 external HTTP dependencies", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PUBLIC_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  const request: VirtualTryOnExecutionRequest = {
    requestId: "req-pub-demo-smoke",
    userImage: {
      inputType: "SYNTHETIC_AVATAR",
      format: "svg",
      mimeType: "image/svg+xml",
      width: 800,
      height: 1200,
      aspectRatio: 1.5,
      orientation: "portrait",
      quality: "EXCELLENT",
      qualityAssessment: {} as any,
      validated: true,
      validatedAt: new Date().toISOString(),
      sourceType: "SYNTHETIC_AVATAR",
      dataUri: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
    },
    productImage: {
      productId: "prod-polera-essential",
      productSlug: "polera-essential",
      category: "tops",
      format: "svg",
      width: 800,
      height: 1000,
      aspectRatio: 1.25,
      sourceType: "PRODUCT_IMAGE",
      validated: true,
      quality: "EXCELLENT",
      url: "/assets/images/polera.png",
      evaluatedAt: new Date().toISOString(),
    },
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
  };

  const result = await gateway.execute(request);
  assert.equal(result.status, "COMPLETED");
  assert.equal(result.isSyntheticDemo, true);
  assert.equal(result.metricsSource, "DEMO_SYNTHETIC");
  assert.ok(result.recommendedSize);
  assert.ok(result.fitConfidence! >= 80);
});
