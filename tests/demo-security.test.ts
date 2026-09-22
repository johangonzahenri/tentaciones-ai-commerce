import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveOperationalMode, type OperationalModeConfig } from "../src/contracts/operational-mode.js";
import { DemoAdapter } from "../src/adapter/demo-adapter.js";
import { createExperienceService } from "../src/adapter/tentaciones-service-factory.js";
import {
  assertSafeDemoMode,
  assertNoProductionPayments,
  sanitizeErrorMessage,
  redactSensitivePayload,
  SecurityViolationError,
} from "../src/security/demo-guardrails.js";
import { recommendSize, resolveVirtualFitting } from "../src/domain/ar-fitting.js";
import { MODEL_3D_ASSET_REGISTRY, resolve3DAssetForProduct } from "../src/domain/3d-assets.js";
import {
  resolveARCapability,
  determineFallbackTier,
  clampARScale,
  DEFAULT_AR_SESSION_CONFIG,
} from "../src/domain/webxr-spatial.js";
import {
  SHOWCASE_MEDIA_REGISTRY,
  AR_WALKTHROUGH_STEPS,
  PRODUCT_HONESTY_MATRIX,
  resolveWalkthroughStep,
  resolveShowcaseMedia,
} from "../src/domain/showcase-assets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname.includes("dist")
  ? path.resolve(__dirname, "../..")
  : path.resolve(__dirname, "..");

test("1. Documentation Completeness: All 26 canonical docs exist with mandatory headings", () => {
  const docs = [
    "PUBLIC_DEMO.md",
    "DEMO_SECURITY.md",
    "IP_PROTECTION.md",
    "MULTICLIENT_ARCHITECTURE.md",
    "PORTFOLIO_SHOWCASE.md",
    "DEPLOYMENT_STRATEGY.md",
    "AR_DEMO_GUIDE.md",
    "SHOWCASE_CHECKLIST.md",
    "GITHUB_RELEASE.md",
    "3D_ARCHITECTURE.md",
    "GLTF_ASSET_GUIDE.md",
    "PUBLIC_DEPLOYMENT.md",
    "DEMO_RELEASE.md",
    "RELEASE_1_3_0.md",
    "WEBXR_AR_ARCHITECTURE.md",
    "WEBXR_COMPATIBILITY.md",
    "AR_SESSION_GUIDE.md",
    "AR_EXPERIENCE.md",
    "CASE_STUDY.md",
    "SHOWCASE_MEDIA.md",
    "SHOWCASE_ARCHITECTURE.md",
    "VTO_ENGINE_ARCHITECTURE.md",
    "VTO_PROVIDER_EVALUATION.md",
    "VTO_PRIVACY.md",
    "VTO_API_INTEGRATION.md",
    "VTO_PRODUCT_COMPATIBILITY.md",
  ];

  for (const doc of docs) {
    const fullPath = path.join(ROOT_DIR, "docs", doc);
    assert.ok(fs.existsSync(fullPath), `Document docs/${doc} must exist`);
    const content = fs.readFileSync(fullPath, "utf8");
    assert.ok(content.includes("CANONICAL DOCUMENT:"), `docs/${doc} must have CANONICAL DOCUMENT marker`);
    assert.ok(content.includes("STATUS: CERTIFIED"), `docs/${doc} must have STATUS: CERTIFIED marker`);
  }
});

test("2. Operational Mode Resolver: Resolves PUBLIC_DEMO by default or with APP_MODE", () => {
  const config = resolveOperationalMode({ APP_MODE: "PUBLIC_DEMO" });
  assert.equal(config.mode, "PUBLIC_DEMO");
  assert.equal(config.defaultCurrency, "CLP");
  assert.equal(config.freeShippingThresholdCLP, 30000);

  const connectedConfig = resolveOperationalMode({
    APP_MODE: "PRIVATE_CONNECTED_DEMO",
    PLATFORM_API_BASE_URL: "http://127.0.0.1:3000/api/v1",
    PLATFORM_API_KEY: "secret-key",
  });
  assert.equal(connectedConfig.mode, "PRIVATE_CONNECTED_DEMO");
  assert.equal(connectedConfig.platformApiKey, "secret-key");
});

