/**
 * FASHN Real Pilot Activation Gate
 * Formal governance gate for evaluating and permitting live VTO inference.
 * Enforces strict fail-closed criteria before opening external network connections.
 */

import { FASHN_MODEL_CONFIGS, FASHN_API_CANONICAL_BASE_URL } from "../../adapter/vto/fashn-vto-provider.js";
import type { PreparedUserImage, PreparedProductImage } from "../../contracts/vto-image-pipeline-contract.js";

export type PilotActivationGateStatus = "BLOCKED" | "READY" | "EXECUTED" | "FAILED";

export interface PilotActivationEvaluation {
  status: PilotActivationGateStatus;
  ready: boolean;
  timestamp: string;
  checklist: {
    credentialConfigured: boolean;
    baseUrlValid: boolean;
    modelValid: boolean;
    userImageValid: boolean;
    productImageValid: boolean;
    userConsentGranted: boolean;
    budgetEnforced: boolean;
  };
  reasons: string[];
  recommendation: string;
}

export class FashnRealPilotActivationGate {
  /**
   * Evaluates the activation readiness of the FASHN Real Pilot.
   */
  public static evaluate(params: {
    apiKey?: string;
    apiBaseUrl?: string;
    modelName?: "tryon-max" | "tryon-v1.6";
    preparedUserImage?: PreparedUserImage;
    preparedProductImage?: PreparedProductImage;
    userConsentGranted?: boolean;
    numImages?: number;
  }): PilotActivationEvaluation {
    const reasons: string[] = [];
    const hasKey = Boolean(params.apiKey && params.apiKey.trim().length > 0);
    const baseUrl = params.apiBaseUrl || FASHN_API_CANONICAL_BASE_URL;
    const isBaseUrlValid = baseUrl.startsWith("https://api.fashn.ai");
    const model = params.modelName || "tryon-max";
    const isModelValid = Boolean(FASHN_MODEL_CONFIGS[model]);
    const isUserValid = Boolean(params.preparedUserImage && params.preparedUserImage.validated && params.preparedUserImage.quality !== "REJECT");
    const isProductValid = Boolean(params.preparedProductImage && params.preparedProductImage.validated && params.preparedProductImage.quality !== "REJECT");
    const isConsent = Boolean(params.userConsentGranted);
    const isBudgetValid = params.numImages === undefined || params.numImages === 1;

    if (!hasKey) {
      reasons.push("FASHN API credentials are not configured on the secure server runtime.");
    }
    if (!isBaseUrlValid) {
      reasons.push(`Base URL '${baseUrl}' is not a valid secure FASHN API endpoint.`);
    }
    if (!isModelValid) {
      reasons.push(`Model '${model}' is not a certified FASHN model definition.`);
    }
    if (!isUserValid) {
      reasons.push("User image has not passed technical quality and resolution validation.");
    }
    if (!isProductValid) {
      reasons.push("Product image has not passed garment categorization and dimension validation.");
    }
    if (!isConsent) {
      reasons.push("Explicit user privacy consent must be granted before live inference.");
    }
    if (!isBudgetValid) {
      reasons.push("Execution budget violation: numImages must be exactly 1.");
    }

    const ready = hasKey && isBaseUrlValid && isModelValid && isUserValid && isProductValid && isConsent && isBudgetValid;
    const status: PilotActivationGateStatus = ready ? "READY" : "BLOCKED";

    return {
      status,
      ready,
      timestamp: new Date().toISOString(),
      checklist: {
        credentialConfigured: hasKey,
        baseUrlValid: isBaseUrlValid,
        modelValid: isModelValid,
        userImageValid: isUserValid,
        productImageValid: isProductValid,
        userConsentGranted: isConsent,
        budgetEnforced: isBudgetValid,
      },
      reasons,
      recommendation: ready
        ? "All gate criteria satisfied. Single-inference controlled pilot execution authorized."
        : "Execution blocked (Fail-Closed). Resolve checklist blockers before attempting live run.",
    };
  }
}
