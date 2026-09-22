# 3D GLTF Interactive Viewer Architecture
## AI Operating Platform Portfolio — PROJ-01-TENTACIONES

============================================================
CANONICAL DOCUMENT: docs/3D_ARCHITECTURE.md
STATUS: CERTIFIED
PROJECT: PROJ-01-TENTACIONES
RELEASE: v1.2.0 (Phase 86)
REPRESENTATION: Native 3D Canvas / WebGL Projection Engine
DEPENDENCY OVERHEAD: 0 KB (Zero External NPM Dependencies)
============================================================

## 1. Executive Summary

This document specifies the architectural blueprint for the 3D GLTF product visualization layer within **Tentaciones AI Commerce** (`PROJ-01-TENTACIONES`). 

The 3D interactive viewer provides realistic spatial representation of apparel, footwear, and accessories directly in the browser. It delivers fluid 60 FPS orbital manipulation, interactive rotation, zoom, auto-spin, and dynamic material wireframe/solid shading while strictly maintaining zero external runtime dependencies and guaranteed fail-closed security.

---

## 2. Layered Progressive Disclosure

The application enforces a 5-tier progressive disclosure model for product engagement:

```text
+-------------------------------------------------------------+
| 1. Product Catalog Grid (Static Thumbnails & Quick Badges)  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 2. 3D GLTF / Spatial Model Viewer (Canvas Orbit / Shading)  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 3. AR / WebXR Virtual Fitting Room (Spatial Anchoring)      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 4. Biometric Sizing & Confidence Engine (Nova/Sora/Mateo)   |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 5. Demo Bag & Webpay Sandbox Checkout Flow                 |
+-------------------------------------------------------------+
```

---

## 3. Mathematical Projection & Rendering Engine

The 3D viewer is driven by a lightweight mathematical projection engine embedded in `public/app.js`:

1. **3D Coordinate Representation**:
   Objects are constructed from vertices $(x, y, z)$ and polygonal face indices with directional normal vectors.
2. **Matrix Rotation Transforms**:
   $$\begin{bmatrix} x' \\ y' \\ z' \end{bmatrix} = R_x(\theta_x) \cdot R_y(\theta_y) \cdot \begin{bmatrix} x \\ y \\ z \end{bmatrix}$$
3. **Perspective Projection**:
   $$x_{screen} = \frac{x' \cdot d}{z' + z_{cam}} + x_{center}, \quad y_{screen} = \frac{y' \cdot d}{z' + z_{cam}} + y_{center}$$
4. **Depth Sorting (Painter's Algorithm)**:
   Faces are sorted in descending order of average transformed $z$-depth before rasterization to eliminate visual occlusion artifacts without requiring hardware z-buffers.
5. **Lighting & Shading**:
   Lambertian directional light vector $\vec{L} = (0.3, -0.6, 0.74)$ computes face luminance $\max(0.18, \vec{N} \cdot \vec{L})$.

---

## 4. Geometric Procedural Presets

For instant synthetic demo visualization without network overhead, the engine features 4 procedural geometry generators:

* **Footwear Geometry (`sneaker`)**: Sole platform, upper toe box, heel curve, tongue, and laces structure.
* **Apparel Geometry (`dress`)**: Fitted bodice, flared hem skirt, waist cinch, and drape profile.
* **Tops & Hoodies (`top`)**: Torso cylindrical contour, shoulder flares, sleeves, and neckline.
* **Accessories & Generic (`accessory`)**: Faceted beveled polyhedron with specular highlights.

---

## 5. Security & Fail-Closed Guardrails

* **Zero Dynamic Code Execution**: Prohibits `eval()`, `new Function()`, or dynamic scripting inside 3D assets.
* **Strict Asset Resolution**: Asset URLs must be relative (`/assets/3d/...`) or origin-bound. Remote cross-origin asset injection is rejected with a graceful fallback to 2D view.
* **DOM Integrity**: All viewer controls and labels are constructed using `document.createElement()` and `textContent`. 0 `.innerHTML` or `.outerHTML`.
