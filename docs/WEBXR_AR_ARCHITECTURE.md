# WebXR AR Spatial Experience & Hit-Test Architecture
## AI Operating Platform Portfolio — PROJ-01-TENTACIONES

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
> * **CURRENT IN-SCOPE CAPABILITIES**: WebXR `immersive-ar` session initialization, Raycast/Hit-Test surface anchoring, 3D GLB/GLTF spatial placement, 60 FPS orbital transformation (scale 0.25x - 2.5x, 45° rotation), and multi-tier graceful degradation.
> * **EXPLICITLY OUT OF SCOPE**: Human pose estimation, body tracking landmarks, body segmentation, parametric garment cloth deformation, and biometric depth reconstruction. (Reserved for future specialized phases).

---

## 2. Multi-Level Fallback Cascade

The application guarantees that every user, regardless of hardware capabilities, experiences a functional and rich product interaction:

```text
┌─────────────────────────────────────────────────────────┐
│ LEVEL 1: WebXR Immersive AR (Camera + Hit-Test Anchor)  │
└────────────────────────────┬────────────────────────────┘
                             │ (If WebXR / Camera Unavailable)
                             ▼
┌─────────────────────────────────────────────────────────┐
│ LEVEL 2: 3D Real GLB / GLTF Spatial Model Viewer        │
└────────────────────────────┬────────────────────────────┘
                             │ (If Binary Load Fails)
                             ▼
┌─────────────────────────────────────────────────────────┐
│ LEVEL 3: Procedural Mathematical Canvas 3D Mesh         │
└────────────────────────────┬────────────────────────────┘
                             │ (If User Requests Sizing)
                             ▼
┌─────────────────────────────────────────────────────────┐
│ LEVEL 4: 2D Biometric Fitting Simulation (Nova/Sora/Mateo)│
└────────────────────────────┬────────────────────────────┘
                             │ (Static Lowest Tier)
                             ▼
┌─────────────────────────────────────────────────────────┐
│ LEVEL 5: High-Fidelity Static SVG / Image View          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. WebXR Lifecycle & Resource Management

```text
Idle / Storefront
       │
       ▼
User Clicks "WebXR Espacial"
       │
       ├── Request navigator.xr.isSessionSupported("immersive-ar")
       │     ├── Succeeded → Request session ({ optionalFeatures: ["hit-test", "local-floor"] })
       │     └── Denied/Unsupported → Degrade to Level 2/4 Fallback
       │
       ▼
Session Initialization (AR_INITIALIZING)
       │
       ├── Request Reference Space ("local-floor" / "local")
       ├── Request Hit-Test Source (requestHitTestSource)
       └── Start renderLoop (requestAnimationFrame)
       │
       ▼
Surface Scanning (AR_SCANNING_SURFACE)
       │
       ├── Reticle Ring Pulses at Screen Center
       └── Hit-Test Finds Surface Matrix → AR_SURFACE_DETECTED
       │
       ▼
Object Placement (AR_PLACED)
       │
       ├── Render Model (GLB/GLTF/Procedural) at World Transform
       └── Display Spatial HUD Controls (Scale, Rotate, Remove)
       │
       ▼
Session Exit / Cleanup (AR_EXITED)
       │
       ├── Cancel Hit-Test Source
       ├── Cancel Animation Frames
       ├── End XR Session
       └── Restore 2D Viewport State
```

---

## 4. Transform Matrix & Bounding Constraints

Spatial transforms adhere to strict physical boundaries:

* **Scale Range**: Minimum $0.25\times$, Maximum $2.5\times$, Default $1.0\times$ (normalized for viewport representation).
* **Rotation**: Incremental $45^\circ$ planar rotation around the $Y$-axis.
* **Anchor Position**: Projected onto the detected ground plane via $4\times 4$ transformation matrices.
