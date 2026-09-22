import type { ARProfile, ProductCategory } from "./types.js";

export type ARCapabilityStatus = "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN" | "BLOCKED" | "PERMISSION_DENIED";

export type ARObjectState =
  | "AR_IDLE"
  | "AR_INITIALIZING"
  | "AR_READY"
  | "AR_SCANNING_SURFACE"
  | "AR_SURFACE_DETECTED"
  | "AR_PLACED"
  | "AR_TRANSFORMING"
  | "AR_ERROR"
  | "AR_EXITED";

export type ARFallbackTier =
  | "TIER_1_IMMERSIVE_HIT_TEST"
  | "TIER_2_REAL_GLB_VIEWER"
  | "TIER_3_PROCEDURAL_3D_VIEWER"
  | "TIER_4_2D_BIOMETRIC_FITTING"
  | "TIER_5_STATIC_PRODUCT_VIEW";

export interface ARCapabilities {
  readonly webxr: ARCapabilityStatus;
  readonly immersiveAr: ARCapabilityStatus;
  readonly hitTest: ARCapabilityStatus;
  readonly camera: ARCapabilityStatus;
  readonly glbParser: ARCapabilityStatus;
  readonly gltfParser: ARCapabilityStatus;
  readonly canvas3d: ARCapabilityStatus;
}

export interface ARPlacementTransform {
  x: number;
  y: number;
  z: number;
  rotationY: number; // degrees
  scale: number;     // 0.2 to 3.0
}

export interface ARSessionConfig {
  readonly requiredFeatures: readonly string[];
  readonly optionalFeatures: readonly string[];
  readonly minScale: number;
  readonly maxScale: number;
  readonly defaultScale: number;
}

export const DEFAULT_AR_SESSION_CONFIG: ARSessionConfig = {
  requiredFeatures: [],
  optionalFeatures: ["hit-test", "local-floor", "local"],
  minScale: 0.25,
  maxScale: 2.5,
  defaultScale: 1.0,
};

export function resolveARCapability(status: {
  hasNavigatorXR: boolean;
  isSessionSupported?: boolean;
  hasHitTestSource?: boolean;
  cameraAllowed?: boolean;
}): ARCapabilities {
  const webxr: ARCapabilityStatus = status.hasNavigatorXR ? "AVAILABLE" : "UNAVAILABLE";
  const immersiveAr: ARCapabilityStatus = !status.hasNavigatorXR
    ? "UNAVAILABLE"
    : status.isSessionSupported === true
    ? "AVAILABLE"
    : status.isSessionSupported === false
    ? "UNAVAILABLE"
    : "UNKNOWN";

  const hitTest: ARCapabilityStatus = webxr === "UNAVAILABLE" || immersiveAr === "UNAVAILABLE"
    ? "UNAVAILABLE"
    : immersiveAr === "AVAILABLE" && status.hasHitTestSource
    ? "AVAILABLE"
    : immersiveAr === "AVAILABLE" && status.hasHitTestSource === false
    ? "UNAVAILABLE"
    : "UNKNOWN";

  const camera: ARCapabilityStatus = status.cameraAllowed === false
    ? "PERMISSION_DENIED"
    : status.cameraAllowed === true
    ? "AVAILABLE"
    : "UNKNOWN";

  return {
    webxr,
    immersiveAr,
    hitTest,
    camera,
    glbParser: "AVAILABLE",
    gltfParser: "AVAILABLE",
    canvas3d: "AVAILABLE",
  };
}

export function determineFallbackTier(caps: ARCapabilities, hasRealAsset: boolean): ARFallbackTier {
  if (caps.immersiveAr === "AVAILABLE" && caps.hitTest === "AVAILABLE" && caps.camera !== "PERMISSION_DENIED") {
    return "TIER_1_IMMERSIVE_HIT_TEST";
  }
  if (hasRealAsset && (caps.glbParser === "AVAILABLE" || caps.gltfParser === "AVAILABLE")) {
    return "TIER_2_REAL_GLB_VIEWER";
  }
  if (caps.canvas3d === "AVAILABLE") {
    return "TIER_3_PROCEDURAL_3D_VIEWER";
  }
  return "TIER_4_2D_BIOMETRIC_FITTING";
}

export function clampARScale(scale: number, config: ARSessionConfig = DEFAULT_AR_SESSION_CONFIG): number {
  return Math.max(config.minScale, Math.min(config.maxScale, scale));
}
