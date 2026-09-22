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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname.includes("dist")
  ? path.resolve(__dirname, "../..")
  : path.resolve(__dirname, "..");

test("1. Documentation Completeness: All 9 canonical docs exist with mandatory headings", () => {
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