test("3. Fail-Closed Security: assertSafeDemoMode throws when API key is provided in PUBLIC_DEMO", () => {
  const unsafeConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
    platformApiKey: "secret-prod-token-123",
  };

  assert.throws(
    () => {
      assertSafeDemoMode(unsafeConfig);
    },
    (err: unknown) => {
      assert.ok(err instanceof SecurityViolationError);
      assert.ok((err as Error).message.includes("Live API Key detected"));
      return true;
    }
  );
});

test("4. Fail-Closed Security: assertSafeDemoMode throws when internal corporate URL is targeted in PUBLIC_DEMO", () => {
  const unsafeConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
    platformApiBaseUrl: "https://secure-api.internal.corp/v1",
  };

  assert.throws(
    () => {
      assertSafeDemoMode(unsafeConfig);
    },
    (err: unknown) => {
      assert.ok(err instanceof SecurityViolationError);
      assert.ok((err as Error).message.includes("Private enterprise URL detected"));
      return true;
    }
  );
});

test("5. Fail-Closed Payment Guardrail: assertNoProductionPayments blocks non-demo payment methods", () => {
  const demoConfig: OperationalModeConfig = {
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  };

  assert.throws(
    () => {
      assertNoProductionPayments("STRIPE_PROD_LIVE", demoConfig);
    },
    (err: unknown) => {
      assert.ok(err instanceof SecurityViolationError);
      assert.ok((err as Error).message.includes("is strictly forbidden in PUBLIC_DEMO mode"));
      return true;
    }
  );

  assert.doesNotThrow(() => {
    assertNoProductionPayments("WEBPAY_DEMO", demoConfig);
  });
});

test("6. Error Sanitization: sanitizeErrorMessage strips system paths, internal endpoints, and raw secrets", () => {
  const rawMsg = "Error at C:\\Users\\Admin\\project\\src\\core\\engine.ts: Failed to connect to http://192.168.1.50:5432 with sk-live-12345678";
  const sanitized = sanitizeErrorMessage(rawMsg);
  assert.ok(!sanitized.includes("C:\\Users\\Admin"));
  assert.ok(!sanitized.includes("192.168.1.50"));
  assert.ok(!sanitized.includes("sk-live-12345678"));
  assert.ok(sanitized.includes("[REDACTED_PATH]"));
  assert.ok(sanitized.includes("[REDACTED_ENDPOINT]"));
  assert.ok(sanitized.includes("[REDACTED_SECRET]"));
});

test("7. Payload Redaction: redactSensitivePayload redacts apiKey, password, token, and creditCard", () => {
  const payload = {
    user: "test-user",
    apiKey: "aop-live-key-xyz",
    details: {
      password: "mySecretPassword123",
      creditCard: "4532-1111-2222-3333",
      safeInfo: "synthetic-item",
    },
  };

  const redacted = redactSensitivePayload(payload) as typeof payload;
  assert.equal(redacted.user, "test-user");
  assert.equal(redacted.apiKey, "[REDACTED_DEMO_PROTECTED]");
  assert.equal(redacted.details.password, "[REDACTED_DEMO_PROTECTED]");
  assert.equal(redacted.details.creditCard, "[REDACTED_DEMO_PROTECTED]");
  assert.equal(redacted.details.safeInfo, "synthetic-item");
});

test("8. Experience Contract & DemoAdapter: Provides deterministic catalog, search, and metrics", async () => {
  const service = new DemoAdapter();
  const catalog = await service.listCatalog();
  assert.ok(catalog.length > 0);

  const searchResults = await service.searchNaturalLanguage("zapatillas");
  assert.ok(searchResults.matches.length > 0);
  assert.equal(searchResults.matches[0]?.category, "calzado");

  const metrics = await service.getCommercialMetrics();
  assert.ok(metrics.totalProductsIndexed > 0);
  assert.ok(metrics.recommendationsServed > 0);
  assert.equal(metrics.freeShippingThreshold, 30000);

  const rec = await service.resolveFitting("urn:tentaciones:ar:apparel:silk-evening-dress", "Nova");
  assert.equal(rec.recommendedSize?.recommendedSize, "S");
  assert.ok((rec.recommendedSize?.confidence ?? 0) >= 0.85);
});

