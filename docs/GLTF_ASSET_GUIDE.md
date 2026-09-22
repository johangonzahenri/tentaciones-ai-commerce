# 3D GLTF / GLB Asset Specification & Pipeline Guide
## AI Operating Platform Portfolio — PROJ-01-TENTACIONES

============================================================
CANONICAL DOCUMENT: docs/GLTF_ASSET_GUIDE.md
STATUS: CERTIFIED
PROJECT: PROJ-01-TENTACIONES
RELEASE: v1.2.0 (Phase 86)
FORMATS: GLB, GLTF 2.0, Canvas3D Procedural Meshes
ASSET DIRECTORY: public/assets/3d/
============================================================

## 1. Asset Storage & Naming Conventions

All 3D models for Tentaciones AI Commerce must follow the structured directory layout:

```text
public/assets/3d/
├── apparel/
│   ├── silk-dress.glb
│   ├── oversized-hoodie.glb
│   └── tailored-blazer.glb
├── footwear/
│   ├── cyber-sneakers.glb
│   ├── leather-boots.glb
│   └── runner-pro.glb
└── accessories/
    ├── smart-watch.glb
    └── canvas-backpack.glb
```

### URL Resolution Standard:
* Base path: `/assets/3d/<category>/<slug>.glb`
* Fallback format: `model3DFormat: "canvas3d"` for procedurally synthesized low-latency fallback previews.

---

## 2. Technical Specifications & Budgets

To ensure high-performance execution across mobile devices and desktops:

| Metric | Target | Hard Ceiling | Rationale |
| :--- | :--- | :--- | :--- |
| **File Size (Binary GLB)** | < 1.5 MB | 3.5 MB | Fast mobile cellular transmission |
| **Polygon Count** | 5,000 - 15,000 | 25,000 tris | Smooth 60 FPS rendering on integrated GPUs |
| **Texture Resolution** | 1024 x 1024 | 2048 x 2048 | VRAM optimization |
| **Texture Compression** | KTX2 / Basis Universal | WebP / PNG | Low memory bandwidth footprint |
| **Draw Calls** | $\le 2$ per model | $\le 4$ per model | Reduced CPU overhead |
| **Draco Mesh Compression**| Enabled | Optional | Up to 70% reduction in mesh geometry size |

---

## 3. Synthetic vs. Production Asset Licensing

* **Public Demo Assets**: All bundled 3D demo geometry is synthetically created or procedurally generated under MIT / CC0 terms.
* **Prohibited**: Proprietary manufacturer CAD files, unlicensed commercial fashion brand scans, or third-party copyrighted geometry.
* **Validation**: CI builds verify that all referenced 3D assets in `catalog-data.ts` either resolve locally or feature safe procedural fallbacks.
