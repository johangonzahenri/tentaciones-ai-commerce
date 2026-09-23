#!/usr/bin/env node
/**
 * Tentaciones AI Commerce — Release Health Check CLI Tool
 * Performs comprehensive release candidate audits: file integrity, secrets scan,
 * canonical documentation completeness, and release boundary verification.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

console.log("============================================================");
console.log("  TENTACIONES AI COMMERCE — RELEASE HEALTH CHECK (v1.8.1)");
console.log("============================================================");

const checks = [];

function check(name, pass, details = "") {
  checks.push({ name, pass, details });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${details ? ` — ${details}` : ""}`);
}

// 1. Package Version & Identity
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf8"));
  check("Package.json Identity", pkg.name === "tentaciones-ai-commerce", `name: ${pkg.name}`);
} catch (e) {
  check("Package.json Identity", false, e.message);
}

// 2. Mandatory Standalone Files & Assets
const mandatoryFiles = [
  "public/index.html",
  "public/app.js",
  "public/styles.css",
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

for (const file of mandatoryFiles) {
  const fullPath = path.join(ROOT_DIR, file);
  check(`Asset Presence: ${file}`, fs.existsSync(fullPath));
}

// 3. Static Secret Audit in Public Assets
const publicFiles = ["public/index.html", "public/app.js", "public/styles.css"];
let secretLeaked = false;
const forbiddenPatterns = [
  /fa_live_[a-zA-Z0-9]{16,}/,
  /sk_live_[a-zA-Z0-9]{16,}/,
  /Bearer\s+[a-zA-Z0-9_\-\.]{20,}/,
  /FASHN_API_KEY\s*=\s*['"][a-zA-Z0-9_\-]+['"]/,
];

for (const file of publicFiles) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), "utf8");
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      secretLeaked = true;
      check(`Secret Scan: ${file}`, false, `Matches pattern ${pattern}`);
    }
  }
}
if (!secretLeaked) {
  check("Public Assets Secret Scan", true, "Zero plain text API keys or active tokens");
}

// 4. DOM Hygiene in Production Frontend
const appJsContent = fs.readFileSync(path.join(ROOT_DIR, "public", "app.js"), "utf8");
const dangerousSinks = [
  { sink: ".innerHTML", pass: !appJsContent.includes(".innerHTML") },
  { sink: ".outerHTML", pass: !appJsContent.includes(".outerHTML") },
  { sink: "eval(", pass: !appJsContent.includes("eval(") },
  { sink: "document.write(", pass: !appJsContent.includes("document.write(") },
];

for (const s of dangerousSinks) {
  check(`DOM Hygiene: Zero ${s.sink}`, s.pass);
}

// 5. Canonical Documentation Audit
const docsDir = path.join(ROOT_DIR, "docs");
if (fs.existsSync(docsDir)) {
  const docFiles = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md"));
  check("Canonical Docs Registry", docFiles.length >= 45, `Found ${docFiles.length} canonical documents`);
} else {
  check("Canonical Docs Registry", false, "docs/ directory missing");
}

// 6. Build Artifacts
const distDir = path.join(ROOT_DIR, "dist");
check("Build Output (dist/)", fs.existsSync(distDir) && fs.readdirSync(distDir).length > 0);

console.log("------------------------------------------------------------");
const allPassed = checks.every((c) => c.pass);
console.log(`Summary: ${checks.filter((c) => c.pass).length}/${checks.length} checks passed.`);
if (!allPassed) {
  console.error("❌ RELEASE HEALTH CHECK FAILED");
  process.exit(1);
} else {
  console.log("✅ RELEASE HEALTH CHECK PASSED (Release Candidate Ready)");
  process.exit(0);
}
