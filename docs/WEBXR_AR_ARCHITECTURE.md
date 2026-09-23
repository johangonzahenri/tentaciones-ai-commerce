# WebXR AR Spatial Experience & Hit-Test Architecture
## AI Operating Platform Portfolio â€” PROJ-01-TENTACIONES

============================================================
CANONICAL DOCUMENT: docs/WEBXR_AR_ARCHITECTURE.md
STATUS: CERTIFIED
PROJECT: PROJ-01-TENTACIONES
RELEASE: v1.4.0 (Phase 88 Certified)
MODULE: WebXR Immersive-AR Spatial Placement Engine
HARDWARE INTEGRATION: Hit-Test & Surface Detection Pipeline
============================================================

## 1. Architectural Scope & Product Honesty Boundary

This document defines the spatial Augmented Reality architecture for **Tentaciones AI Commerce** (`PROJ-01-TENTACIONES`).

> [!IMPORTANT]
> **Product Honesty & Capabilities Boundary**:
> * **CURRENT IN-SCOPE CAPABILITIES**: WebXR `immersive-ar` session initialization, Raycast/Hit-Test surface anchoring, 3D GLB/GLTF spatial placement, 60 FPS orbital transformation (scale 0.25x - 2.5x, 45Â° rotation), and multi-tier graceful degradation.
> * **EXPLICITLY OUT OF SCOPE**: Human pose estimation, body tracking landmarks, body segmentation, parametric garment cloth deformation, and biometric depth reconstruction. (Reserved for future specialized phases).

---

## 2. Multi-Level Fallback Cascade

The application guarantees that every user, regardless of hardware capabilities, experiences a functional and rich product interaction:

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ LEVEL 1: WebXR Immersive AR (Camera + Hit-Test Anchor)  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚ (If WebXR / Camera Unavailable)
                             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ LEVEL 2: 3D Real GLB / GLTF Spatial Model Viewer        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚ (If Binary Load Fails)
                             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ LEVEL 3: Procedural Mathematical Canvas 3D Mesh         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚ (If User Requests Sizing)
                             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ LEVEL 4: 2D Biometric Fitting Simulation (Nova/Sora/Mateo)â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚ (Static Lowest Tier)
                             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ LEVEL 5: High-Fidelity Static SVG / Image View          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 3. WebXR Lifecycle & Resource Management

```text
Idle / Storefront
       â”‚
       â–¼
User Clicks "WebXR Espacial"
       â”‚
       â”œâ”€â”€ Request navigator.xr.isSessionSupported("immersive-ar")
       â”‚     â”œâ”€â”€ Succeeded â†’ Request session ({ optionalFeatures: ["hit-test", "local-floor"] })
       â”‚     â””â”€â”€ Denied/Unsupported â†’ Degrade to Level 2/4 Fallback
       â”‚
       â–¼
Session Initialization (AR_INITIALIZING)
       â”‚
       â”œâ”€â”€ Request Reference Space ("local-floor" / "local")
       â”œâ”€â”€ Request Hit-Test Source (requestHitTestSource)
       â””â”€â”€ Start renderLoop (requestAnimationFrame)
       â”‚
       â–¼
Surface Scanning (AR_SCANNING_SURFACE)
       â”‚
       â”œâ”€â”€ Reticle Ring Pulses at Screen Center
       â””â”€â”€ Hit-Test Finds Surface Matrix â†’ AR_SURFACE_DETECTED
       â”‚
       â–¼
Object Placement (AR_PLACED)
       â”‚
       â”œâ”€â”€ Render Model (GLB/GLTF/Procedural) at World Transform
       â””â”€â”€ Display Spatial HUD Controls (Scale, Rotate, Remove)
       â”‚
       â–¼
Session Exit / Cleanup (AR_EXITED)
       â”‚
       â”œâ”€â”€ Cancel Hit-Test Source
       â”œâ”€â”€ Cancel Animation Frames
       â”œâ”€â”€ End XR Session
       â””â”€â”€ Restore 2D Viewport State
```

---

## 4. Transform Matrix & Bounding Constraints

Spatial transforms adhere to strict physical boundaries:

* **Scale Range**: Minimum $0.25\times$, Maximum $2.5\times$, Default $1.0\times$ (normalized for viewport representation).
* **Rotation**: Incremental $45^\circ$ planar rotation around the $Y$-axis.
* **Anchor Position**: Projected onto the detected ground plane via $4\times 4$ transformation matrices.
