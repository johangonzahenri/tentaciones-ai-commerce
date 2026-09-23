# WebXR Device Compatibility & Hardware Requirements
## AI Operating Platform Portfolio â€” PROJ-01-TENTACIONES

============================================================
CANONICAL DOCUMENT: docs/WEBXR_COMPATIBILITY.md
STATUS: CERTIFIED
PROJECT: PROJ-01-TENTACIONES
RELEASE: v1.4.0 (Phase 88 Certified)
DEVICE COVERAGE: Android (Chrome 79+), iOS (WebXR Viewer), Desktop WebGL
SECURE CONTEXT: HTTPS Required (TLS 1.3 / W3C WebXR Specification)
============================================================

## 1. Hardware & Platform Compatibility Matrix

| Platform / Operating System | Browser / Runtime | WebXR Support | Hit-Test Support | Fallback Path |
| :--- | :--- | :--- | :--- | :--- |
| **Android 9.0+ (ARCore supported)** | Google Chrome 79+ | **NATIVE FULL** | **NATIVE FULL** | Level 1 (Immersive AR) |
| **Android (Non-ARCore)** | Chrome / Firefox | Unsupported | Unsupported | Level 2 / Level 4 Fallback |
| **iOS / iPadOS 14+** | Safari Mobile | Partial (via USDZ) | Simulated | Level 2 / Level 4 Fallback |
| **iOS (WebXR Viewer)** | Mozilla WebXR App | **SUPPORTED** | **SUPPORTED** | Level 1 (Immersive AR) |
| **Desktop (Windows / macOS / Linux)** | Chrome / Edge / Brave | Unsupported | Simulated | Level 2 / Level 3 (Canvas 3D) |
| **VR / Mixed Reality Headsets** | Meta Quest / VisionOS | **NATIVE FULL** | **NATIVE FULL** | Level 1 (Immersive AR/VR) |

---

## 2. Secure Context & Permissions Invariant

According to the W3C WebXR Device API Specification:

1. **HTTPS Requirement**: WebXR sessions (`navigator.xr.requestSession`) fail immediately on unencrypted `http://` origins (except `http://localhost` and `http://127.0.0.1` for local development).
2. **Feature Policy / Permissions Policy**: Edge proxies must emit:
   ```http
   Permissions-Policy: xr-spatial-tracking=(self), camera=(self)
   ```
3. **Explicit User Activation**: The browser mandates a direct user gesture (button click `PROBAR EN AR`) before requesting XR sessions or camera permissions. Background autoplay is strictly prohibited.
