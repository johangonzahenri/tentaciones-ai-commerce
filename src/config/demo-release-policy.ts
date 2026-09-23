/**
 * Tentaciones AI Commerce — Public Demo Release Policy & Boundary Definition
 * Defines the formal operational boundary between the Public Demo and Private/Connected modes.
 *
 * ============================================================================
 * RELEASE BOUNDARY POLICY: STRICT ISOLATION & FAIL-CLOSED
 * SPECIFICATION VERSION:   v1.8.1 (Final Release Package Ready)
 * ============================================================================
 */

export interface DemoReleaseScope {
  readonly modeName: "PUBLIC_DEMO" | "PRIVATE_CONNECTED_DEMO" | "DEVELOPMENT";
  readonly isPublicDemo: boolean;
  readonly allowsSyntheticData: boolean;
  readonly allowsDemoVTO: boolean;
  readonly allowsRealVTO: boolean;
  readonly requiresExternalApiKey: boolean;
  readonly allowsSimulatedCheckout: boolean;
  readonly requiresRealPaymentGateway: boolean;
  readonly allowedImageProviders: readonly string[];
  readonly allowedVTOProviders: readonly string[];
  readonly publicDisclosureMessage: {
    readonly es: string;
    readonly en: string;
  };
}

export const PUBLIC_DEMO_RELEASE_POLICY: DemoReleaseScope = {
  modeName: "PUBLIC_DEMO",
  isPublicDemo: true,
  allowsSyntheticData: true,
  allowsDemoVTO: true,
  allowsRealVTO: false,
  requiresExternalApiKey: false,
  allowsSimulatedCheckout: true,
  requiresRealPaymentGateway: false,
  allowedImageProviders: ["local-assets", "demo-svg", "canvas-procedural"],
  allowedVTOProviders: ["demo-synthetic"],
  publicDisclosureMessage: {
    es: "Entorno público de demostración comercial y probador virtual interactivo. Utiliza datos y simulación sintética; no procesa pagos reales ni invoca APIs con costo externo.",
    en: "Public demonstration environment for AI commerce and virtual try-on. Uses synthetic data and simulation; processes no real payments and invokes zero paid external APIs.",
  },
};

export const PRIVATE_CONNECTED_RELEASE_POLICY: DemoReleaseScope = {
  modeName: "PRIVATE_CONNECTED_DEMO",
  isPublicDemo: false,
  allowsSyntheticData: false,
  allowsDemoVTO: true,
  allowsRealVTO: true,
  requiresExternalApiKey: true,
  allowsSimulatedCheckout: false,
  requiresRealPaymentGateway: true,
  allowedImageProviders: ["local-assets", "cdn.fashn.ai", "media.fashn.ai"],
  allowedVTOProviders: ["demo-synthetic", "fashn-pilot"],
  publicDisclosureMessage: {
    es: "Entorno conectado privado con capacidades de inferencia externa activables bajo credencial segura.",
    en: "Private connected environment with external inference capabilities activated via secure credentials.",
  },
};

/**
 * Returns the release boundary policy for a given operational mode.
 */
export function getDemoReleasePolicy(mode: "PUBLIC_DEMO" | "PRIVATE_CONNECTED_DEMO" | "DEVELOPMENT"): DemoReleaseScope {
  if (mode === "PRIVATE_CONNECTED_DEMO") {
    return PRIVATE_CONNECTED_RELEASE_POLICY;
  }
  return PUBLIC_DEMO_RELEASE_POLICY;
}

/**
 * Asserts that a requested feature conforms to the active release boundary.
 */
export function assertFeatureReleaseEligibility(
  feature: "REAL_FASHN_INFERENCE" | "DEMO_VTO" | "WEBPAY_DEMO" | "REAL_PAYMENT",
  mode: "PUBLIC_DEMO" | "PRIVATE_CONNECTED_DEMO" | "DEVELOPMENT"
): boolean {
  const policy = getDemoReleasePolicy(mode);
  switch (feature) {
    case "REAL_FASHN_INFERENCE":
      return policy.allowsRealVTO;
    case "DEMO_VTO":
      return policy.allowsDemoVTO;
    case "WEBPAY_DEMO":
      return policy.allowsSimulatedCheckout;
    case "REAL_PAYMENT":
      return policy.requiresRealPaymentGateway;
    default:
      return false;
  }
}
