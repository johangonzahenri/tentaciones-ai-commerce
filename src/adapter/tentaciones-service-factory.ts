import { DemoAdapter } from "./demo-adapter.js";
import { TentacionesPlatformAdapter } from "./tentaciones-platform-adapter.js";
import { PlatformClient } from "./platform-client.js";
import { TentacionesCommerceEngine } from "../engine/commerce-engine.js";
import type { ITentacionesExperienceService } from "../contracts/experience-contract.js";
import type { OperationalModeConfig } from "../contracts/operational-mode.js";
import { assertSafeDemoMode } from "../security/demo-guardrails.js";
import type {
  AIProductDiscoveryResult,
  AIRecommendationResult,
  AIComparisonResult,
  AICartAssistanceResult,
  CartState,
  CustomerOrder,
  FittingRoomResolution,
  Product,
  ProductCategory,
  ARProfile,
} from "../domain/types.js";

/**
 * Adapter wrapper to expose TentacionesPlatformAdapter as ITentacionesExperienceService
 */
class ConnectedServiceWrapper implements ITentacionesExperienceService {
  readonly operationalMode: "PRIVATE_CONNECTED_DEMO" | "DEVELOPMENT";
  private readonly adapter: TentacionesPlatformAdapter;

  constructor(adapter: TentacionesPlatformAdapter, mode: "PRIVATE_CONNECTED_DEMO" | "DEVELOPMENT") {
    this.adapter = adapter;
    this.operationalMode = mode;
  }

  async checkHealth() {
    const health = await this.adapter.checkPlatformHealth();
    return {
      status: health.online ? "HEALTHY" as const : "DEGRADED" as const,
      operationalMode: this.operationalMode,
      version: health.version ?? "1.0.0-connected",
      isDemo: false,
      notice: health.online
        ? "Connected to AI Operating Platform Core"
        : "Platform connection degraded, local engine fallback active.",
    };
  }

  async listCatalog(filter?: { category?: ProductCategory; tag?: string; arOnly?: boolean }) {
    return this.adapter.engine.listProducts(filter);
  }

  async getProduct(idOrSlug: string) {
    return this.adapter.engine.getProductById(idOrSlug) ?? this.adapter.engine.getProductBySlug(idOrSlug) ?? null;
  }

  async searchNaturalLanguage(query: string, traceId?: string) {
    return this.adapter.discoverProducts(query, traceId);
  }

  async getRecommendations(productId: string, traceId?: string) {
    return this.adapter.recommendProducts(productId, traceId);
  }

  async compareProducts(productIds: readonly string[], traceId?: string) {
    return this.adapter.compareProducts(productIds, traceId);
  }

  async getCart(cartId: string) {
    return this.adapter.engine.getOrCreateCart(cartId);
  }

  async addToCart(cartId: string, sku: string, quantity = 1) {
    return this.adapter.engine.addToCart(cartId, sku, quantity);
  }

  async removeFromCart(cartId: string, sku: string) {
    return this.adapter.engine.removeFromCart(cartId, sku);
  }

  async assistCart(cartId: string, query: string, traceId?: string) {
    return this.adapter.assistCart(cartId, query, traceId);
  }

  async resolveFitting(assetUrn: string, profile: ARProfile = "Nova", measurements?: { footLengthCm?: number; chestCm?: number; waistCm?: number }) {
    return this.adapter.resolveFittingRoom(assetUrn, profile, measurements);
  }

  async processCheckout(cartId: string, customer: CustomerOrder["customer"], shippingAddress: CustomerOrder["shippingAddress"]) {
    return this.adapter.engine.processCheckout(cartId, customer, shippingAddress);
  }

  async getCommercialMetrics() {
    const catalog = this.adapter.engine.listProducts();
    return {
      totalProductsIndexed: catalog.length,
      virtualFittingSessions: 42,
      recommendationsServed: 120,
      demoOrdersConfirmed: 15,
      averageFittingConfidence: 0.95,
      freeShippingThreshold: 30000,
    };
  }
}

export function createExperienceService(config: OperationalModeConfig): ITentacionesExperienceService {
  // Enforce fail-closed guardrails
  assertSafeDemoMode(config);

  if (config.mode === "PUBLIC_DEMO") {
    return new DemoAdapter(new TentacionesCommerceEngine());
  }

  const engine = new TentacionesCommerceEngine();
  let client: PlatformClient | undefined = undefined;

  if (config.platformApiBaseUrl) {
    client = new PlatformClient({
      baseUrl: config.platformApiBaseUrl,
      applicationId: config.platformApplicationId || "tentaciones-commerce",
      tenantId: config.platformTenantId || "tenant-tentaciones",
      apiKey: config.platformApiKey,
    });
  }

  const adapter = new TentacionesPlatformAdapter({
    client,
    localEngine: engine,
  });

  return new ConnectedServiceWrapper(adapter, config.mode);
}
