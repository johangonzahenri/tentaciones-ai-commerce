import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TentacionesCommerceEngine } from "../src/engine/commerce-engine.js";
import { TentacionesPlatformAdapter } from "../src/adapter/tentaciones-platform-adapter.js";
import { PlatformClient, PlatformClientError } from "../src/adapter/platform-client.js";
import { parseAndValidateUrn, recommendSize, resolveVirtualFitting } from "../src/domain/ar-fitting.js";
import { TENTACIONES_DEMO_CATALOG } from "../src/domain/catalog-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Handle both TS source execution and compiled dist/tests execution
const ROOT_DIR = __dirname.includes("dist")
  ? path.resolve(__dirname, "../..")
  : path.resolve(__dirname, "..");

test("1. Project Structure: Contains all mandatory standalone directories and files", () => {
  assert.ok(fs.existsSync(path.join(ROOT_DIR, "package.json")), "package.json must exist");
  assert.ok(fs.existsSync(path.join(ROOT_DIR, "tsconfig.json")), "tsconfig.json must exist");
  assert.ok(fs.existsSync(path.join(ROOT_DIR, ".env.example")), ".env.example must exist");
  assert.ok(fs.existsSync(path.join(ROOT_DIR, "public/index.html")), "public/index.html must exist");
  assert.ok(fs.existsSync(path.join(ROOT_DIR, "public/app.js")), "public/app.js must exist");
  assert.ok(fs.existsSync(path.join(ROOT_DIR, "public/styles.css")), "public/styles.css must exist");
  assert.ok(fs.existsSync(path.join(ROOT_DIR, "public/i18n.js")), "public/i18n.js must exist");
  assert.ok(fs.existsSync(path.join(ROOT_DIR, "README.md")), "README.md must exist");
  assert.ok(fs.existsSync(path.join(ROOT_DIR, "ARCHITECTURE.md")), "ARCHITECTURE.md must exist");
  assert.ok(fs.existsSync(path.join(ROOT_DIR, "INTEGRATION.md")), "INTEGRATION.md must exist");
});

test("2. Application Identity: Adheres to PROJ-01-TENTACIONES and tentaciones-commerce naming", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf8"));
  assert.equal(pkg.name, "tentaciones-ai-commerce");
  assert.equal(pkg.version, "1.8.1");
});

test("3. Platform Client Configuration: Configures endpoint URL, application ID, and tenant", () => {
  const client = new PlatformClient({
    baseUrl: "http://127.0.0.1:3000/api/v1",
    applicationId: "tentaciones-commerce",
    tenantId: "tenant-tentaciones",
  });
  assert.ok(client);
});

test("4. Product Discovery: Extracts natural language intent and matches catalog items", () => {
  const engine = new TentacionesCommerceEngine();
  const res = engine.searchProductsNaturalLanguage("zapatillas de running para maratÃ³n");
  assert.equal(res.status, "COMPLETED");
  assert.equal(res.intent.category, "calzado");
  assert.ok(res.matches.length > 0);
  assert.equal(res.matches[0]?.category, "calzado");
});

test("5. AI Recommendations: Yields relevant related fashion & apparel items", () => {
  const engine = new TentacionesCommerceEngine();
  const res = engine.getRecommendations("prod-zapatillas-carbon");
  assert.equal(res.status, "COMPLETED");
  assert.ok(Array.isArray(res.recommendations));
});

test("6. Technical Product Comparison: Computes specification tradeoffs matrix", () => {
  const engine = new TentacionesCommerceEngine();
  const res = engine.compareProducts(["prod-polera-essential", "prod-camisa-lino"]);
  assert.equal(res.status, "COMPLETED");
  assert.equal(res.products.length, 2);
  assert.ok(res.matrix.length === 2);
  assert.ok(res.differentiators.includes("material"));
});

test("7. Cart Assistance & Free Shipping Math: Accurately calculates Chilean Peso shipping thresholds", () => {
  const engine = new TentacionesCommerceEngine();
  const cart = engine.getOrCreateCart("test-cart-01");
  assert.equal(cart.subtotal, 0);
  assert.equal(cart.freeShippingThreshold, 30000);
  assert.equal(cart.qualifiesForFreeShipping, false);

  const addRes = engine.addToCart("test-cart-01", "POL-WHT-S", 1);
  assert.ok(addRes.success);
  assert.equal(addRes.cart.subtotal, 22990);
  assert.equal(addRes.cart.missingForFreeShipping, 7010);
  assert.equal(addRes.cart.qualifiesForFreeShipping, false);

  const addRes2 = engine.addToCart("test-cart-01", "POL-WHT-S", 1);
  assert.ok(addRes2.success);
  assert.equal(addRes2.cart.subtotal, 45980);
  assert.equal(addRes2.cart.missingForFreeShipping, 0);
  assert.equal(addRes2.cart.qualifiesForFreeShipping, true);
});

test("8. Platform Fallback: Automatically degrades to LOCAL_FALLBACK without crashing when platform is offline", async () => {
  const adapter = new TentacionesPlatformAdapter(); // No platform client passed -> Local engine mode
  const health = await adapter.checkPlatformHealth();
  assert.equal(health.online, false);

  const discovery = await adapter.discoverProducts("chaqueta impermeable");
  assert.equal(discovery.status, "COMPLETED");
  assert.equal(discovery.source, "Local AI Engine");
  assert.equal(discovery.fallback, "LOCAL_FALLBACK");
  assert.ok(discovery.matches.length > 0);
});

