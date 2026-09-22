import type { OperationalModeConfig } from "../../contracts/operational-mode.js";
import type { IVirtualTryOnProvider } from "../../contracts/vto-contract.js";
import { DemoVirtualTryOnProvider } from "./demo-vto-provider.js";
import { FashnVirtualTryOnProvider } from "./fashn-vto-provider.js";
import { VirtualTryOnService } from "../../domain/vto/vto-service.js";
import { assertSafeVTOMode } from "../../security/vto-guardrails.js";

export function createVTOProvider(
  config: OperationalModeConfig,
  forcedProviderId?: string
): IVirtualTryOnProvider {
  assertSafeVTOMode(config, forcedProviderId);

  if (config.mode === "PUBLIC_DEMO") {
    return new DemoVirtualTryOnProvider();
  }

  // Check if real FASHN provider is requested and configured
  const providerType = (forcedProviderId || process.env.VTO_PROVIDER || "").toLowerCase();
  const fashnApiKey = process.env.VTO_API_KEY || process.env.FASHN_API_KEY;

  if (providerType === "fashn" || providerType === "fashn-pilot") {
    if (fashnApiKey) {
      return new FashnVirtualTryOnProvider({
        apiKey: fashnApiKey,
        apiBaseUrl: process.env.VTO_API_BASE_URL || process.env.FASHN_API_BASE_URL,
        modelName: (process.env.VTO_MODEL_NAME as "tryon-v1.6" | "tryon-max") || "tryon-v1.6",
      });
    }
  }

  // Default safe fallback for development and test suites
  return new DemoVirtualTryOnProvider();
}

export function createVTOService(
  config: OperationalModeConfig,
  forcedProviderId?: string
): VirtualTryOnService {
  const provider = createVTOProvider(config, forcedProviderId);
  return new VirtualTryOnService(provider, config);
}