test("9. Service Factory: Returns DemoAdapter for PUBLIC_DEMO mode", () => {
  const service = createExperienceService({
    mode: "PUBLIC_DEMO",
    defaultCurrency: "CLP",
    freeShippingThresholdCLP: 30000,
  });
  assert.ok(service instanceof DemoAdapter);
  assert.equal(service.operationalMode, "PUBLIC_DEMO");
});

test("10. AR Biometric Sizing & Fallback: Computes distinct sizes for Nova, Sora, and Mateo without WebXR crash", () => {
  const novaFoot = recommendSize({ category: "calzado", profile: "Nova", footLengthCm: 24.5 });
  const mateoFoot = recommendSize({ category: "calzado", profile: "Mateo", footLengthCm: 27.0 });
  assert.equal(novaFoot.recommendedSize, 39);
  assert.equal(mateoFoot.recommendedSize, 42);

  // Invalid URN triggers safe 2D fallback
  const fallback = resolveVirtualFitting("invalid:urn:schema", "Sora");
  assert.equal(fallback.fallbackMode, "STANDARD_2D_VIEW");
  assert.equal(fallback.arStatus, "AR_ASSET_INVALID");
});

test("11. 3D GLTF Domain Model: Products contain valid 3D spatial metadata with zero unsafe URLs", async () => {
  const service = new DemoAdapter();
  const catalog = await service.listCatalog();

  const productsWith3D = catalog.filter((p) => p.has3D);
  assert.ok(productsWith3D.length >= 3, "At least 3 products must feature 3D spatial models");

  for (const item of productsWith3D) {
    assert.ok(item.model3DUrl, `Product ${item.id} with has3D must provide model3DUrl`);
    assert.ok(
      item.model3DUrl.startsWith("/assets/3d/") || item.model3DFormat === "canvas3d",
      `Model URL for ${item.id} must be safely sandboxed within /assets/3d/`
    );
    assert.ok(
      !item.model3DUrl.includes("http://") && !item.model3DUrl.includes("https://"),
      `3D Model URL must not link to unverified external endpoints`
    );
  }
});

test("12. 3D Geometry Support: Ensures all supported categories map to procedural or GLTF definitions", async () => {
  const service = new DemoAdapter();
  const catalog = await service.listCatalog();
  const categories = new Set(catalog.map((c) => c.category));

  assert.ok(categories.has("calzado"), "Catalog must include footwear");
  assert.ok(categories.has("vestidos") || categories.has("polerones"), "Catalog must include apparel");
  assert.ok(categories.has("accesorios"), "Catalog must include accessories");
});

