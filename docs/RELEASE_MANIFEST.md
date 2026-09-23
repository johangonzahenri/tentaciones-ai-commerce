# CANONICAL DOCUMENT: TENTACIONES AI COMMERCE RELEASE MANIFEST

STATUS: CERTIFIED
VERSION: 1.8.1
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
RELEASE TYPE: FINAL RELEASE PACKAGE READY (Public Demo Static Artifact)
OWNER: Lead Product Engineer, Release Engineer & Security Architect
RELEASE DATE: 2026-09-23

---

## 1. Project Identity & Overview
* **Project Name**: `PROJ-01-TENTACIONES`
* **Application ID**: `tentaciones-commerce`
* **Parent Platform**: `AI Operating Platform (v1.4.0)`
* **License**: `Apache-2.0`
* **Repository Visibility**: `STRICTLY PRIVATE`
* **Demo Deployment**: `Public Static / Controlled Node.js Runtime`

---

## 2. Release Scope & Operational Boundary

### Public Demo Scope (`PUBLIC_DEMO` / Default)
* **Synthetic Product Catalog**: 4 fashion categories, multi-currency support ($CLP, EUR), stock management and variant selection.
* **AI-Assisted Natural Language Discovery**: Search interpretation and catalog recommendation matching.
* **Interactive 3D Canvas Projection & GLB/glTF Viewer**: Fluid orbital rotation, dynamic zoom, illumination and procedural fallback.
* **WebXR Spatial AR Virtual Fitting**: Hit-test surface placement, parametric scaling (0.25x - 2.5x) and 5-level device fallback.
* **AI Virtual Try-On (VTO Engine)**: Ephemeral user image processing, biometric calibrated avatars (`Nova`, `Sora`, `Mateo`), image quality assessment pipeline, and deterministic synthetic inference via `DemoVirtualTryOnProvider`.
* **Smart Shopping Cart & Free Shipping Calculation**: Real-time threshold calculation ($30.000 CLP).
* **Simulated Webpay Demo Checkout**: Order generation with synthetic transaction IDs and inventory hold verification.

### Private / Connected Scope (`PRIVATE_CONNECTED_DEMO`)
* **FASHN AI External Inference**: Supported via `FashnVirtualTryOnProvider` (Try-On Max and Try-On v1.6).
* **Activation Gate**: Evaluated via `FashnRealPilotActivationGate`. **BLOCKED (FAIL-CLOSED)** in the absence of `FASHN_API_KEY`.
* **Enterprise Upstream Gateway**: Authenticated AI Operating Platform connection.

---

## 3. Included vs Excluded Features Matrix

| Feature | Public Demo Scope | Private Connected Scope | Status in v1.8.0 |
| :--- | :--- | :--- | :--- |
| **Catalog Exploration** | Synthetic Catalog Data | Live Database Sync | **INCLUDED (Demo)** |
| **3D GLB/glTF Inspection** | Local CC0 Models | Dynamic Asset Streaming | **INCLUDED (Demo)** |
| **WebXR Spatial Placement** | Native WebXR + Fallback | Native WebXR + Fallback | **INCLUDED (Demo)** |
| **VTO Engine (Synthetic)** | `DemoVirtualTryOnProvider` | `DemoVirtualTryOnProvider` | **INCLUDED (Demo)** |
| **VTO Engine (FASHN AI)** | Excluded (Fail-Closed) | Gated by `FASHN_API_KEY` | **EXCLUDED (Gated)** |
| **Payment Gateway** | `WEBPAY_DEMO` (Simulated) | Real Transbank / Stripe | **EXCLUDED (Simulated)** |
| **Biometric Sizing** | Local Calibrated Formula | AI Multi-Biometric API | **INCLUDED (Demo)** |

---

## 4. Security Guarantees & Privacy Invariants
1. **Zero Secret Leakage**: Zero API keys, private tokens, or backend credentials exist in public bundles (`public/`).
2. **Fail-Closed Gate**: Any attempt to trigger real external inference without valid credentials immediately aborts with Exit Code 1 / `VTO_PROVIDER_UNAVAILABLE`.
3. **No Silent Fallback**: Real provider requests never silently fallback to demo mode without explicit configuration.
4. **Ephemeral Memory Lifecycle**: Uploaded photos are handled in memory; Object URLs are revoked deterministically (`URL.revokeObjectURL()`).
5. **DOM Hygiene**: 0 unsafe sinks (`.innerHTML`, `.outerHTML`, `eval()`, `document.write()`).

---

## 5. Verification Commands

```bash
# 1. TypeCheck and Compile TypeScript
node_modules/.bin/tsc.cmd --project tsconfig.json

# 2. Run Comprehensive Test Runner (110 Tests across 10 Suites)
node --test dist/tests/*.js

# 3. Execute Release Health Check
node scripts/release-check.mjs

# 4. Verify VTO Pilot Gate & Dry-Run
node scripts/vto-pilot.mjs check
node scripts/vto-pilot.mjs dry-run

# 5. Git Integrity Audit (No Commits, No Pushes)
git diff --check
git status
```

---

## 6. Deployment Target & Hosting Architecture
* **Static Client**: GitHub Pages / Vercel / Netlify (`public/` directory).
* **Full-Stack Node Server**: Local port 4000 (`dist/src/server.js`) with zero runtime dependencies.
* **Content Security Policy (CSP)**: Strict origin isolation allowing only whitelisted HTTPS CDN and base64 data URIs.

---

## 7. Rollback & Recovery Strategy
* The codebase operates under zero external mutable database state.
* Rollback is immediate by restoring to baseline Git commit `8996037`.
