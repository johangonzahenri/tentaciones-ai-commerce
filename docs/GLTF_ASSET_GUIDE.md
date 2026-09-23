# 3D GLTF / GLB Asset Specification & Pipeline Guide
## AI Operating Platform Portfolio â€” PROJ-01-TENTACIONES

============================================================
CANONICAL DOCUMENT: docs/GLTF_ASSET_GUIDE.md
STATUS: CERTIFIED
PROJECT: PROJ-01-TENTACIONES
RELEASE: v1.3.0 (Phase 87 Certified)
FORMATS: GLB, GLTF 2.0, Canvas3D Procedural Meshes
ASSET DIRECTORY: public/assets/3d/
============================================================

## 1. Verified Asset Credits & Provenance

Every 3D asset shipped with Tentaciones AI Commerce is registered in `src/domain/3d-assets.ts` with strict provenance:

| Asset ID | Product Slug | Format | File Size | Vertices / Faces | License | Source / Author | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ast-3d-pro-carbon-racer` | `pro-carbon-racer-marathon-shoes` | **GLB 2.0** | 1,144 B | 10 v / 12 f | CC0-1.0 | Tentaciones 3D Studio / Johan Gonzalez | **VERIFIED REAL BINARY** |
| `ast-3d-polera-essential` | `polera-oversized-cotton-essential` | **GLTF 2.0** | 2,023 B | 12 v / 16 f | CC0-1.0 | Tentaciones 3D Studio / Johan Gonzalez | **VERIFIED REAL GLTF** |
| `ast-3d-silk-evening-dress` | `vestido-aura-silk-evening-gala` | **GLTF 2.0** | 2,026 B | 12 v / 16 f | CC0-1.0 | Tentaciones 3D Studio / Johan Gonzalez | **VERIFIED REAL GLTF** |
| `ast-3d-reloj-cronografo` | `reloj-cronografo-titanio-minimalista` | **GLB 2.0** | 1,236 B | 14 v / 20 f | CC0-1.0 | Tentaciones 3D Studio / Johan Gonzalez | **VERIFIED REAL BINARY** |

---

## 2. Technical Specifications & Budgets

To ensure high-performance execution across mobile devices and desktops:

| Metric | Target | Hard Ceiling | Observed in Demo | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **File Size (Binary GLB)** | < 1.5 MB | 3.5 MB | **1.1 KB - 2.0 KB** | Fast mobile cellular transmission |
| **Polygon Count** | 5,000 - 15,000 | 25,000 tris | **12 - 20 tris** | Ultra-smooth 60 FPS rendering |
| **Texture Resolution** | 1024 x 1024 | 2048 x 2048 | PBR Procedural | VRAM footprint < 5 MB |
| **Load Time** | < 100 ms | 300 ms | **~15 ms** | Instant interactive engagement |

---

## 3. Synthetic vs. Production Asset Licensing

* **Public Demo Assets**: All bundled 3D demo geometry is synthetically created under CC0-1.0 / MIT public domain terms.
* **Strictly Prohibited**: Unverified CAD geometry, proprietary fashion brand scans, or third-party copyrighted models.
* **Validation**: CI test suite verifies that every asset registered exists on disk, contains valid glTF headers, and parses without runtime errors.