test("13. Real 3D Asset Registry & Physical Files: All registered 3D assets exist on disk with valid headers", () => {
  assert.ok(MODEL_3D_ASSET_REGISTRY.length >= 4, "Must register at least 4 verified 3D assets");

  for (const asset of MODEL_3D_ASSET_REGISTRY) {
    const filePath = path.join(ROOT_DIR, "public", asset.path.replace(/^\//, ""));
    assert.ok(fs.existsSync(filePath), `Physical file ${filePath} must exist`);
    const stat = fs.statSync(filePath);
    assert.ok(stat.size > 500, `File ${filePath} must have valid non-empty size`);
    assert.ok(asset.license.includes("CC0") || asset.license.includes("Synthetic"), "License must be CC0/Synthetic");

    if (asset.format === "glb") {
      const buffer = fs.readFileSync(filePath);
      const magic = buffer.readUInt32LE(0);
      assert.equal(magic, 0x46546c67, `GLB asset ${asset.assetId} must start with 0x46546C67 ("glTF") magic header`);
      const version = buffer.readUInt32LE(4);
      assert.equal(version, 2, `GLB asset ${asset.assetId} must be glTF 2.0`);
    } else if (asset.format === "gltf") {
      const content = fs.readFileSync(filePath, "utf8");
      const gltf = JSON.parse(content);
      assert.equal(gltf.asset.version, "2.0", `GLTF asset ${asset.assetId} must specify version 2.0`);
      assert.ok(gltf.meshes && gltf.meshes.length > 0, `GLTF asset ${asset.assetId} must define meshes`);
    }
  }
});

test("14. Product to 3D Asset Resolver: Correctly matches products with real 3D assets", () => {
  const sneakerAsset = resolve3DAssetForProduct("pro-carbon-racer-marathon-shoes");
  assert.ok(sneakerAsset, "Must find 3D asset for pro carbon racer");
  assert.equal(sneakerAsset.format, "glb");
  assert.equal(sneakerAsset.category, "calzado");

  const poleraAsset = resolve3DAssetForProduct("polera-oversized-cotton-essential");
  assert.ok(poleraAsset, "Must find 3D asset for polera essential");
  assert.equal(poleraAsset.format, "gltf");

  const nonExistent = resolve3DAssetForProduct("non-existent-product-slug");
  assert.equal(nonExistent, undefined, "Returns undefined for unmapped product");
});

test("15. Static Build & Zero Secret Invariant: Public distribution files contain zero live keys or private hosts", () => {
  const publicFiles = ["index.html", "app.js", "i18n.js", "styles.css"];
  const forbiddenPatterns = [
    "sk_live_",
    "AIzaSy",
    "ghp_",
    "192.168.",
    "internal.corp",
    "production_secret",
  ];

  for (const file of publicFiles) {
    const fullPath = path.join(ROOT_DIR, "public", file);
    const content = fs.readFileSync(fullPath, "utf8");
    for (const pattern of forbiddenPatterns) {
      assert.ok(
        !content.includes(pattern),
        `Public static file ${file} must not contain sensitive pattern '${pattern}'`
      );
    }
  }
});

test("16. WebXR Spatial Capability Resolver: Accurately evaluates hardware capabilities and camera permissions", () => {
  // 1. Full WebXR Support
  const fullCaps = resolveARCapability({
    hasNavigatorXR: true,
    isSessionSupported: true,
    hasHitTestSource: true,
    cameraAllowed: true,
  });
  assert.equal(fullCaps.webxr, "AVAILABLE");
  assert.equal(fullCaps.immersiveAr, "AVAILABLE");
  assert.equal(fullCaps.hitTest, "AVAILABLE");
  assert.equal(fullCaps.camera, "AVAILABLE");

  // 2. Navigator XR absent (Desktop / Legacy Mobile)
  const legacyCaps = resolveARCapability({
    hasNavigatorXR: false,
  });
  assert.equal(legacyCaps.webxr, "UNAVAILABLE");
  assert.equal(legacyCaps.immersiveAr, "UNAVAILABLE");
  assert.equal(legacyCaps.hitTest, "UNAVAILABLE");

  // 3. Permission Denied
  const deniedCaps = resolveARCapability({
    hasNavigatorXR: true,
    isSessionSupported: true,
    cameraAllowed: false,
  });
  assert.equal(deniedCaps.camera, "PERMISSION_DENIED");
});

test("17. Multi-Tier Fallback Cascade: Determines deterministic fallback path across all device scenarios", () => {
  // Scenario 1: Native AR with hit-test
  const fullCaps = resolveARCapability({
    hasNavigatorXR: true,
    isSessionSupported: true,
    hasHitTestSource: true,
    cameraAllowed: true,
  });
  assert.equal(determineFallbackTier(fullCaps, true), "TIER_1_IMMERSIVE_HIT_TEST");

  // Scenario 2: WebXR unavailable, but real GLB exists -> Tier 2 (3D GLB Viewer)
  const legacyCaps = resolveARCapability({ hasNavigatorXR: false });
  assert.equal(determineFallbackTier(legacyCaps, true), "TIER_2_REAL_GLB_VIEWER");

  // Scenario 3: Real GLB absent, but Canvas 3D available -> Tier 3 (Procedural Mesh)
  assert.equal(determineFallbackTier(legacyCaps, false), "TIER_3_PROCEDURAL_3D_VIEWER");
});

test("18. AR Transform Constraints: Enforces min/max boundaries on spatial model scaling", () => {
  assert.equal(clampARScale(1.0, DEFAULT_AR_SESSION_CONFIG), 1.0);
  assert.equal(clampARScale(0.05, DEFAULT_AR_SESSION_CONFIG), 0.25, "Must clamp minimum scale to 0.25");
  assert.equal(clampARScale(10.0, DEFAULT_AR_SESSION_CONFIG), 2.5, "Must clamp maximum scale to 2.5");
});

test("19. Showcase Media & Asset Registry: All registered media assets exist with valid SVG/binary structures", () => {
  assert.ok(SHOWCASE_MEDIA_REGISTRY.length >= 6, "Must register at least 6 showcase media items");

  for (const item of SHOWCASE_MEDIA_REGISTRY) {
    const physicalPath = path.join(ROOT_DIR, "public", item.path.replace(/^\//, ""));
    assert.ok(fs.existsSync(physicalPath), `Physical media file ${physicalPath} must exist`);
    const stat = fs.statSync(physicalPath);
    assert.ok(stat.size > 100, `Physical media file ${physicalPath} must be non-empty`);
    assert.ok(item.license.includes("CC0") || item.license.includes("Synthetic"), "License must be CC0/Synthetic");
    assert.ok(item.caption.es.length > 0 && item.caption.en.length > 0, "Captions must have bilingual parity");
  }

  const heroMedia = resolveShowcaseMedia("hero-cover-canvas");
  assert.ok(heroMedia, "Must find hero media asset");
  assert.equal(heroMedia.format, "svg");
});

test("20. AR Walkthrough Stepper Domain: 5-step sequence is complete with bilingual descriptions and badges", () => {
  assert.equal(AR_WALKTHROUGH_STEPS.length, 5, "Must define exactly 5 sequential walkthrough steps");

  for (let i = 1; i <= 5; i++) {
    const step = resolveWalkthroughStep(i);
    assert.ok(step, `Walkthrough step ${i} must resolve`);
    assert.equal(step.stepNumber, i);
    assert.ok(step.title.es.length > 0 && step.title.en.length > 0, `Step ${i} must have bilingual titles`);
    assert.ok(step.subtitle.es.length > 0 && step.subtitle.en.length > 0, `Step ${i} must have bilingual subtitles`);
    assert.ok(step.description.es.length > 0 && step.description.en.length > 0, `Step ${i} must have bilingual descriptions`);
    assert.ok(step.technicalDetails.es.length > 0 && step.technicalDetails.en.length > 0, `Step ${i} must have bilingual technical details`);
    assert.ok(step.badge.es.length > 0 && step.badge.en.length > 0, `Step ${i} must have bilingual badges`);
  }
});

test("21. Product Honesty Matrix: Capabilities explicitly distinguish implemented features from out-of-scope items", () => {
  assert.ok(PRODUCT_HONESTY_MATRIX.length >= 7, "Honesty matrix must contain at least 7 verified feature evaluations");

  const implemented = PRODUCT_HONESTY_MATRIX.filter((f) => f.status === "IMPLEMENTED");
  const notImplemented = PRODUCT_HONESTY_MATRIX.filter((f) => f.status === "NOT_IMPLEMENTED");

  assert.ok(implemented.some((f) => f.featureId === "3d_viewer"), "3D viewer must be marked IMPLEMENTED");
  assert.ok(implemented.some((f) => f.featureId === "real_glb_gltf"), "Real GLB loading must be marked IMPLEMENTED");
  assert.ok(implemented.some((f) => f.featureId === "webxr_hit_test"), "WebXR hit-test must be marked IMPLEMENTED");
  assert.ok(implemented.some((f) => f.featureId === "biometric_sizing"), "Biometric sizing must be marked IMPLEMENTED");

  assert.ok(notImplemented.some((f) => f.featureId === "body_tracking_mesh"), "Body tracking mesh must be marked NOT_IMPLEMENTED");
  assert.ok(notImplemented.some((f) => f.featureId === "cloth_physics_simulation"), "Cloth physics must be marked NOT_IMPLEMENTED");
  assert.ok(notImplemented.some((f) => f.featureId === "production_payment_gateways"), "Production payments must be marked NOT_IMPLEMENTED");
});

test("22. DOM Hygiene & Security Invariant: Zero unsafe DOM manipulation APIs in frontend codebase", () => {
  const scriptsToCheck = ["app.js", "i18n.js"];
  const forbiddenApis = ["innerHTML", "outerHTML", "document.write", "eval("];

  for (const script of scriptsToCheck) {
    const filePath = path.join(ROOT_DIR, "public", script);
    const content = fs.readFileSync(filePath, "utf8");

    for (const api of forbiddenApis) {
      assert.ok(
        !content.includes(api),
        `Public script ${script} must not contain unsafe DOM API '${api}'`
      );
    }
  }
});



