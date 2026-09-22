# WebXR AR Spatial Session Lifecycle & State Machine Guide
## AI Operating Platform Portfolio — PROJ-01-TENTACIONES

============================================================
CANONICAL DOCUMENT: docs/AR_SESSION_GUIDE.md
STATUS: CERTIFIED
PROJECT: PROJ-01-TENTACIONES
RELEASE: v1.4.0 (Phase 88 Certified)
STATE MACHINE: Formal 9-State Discrete Lifecycle
CLEANUP POLICY: Zero Memory Leak / Single Active Session Lock
============================================================

## 1. Formal AR State Machine Transitions

```mermaid
stateDiagram-v2
    [*] --> AR_IDLE
    AR_IDLE --> AR_INITIALIZING : User clicks "WebXR Espacial"
    AR_INITIALIZING --> AR_SCANNING_SURFACE : Session & Canvas bound
    AR_INITIALIZING --> AR_ERROR : Permission Denied / NotSupportedError
    AR_SCANNING_SURFACE --> AR_SURFACE_DETECTED : Hit-test intersects plane
    AR_SURFACE_DETECTED --> AR_PLACED : User confirms placement ("Colocar")
    AR_PLACED --> AR_TRANSFORMING : User scales/rotates model
    AR_TRANSFORMING --> AR_PLACED : Gesture completes
    AR_PLACED --> AR_SURFACE_DETECTED : User clicks "Quitar"
    AR_PLACED --> AR_EXITED : User closes modal / switches to 2D
    AR_SURFACE_DETECTED --> AR_EXITED : User closes modal
    AR_ERROR --> AR_EXITED : Fallback activated
    AR_EXITED --> AR_IDLE : Resource cleanup complete
```

---

## 2. Resource Cleanup Guarantee

To prevent GPU memory leaks and duplicate render loops during repeated opens and closes:

* `cancelAnimationFrame(state.arSpatial.animFrameId)` is executed immediately upon session termination.
* `clearTimeout(state.arSpatial.isScanningSim)` prevents lingering state mutations.
* `session.end()` cleanly disposes of the underlying XR hardware device handle.
* All state values (`surfaceHit`, `placedObject`, `transform`) reset monotonically to default boundaries.
