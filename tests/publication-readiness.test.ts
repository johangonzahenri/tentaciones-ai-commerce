import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PUBLIC_DEMO_RELEASE_POLICY,
  getDemoReleasePolicy,
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

test("1. Publication Readiness: Public entrypoint and core disclosure are present", () => {
  const indexHtmlPath = path.join(ROOT_DIR, "public", "index.html");
  assert.ok(fs.existsSync(indexHtmlPath));
  const content = fs.readFileSync(indexHtmlPath, "utf8");
  assert.ok(content.includes("MODO DEMO"));
  assert.ok(content.includes("TENTACIONES"));
});

test("2. Publication Readiness: Demo Release Policy is active and prohibits external key requirement", () => {
  const policy = getDemoReleasePolicy("PUBLIC_DEMO");
  assert.equal(policy.isPublicDemo, true);
  assert.equal(policy.allowsRealVTO, false);
  assert.equal(policy.requiresExternalApiKey, false);
});

test("3. Publication Readiness: Public bundles contain 0 credentials and 0 absolute developer paths", () => {
  const files = ["public/index.html", "public/app.js", "public/styles.css"];
  for (const rel of files) {
    const text = fs.readFileSync(path.join(ROOT_DIR, rel), "utf8");
    assert.ok(!text.includes("fa_live_1"));
    assert.ok(!text.includes("sk_live_1"));
    assert.ok(!text.includes("C:\\Users\\"));
  }
});

test("4. Publication Readiness: Mandatory publication documentation exists with substantive content", () => {
  const docs = [
    "docs/RELEASE_MANIFEST.md",
    "docs/PUBLIC_DEMO_ARCHITECTURE.md",
    "docs/PUBLIC_DEMO_DEPLOYMENT.md",
    "docs/PORTFOLIO_PROJECT_CARD.md",
    "docs/PUBLIC_DEMO_RELEASE_CHECKLIST.md",
  ];
  for (const rel of docs) {
    const fullPath = path.join(ROOT_DIR, rel);
    assert.ok(fs.existsSync(fullPath), `Document ${rel} must exist`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 200, `Document ${rel} must have content (> 200 bytes)`);
  }
});

test("5. Publication Readiness: Real/Demo separation fails closed without FASHN credentials", async () => {
  const modeConfig = resolveOperationalMode({ APP_MODE: "PRIVATE_CONNECTED_DEMO" });
  const demoProvider = new DemoVirtualTryOnProvider();
  const gatewayWithoutFashn = new VTOExecutionGateway(demoProvider, modeConfig, undefined, async () => {});

  const realRequest: VirtualTryOnExecutionRequest = {
    requestId: "req-pub-separation-check",
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
    providerPreference: "fashn-pilot",
    userConsentGranted: true,
    demoMode: false,
  };

  const result = await gatewayWithoutFashn.execute(realRequest);
  assert.equal(result.status, "FAILED");
});

test("6. Publication Readiness: GitHub Pages Workflow exists and targets public/ static artifact", () => {
  const workflowPath = path.join(ROOT_DIR, ".github", "workflows", "deploy-public-demo.yml");
  assert.ok(fs.existsSync(workflowPath), "GitHub Pages workflow must exist");
  const content = fs.readFileSync(workflowPath, "utf8");
  assert.ok(content.includes("actions/upload-pages-artifact"));
  assert.ok(content.includes("path: './public'"));
  assert.ok(content.includes("actions/deploy-pages"));
});

test("7. Publication Readiness: Public release tree document exists and classifies public vs private artifacts", () => {
  const docPath = path.join(ROOT_DIR, "docs", "PUBLIC_RELEASE_TREE.md");
  assert.ok(fs.existsSync(docPath), "PUBLIC_RELEASE_TREE.md must exist");
  const content = fs.readFileSync(docPath, "utf8");
  assert.ok(content.includes("PUBLIC RELEASE ARTIFACT (public/)"));
  assert.ok(content.includes("Archivos que se Publican"));
  assert.ok(content.includes("Archivos que NO se Publican"));
});