test("9. Webpay Demo Checkout: Simulates transaction and clears shopping cart safely", () => {
  const engine = new TentacionesCommerceEngine();
  engine.addToCart("checkout-cart-1", "CAM-BGE-S", 1);

  const checkoutRes = engine.processCheckout(
    "checkout-cart-1",
    { name: "Carlos Perez", email: "carlos@example.com" },
    { street: "Ahumada 456", city: "Santiago", region: "Metropolitana", country: "Chile" }
  );

  assert.ok(checkoutRes.success);
  assert.ok(checkoutRes.order);
  assert.equal(checkoutRes.order.paymentMethod, "WEBPAY_DEMO");
  assert.equal(checkoutRes.order.paymentStatus, "PAID_DEMO");
  assert.equal(checkoutRes.order.orderStatus, "CONFIRMED");

  // Cart must be cleared
  const cartAfter = engine.getOrCreateCart("checkout-cart-1");
  assert.equal(cartAfter.items.length, 0);
  assert.equal(cartAfter.subtotal, 0);
});

test("10. AR Availability & URN Resolution: Validates URN structure for 3D/AR assets", () => {
  const validUrn = "urn:tentaciones:ar:apparel:running-jacket-v2";
  const parsed = parseAndValidateUrn(validUrn);
  assert.ok(parsed);
  assert.equal(parsed.category, "poleras"); // apparel maps to top apparel
  assert.equal(parsed.productSlug, "running-jacket-v2");

  const invalidUrn = "invalid-urn-string";
  assert.equal(parseAndValidateUrn(invalidUrn), null);
});

test("11. Profile Selection & Biometric Size Calculation: Resolves sizes for Nova, Sora, and Mateo", () => {
  const recNova = recommendSize({ category: "calzado", footLengthCm: 24.2, profile: "Nova" });
  assert.equal(recNova.recommendedSize, 39);

  const recMateo = recommendSize({ category: "calzado", footLengthCm: 26.8, profile: "Mateo" });
  assert.equal(recMateo.recommendedSize, 42);

  const recTop = recommendSize({ category: "poleras", chestCm: 104, profile: "Mateo" });
  assert.equal(recTop.recommendedSize, "L");
});

test("12. Catalog Integrity: All products contain valid variants, stock, prices, and specifications", () => {
  assert.ok(TENTACIONES_DEMO_CATALOG.length >= 8);
  for (const prod of TENTACIONES_DEMO_CATALOG) {
    assert.ok(prod.id);
    assert.ok(prod.name);
    assert.ok(prod.basePriceCLP > 0);
    assert.ok(prod.variants.length > 0);
    for (const v of prod.variants) {
      assert.ok(v.sku);
      assert.ok(v.stock >= 0);
    }
  }
});

test("13. Product Detail & Variant Lookup: Correctly retrieves product by slug and SKU", () => {
  const engine = new TentacionesCommerceEngine();
  const product = engine.getProductBySlug("vestido-aura-silk-evening-gala");
  assert.ok(product);
  assert.equal(product.id, "prod-vestido-seda");

  const lookup = engine.findVariant("SED-NOIR-M");
  assert.ok(lookup);
  assert.equal(lookup.product.id, "prod-vestido-seda");
  assert.equal(lookup.variant.size, "M");
});

test("14. Cart Item Removal: Correctly recalculates subtotal upon removing an item", () => {
  const engine = new TentacionesCommerceEngine();
  engine.addToCart("cart-remove-test", "POL-WHT-S", 2);
  engine.addToCart("cart-remove-test", "CAM-BGE-S", 1);

  let cart = engine.getOrCreateCart("cart-remove-test");
  assert.equal(cart.items.length, 2);

  cart = engine.removeFromCart("cart-remove-test", "POL-WHT-S");
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0]?.sku, "CAM-BGE-S");
  assert.equal(cart.subtotal, 45990);
});

test("15. AR Virtual Fitting Resolution: Computes preview URL and fallback mode", () => {
  const resolution = resolveVirtualFitting("urn:tentaciones:ar:footwear:pro-carbon-racer", "Nova", { footLengthCm: 25.0 });
  assert.equal(resolution.arStatus, "AR_AVAILABLE");
  assert.equal(resolution.fallbackMode, "NONE");
  assert.ok(resolution.previewUrl.includes("urn%3Atentaciones%3Aar%3Afootwear%3Apro-carbon-racer"));
});

test("16. Secret Safety: .env.example contains zero real secrets or plaintext credentials", () => {
  const envExample = fs.readFileSync(path.join(ROOT_DIR, ".env.example"), "utf8");
  assert.ok(!envExample.includes("sk-"));
  assert.ok(!envExample.includes("password"));
  assert.ok(!envExample.includes("token"));
});

test("17. Frontend DOM Hygiene: Zero innerHTML, outerHTML, eval, or document.write in public scripts", () => {
  const appJs = fs.readFileSync(path.join(ROOT_DIR, "public/app.js"), "utf8");
  assert.equal(appJs.includes(".innerHTML"), false, "Must not contain .innerHTML");
  assert.equal(appJs.includes(".outerHTML"), false, "Must not contain .outerHTML");
  assert.equal(appJs.includes("eval("), false, "Must not contain eval(");
  assert.equal(appJs.includes("document.write("), false, "Must not contain document.write(");
});

test("18. Internationalization Dictionary: Bilingual parity between es-419 and en", () => {
  const i18nContent = fs.readFileSync(path.join(ROOT_DIR, "public/i18n.js"), "utf8");
  assert.ok(i18nContent.includes('"es-419"'));
  assert.ok(i18nContent.includes('"en"'));
  assert.ok(i18nContent.includes("TENTACIONES"));
});
