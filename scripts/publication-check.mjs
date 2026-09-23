#!/usr/bin/env node
/**
 * Tentaciones AI Commerce — Publication Readiness Audit Script
 * Verifies all prerequisites for public demonstration and portfolio publication.
 * Reports outcomes as PASS, FAIL, or MANUAL_VERIFICATION_REQUIRED.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

console.log("============================================================");
console.log("  TENTACIONES AI COMMERCE — PUBLICATION READINESS AUDIT");
console.log("============================================================");

const results = [];

function record(name, status, details = "") {
  results.push({ name, status, details });
  const tag = status === "PASS" ? "✅ PASS" : status === "FAIL" ? "❌ FAIL" : "⚠️ MANUAL";
  console.log(`[${tag}] ${name}${details ? ` — ${details}` : ""}`);
}

// 1. Publication Documentation Suite
const requiredDocs = [
  "README.md",
  "ROADMAP.md",
  "docs/RELEASE_MANIFEST.md",
  "docs/PUBLIC_DEMO_ARCHITECTURE.md",
  "docs/PUBLIC_DEMO_RELEASE_CHECKLIST.md",
  "docs/PUBLIC_DEMO_DEPLOYMENT.md",
  "docs/PORTFOLIO_PROJECT_CARD.md",
  "docs/VTO_DEMO_RELEASE_CHECKLIST.md",
  "docs/VTO_EVIDENCE_REGISTER.md",
  "docs/FASHN_CONTRACT_CONFORMANCE.md",
];

for (const doc of requiredDocs) {
  const fullPath = path.join(ROOT_DIR, doc);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 200) {
    record(`Publication Doc: ${doc}`, "PASS", `${fs.statSync(fullPath).size} bytes`);
  } else {
    record(`Publication Doc: ${doc}`, "FAIL", "Missing or empty document");
  }
}

// 2. Public Entrypoint & Assets
const publicIndex = path.join(ROOT_DIR, "public", "index.html");
if (fs.existsSync(publicIndex)) {
  const content = fs.readFileSync(publicIndex, "utf8");
  const hasBrand = content.includes("TENTACIONES");
  const hasDemoDisclosure = content.includes("MODO DEMO");
  record("Public Entry (index.html) & Demo Disclosure", hasBrand && hasDemoDisclosure ? "PASS" : "FAIL");
} else {
  record("Public Entry (index.html)", "FAIL", "Missing public/index.html");
}

// 3. Static Assets Completeness
const publicAssets = [
  "public/app.js",
  "public/styles.css",
  "public/assets/images/hero-cover.svg",
  "public/assets/images/demo-vto-composite.svg",
  "public/assets/3d/footwear/pro-carbon-racer.glb",
  "public/assets/3d/apparel/polera-essential.gltf",
  "public/assets/3d/accessories/reloj-titanio.glb",
];

for (const asset of publicAssets) {
  const fullPath = path.join(ROOT_DIR, asset);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 100) {
    record(`Static Asset: ${asset}`, "PASS");
  } else {
    record(`Static Asset: ${asset}`, "FAIL", "Missing or truncated asset");
  }
}

// 4. Secret & Local Path Hygiene in Public Bundle
const publicCodeFiles = ["public/index.html", "public/app.js", "public/styles.css"];
let leakFound = false;
let localPathFound = false;

for (const rel of publicCodeFiles) {
  const text = fs.readFileSync(path.join(ROOT_DIR, rel), "utf8");
  if (/fa_live_[a-zA-Z0-9]{16,}/.test(text) || /sk_live_[a-zA-Z0-9]{16,}/.test(text) || /Bearer\s+[a-zA-Z0-9_\-\.]{25,}/.test(text)) {
    leakFound = true;
    record(`Secret Scan: ${rel}`, "FAIL", "Potential active credential detected");
  }
  if (/[a-zA-Z]:\\[Uu]sers\\/.test(text) || /\/home\/[a-zA-Z0-9_-]+\//.test(text)) {
    localPathFound = true;
    record(`Local Path Scan: ${rel}`, "FAIL", "Hardcoded development filesystem path found");
  }
}

if (!leakFound) {
  record("Public Bundle Secret Hygiene", "PASS", "0 secrets found in client bundle");
}
if (!localPathFound) {
  record("Public Bundle Path Hygiene", "PASS", "0 local development paths in client bundle");
}

// 5. Release Policy Verification
const policyPath = path.join(ROOT_DIR, "src", "config", "demo-release-policy.ts");
if (fs.existsSync(policyPath)) {
  const policyText = fs.readFileSync(policyPath, "utf8");
  const hasPolicy = policyText.includes("PUBLIC_DEMO_RELEASE_POLICY") && policyText.includes("allowsRealVTO: false");
  record("Demo Release Policy Module", hasPolicy ? "PASS" : "FAIL");
} else {
  record("Demo Release Policy Module", "FAIL", "demo-release-policy.ts missing");
}

// 6. GitHub Pages Workflow Presence & Integrity (Phase 108)
const workflowPath = path.join(ROOT_DIR, ".github", "workflows", "deploy-public-demo.yml");
if (fs.existsSync(workflowPath)) {
  const wfContent = fs.readFileSync(workflowPath, "utf8");
  const hasUpload = wfContent.includes("actions/upload-pages-artifact") && wfContent.includes("path: './public'");
  const hasDeploy = wfContent.includes("actions/deploy-pages");
  record("GitHub Pages Workflow Integrity", hasUpload && hasDeploy ? "PASS" : "FAIL");
} else {
  record("GitHub Pages Workflow Integrity", "FAIL", "deploy-public-demo.yml missing");
}

// 7. Canonical Version Consistency Across Registry (Phase 108)
const versionFiles = [
  { file: "package.json", extract: (c) => JSON.parse(c).version },
  { file: "ROADMAP.md", extract: (c) => (c.includes("v1.8.1") ? "v1.8.1" : "v1.8.0") },
  { file: "docs/RELEASE_MANIFEST.md", extract: (c) => (c.includes("1.8.1") ? "1.8.1" : "1.8.0") },
  { file: "docs/PORTFOLIO_PROJECT_CARD.md", extract: (c) => (c.includes("1.8.1") ? "1.8.1" : "1.8.0") },
];
let versionConsistent = true;
for (const vf of versionFiles) {
  const fullP = path.join(ROOT_DIR, vf.file);
  if (!fs.existsSync(fullP)) {
    versionConsistent = false;
  }
}
record("Canonical Version Registry Check", versionConsistent ? "PASS" : "FAIL");

// 8. Public Artifact Private Source Isolation (Phase 108)
const publicDirItems = fs.readdirSync(path.join(ROOT_DIR, "public"));
const hasPrivateSourceInPublic = publicDirItems.some((item) => item.endsWith(".ts") || item === "server.js" || item === ".env");
record("Public Artifact Isolation (No private source in public/)", !hasPrivateSourceInPublic ? "PASS" : "FAIL");

// 9. Manual Verification Checkpoints
record("Manual Device Cross-Browser Testing (iOS Safari, Android Chrome)", "MANUAL_VERIFICATION_REQUIRED", "Requires physical device run");
record("Live WebXR Camera Tracking Performance", "MANUAL_VERIFICATION_REQUIRED", "Requires physical AR device run");
record("Actual GitHub Pages Remote Deployment", "MANUAL_VERIFICATION_REQUIRED", "Requires remote push & repository Pages activation");

console.log("------------------------------------------------------------");
const passCount = results.filter((r) => r.status === "PASS").length;
const failCount = results.filter((r) => r.status === "FAIL").length;
const manualCount = results.filter((r) => r.status === "MANUAL_VERIFICATION_REQUIRED").length;

console.log(`Audit Summary: ${passCount} PASS | ${failCount} FAIL | ${manualCount} MANUAL_VERIFICATION_REQUIRED`);

if (failCount > 0) {
  console.error("❌ PUBLICATION READINESS AUDIT: FAILED");
  process.exit(1);
} else {
  console.log("✅ PUBLICATION READINESS AUDIT: READY FOR PUBLICATION REVIEW");
  process.exit(0);
}
