# Public Demo Release 1.3.0 Specification & Deployment Record
## AI Operating Platform Portfolio â€” PROJ-01-TENTACIONES

============================================================
CANONICAL DOCUMENT: docs/RELEASE_1_3_0.md
STATUS: CERTIFIED
PROJECT: PROJ-01-TENTACIONES
RELEASE: v1.3.0 (Phase 87 Certified)
REPOSITORY VISIBILITY: Strictly PRIVATE
DEPLOYMENT MODEL: Static Zero-Secret Public Storefront
============================================================

## 1. Release Metadata

| Field | Value |
| :--- | :--- |
| **Project Code** | `PROJ-01-TENTACIONES` |
| **Version** | `v1.3.0` |
| **Release Type** | Real 3D GLB/GLTF Binary Pipeline + Static Public Demo |
| **Git Repository** | `https://github.com/johangonzahenri/tentaciones-ai-commerce.git` |
| **Git Visibility** | **STRICTLY PRIVATE** |
| **Active Branch** | `main` |
| **Target Hosting Provider** | Vercel / GitHub Pages / Static S3 Edge CDN |
| **Build Command** | `npm run build` (Static Export: `public/`) |
| **Output Directory** | `public/` |
| **HTTPS Enforced** | Yes (TLS 1.3) |

---

## 2. 3D GLB/GLTF Verified Asset Inventory

The release bundles 4 synthetically generated, CC0-1.0 licensed binary/JSON spatial models:

```text
public/assets/3d/
â”œâ”€â”€ footwear/
â”‚   â””â”€â”€ pro-carbon-racer.glb      (1,144 bytes, GLB 2.0 Binary, 10 vertices, 12 triangles)
â”œâ”€â”€ apparel/
â”‚   â”œâ”€â”€ polera-essential.gltf     (2,023 bytes, GLTF 2.0 Embedded, 12 vertices, 16 triangles)
â”‚   â””â”€â”€ silk-evening-dress.gltf   (2,026 bytes, GLTF 2.0 Embedded, 12 vertices, 16 triangles)
â””â”€â”€ accessories/
    â””â”€â”€ reloj-titanio.glb         (1,236 bytes, GLB 2.0 Binary, 14 vertices, 20 triangles)
```

---

## 3. Real Asset Loading & Graceful Fallback Architecture

```text
Product Detail ("Ver en 3D")
              â”‚
              â–¼
    Resolve 3D Asset URL
              â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â–¼                   â–¼
.glb Binary         .gltf JSON
    â”‚                   â”‚
ArrayBuffer         fetch JSON
    â”‚                   â”‚
parseGLBBuffer      parseGLTFJson
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
              â–¼
    Hardware Canvas 3D
   (Perspective Orbit)
              â”‚
   (If Network/Fetch Fails)
              â–¼
   Procedural Fallback 3D
              â–¼
   2D Product Image View
```

---

## 4. Verification Acceptance Matrix

- [x] **Storefront Navigation**: Category filtering across poleras, vestidos, calzado, etc.
- [x] **Natural Language Search**: Intent parsing and matching.
- [x] **Real 3D GLB/GLTF Loading**: Binary header validation (`0x46546C67`), JSON mesh parsing, 60 FPS Canvas rendering.
- [x] **Orbital 3D Controls**: Mouse drag rotation, wheel zoom, touch gestures on mobile, auto-spin.
- [x] **AR / Fitting Room**: Profile selection (Nova, Sora, Mateo) and biometric recommendation.
- [x] **Cart Math & Free Shipping**: CLP $30.000 threshold dynamic calculation.
- [x] **Demo Checkout**: Webpay sandbox simulation without live credit card transmission.
- [x] **Bilingual Parity**: 100% Spanish (`es-419`) & English (`en`).
- [x] **Zero Secret Leakage**: 0 API keys, 0 private URLs, 0 database connection strings.
