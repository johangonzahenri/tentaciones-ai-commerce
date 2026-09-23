# SHOWCASE MEDIA ASSETS & VISUAL ARTIFACTS MANIFEST

CANONICAL DOCUMENT: docs/SHOWCASE_MEDIA.md
STATUS: CERTIFIED
VERSION: 1.5.0
APPLICATION: PROJ-01-TENTACIONES
PORTFOLIO: AI Operating Platform

---

## 1. Overview

This document catalogues all visual media assets, SVG technical diagrams, and 3D binary files utilized across the **Tentaciones AI Commerce** showcase and interactive walkthrough.

All assets are licensed under **CC0-1.0** or created as **Synthetic Showcase Artifacts** to guarantee zero third-party copyright restrictions and zero proprietary asset leaks.

---

## 2. Media Asset Manifest

| Asset ID | File Path | Type | Aspect Ratio | License | Description |
|---|---|---|---|---|---|
| `hero-cover-canvas` | `/assets/images/hero-cover.svg` | SVG Vector | 16:9 | CC0-1.0 / Synthetic | Main hero branding with 3D wireframe sneaker and spatial orbit badge. |
| `ar-step1-product-selection` | `/assets/images/walkthrough-step1.svg` | SVG Vector | 16:9 | CC0-1.0 / Synthetic | Step 1: Catalog selection and 3D glTF inspection canvas. |
| `ar-step2-capability-handshake` | `/assets/images/walkthrough-step2.svg` | SVG Vector | 16:9 | CC0-1.0 / Synthetic | Step 2: WebXR API detection, permission status, and session initialization. |
| `ar-step3-hit-test-scanning` | `/assets/images/walkthrough-step3.svg` | SVG Vector | 16:9 | CC0-1.0 / Synthetic | Step 3: Optical plane detection, surface raycasting, and reticle tracking. |
| `ar-step4-spatial-placement` | `/assets/images/walkthrough-step4.svg` | SVG Vector | 16:9 | CC0-1.0 / Synthetic | Step 4: 6-DoF spatial anchoring and 3D coordinate system placement. |
| `ar-step5-interaction-bag` | `/assets/images/walkthrough-step5.svg` | SVG Vector | 16:9 | CC0-1.0 / Synthetic | Step 5: Biometric sizing verification and seamless checkout transfer. |

---

## 3. 3D Binary & Spatial Asset Inventory

| Asset ID | Physical Path | Format | Size | License | Verification Check |
|---|---|---|---|---|---|
| `polera-essential-glb` | `/assets/3d/apparel/polera-essential.glb` | GLB 2.0 | 2.1 KB | CC0-1.0 Synthetic | Magic Header: `0x46546C67`, Version 2 |
| `silk-evening-dress-glb` | `/assets/3d/apparel/silk-evening-dress.glb` | GLB 2.0 | 2.1 KB | CC0-1.0 Synthetic | Magic Header: `0x46546C67`, Version 2 |
| `pro-carbon-racer-glb` | `/assets/3d/footwear/pro-carbon-racer.glb` | GLB 2.0 | 2.1 KB | CC0-1.0 Synthetic | Magic Header: `0x46546C67`, Version 2 |
| `polera-essential-gltf` | `/assets/3d/apparel/polera-essential.gltf` | glTF JSON | 1.1 KB | CC0-1.0 Synthetic | Schema Version 2.0, Meshes defined |

---

## 4. Media Usage & Guidelines

1. **Self-Contained Storage:** All media assets are hosted locally inside `/public/assets/` to ensure offline resilience and zero dependency on unverified external CDNs.
2. **Strict Vector Quality:** Walkthrough illustrations use native SVG elements for crystal-clear rendering across standard desktop monitors and high-DPI Retina mobile screens.
3. **Optimized Payloads:** All SVG files are < 5 KB each and binary GLB files are < 5 KB each, ensuring near-instant page load times (< 100 ms).
