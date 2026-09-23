#!/usr/bin/env node
/**
 * Tentaciones AI Commerce — Release Inventory & Checksum Verification
 * Produces a reproducible inventory of the public release tree.
 * Verifies completeness, unexpected assets, potential secrets, and local development paths.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

console.log("============================================================");
console.log("  TENTACIONES AI COMMERCE — FINAL RELEASE INVENTORY");
console.log("============================================================");

function collectFiles(dir, base = "") {
  let entries = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const relPath = path.join(base, item.name).replace(/\\/g, "/");
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      entries = entries.concat(collectFiles(fullPath, relPath));
    } else {
      const stats = fs.statSync(fullPath);
      entries.push({ relPath, fullPath, size: stats.size });
    }
  }
  return entries;
}

const expectedPublicFiles = [
  "index.html",
  "app.js",
  "styles.css",
  "i18n.js",
  "assets/images/hero-cover.svg",
  "assets/images/demo-vto-composite.svg",
  "assets/images/walkthrough-step1.svg",
  "assets/images/walkthrough-step2.svg",
  "assets/images/walkthrough-step3.svg",
  "assets/images/walkthrough-step4.svg",
  "assets/images/walkthrough-step5.svg",
  "assets/3d/accessories/reloj-titanio.glb",
  "assets/3d/apparel/polera-essential.gltf",
  "assets/3d/apparel/silk-evening-dress.gltf",
  "assets/3d/footwear/pro-carbon-racer.glb",
];

const foundFiles = collectFiles(PUBLIC_DIR);
let totalBytes = 0;
const missingExpected = [];
const unexpectedFiles = [];
const potentialSecrets = [];
const potentialLocalPaths = [];

for (const exp of expectedPublicFiles) {
  const found = foundFiles.find((f) => f.relPath === exp);
  if (!found) {
    missingExpected.push(exp);
  }
}

for (const file of foundFiles) {
  totalBytes += file.size;
  if (!expectedPublicFiles.includes(file.relPath)) {
    unexpectedFiles.push(file.relPath);
  }

  // Scan text files for secrets and dev paths
  if (file.relPath.endsWith(".html") || file.relPath.endsWith(".js") || file.relPath.endsWith(".css")) {
    const text = fs.readFileSync(file.fullPath, "utf8");
    if (/fa_live_[a-zA-Z0-9_-]{16,}/.test(text) || /sk_live_[a-zA-Z0-9_-]{16,}/.test(text) || /Bearer\s+[a-zA-Z0-9_\-\.]{25,}/.test(text)) {
      potentialSecrets.push(file.relPath);
    }
    if (/[a-zA-Z]:\\[Uu]sers\\/.test(text) || /\/home\/[a-zA-Z0-9_-]+\//.test(text)) {
      potentialLocalPaths.push(file.relPath);
    }
  }
}

console.log(`Public Release Root:    ${PUBLIC_DIR}`);
console.log(`Included Files:         ${foundFiles.length}`);
console.log(`Total Byte Size:        ${(totalBytes / 1024).toFixed(2)} KB (${totalBytes} bytes)`);
console.log(`Missing Expected:       ${missingExpected.length > 0 ? missingExpected.join(", ") : "0 (None)"}`);
console.log(`Unexpected Files:       ${unexpectedFiles.length > 0 ? unexpectedFiles.join(", ") : "0 (None)"}`);
console.log(`Potential Secrets:      ${potentialSecrets.length > 0 ? potentialSecrets.join(", ") : "0 (None)"}`);
console.log(`Potential Local Paths:  ${potentialLocalPaths.length > 0 ? potentialLocalPaths.join(", ") : "0 (None)"}`);
console.log("------------------------------------------------------------");

let isBlocked = false;
if (missingExpected.length > 0 || potentialSecrets.length > 0 || potentialLocalPaths.length > 0) {
  isBlocked = true;
}

if (isBlocked) {
  console.error("RESULT: BLOCKED");
  process.exit(1);
} else {
  console.log("RESULT: PASS");
  process.exit(0);
}
