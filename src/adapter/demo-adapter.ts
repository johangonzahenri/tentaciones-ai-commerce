import crypto from "node:crypto";
import { TentacionesCommerceEngine } from "../engine/commerce-engine.js";
import { resolveVirtualFitting } from "../domain/ar-fitting.js";
import type {
  ITentacionesExperienceService,
  HealthStatus,
  DemoCommercialMetrics,
} from "../contracts/experience-contract.js";
import type { OperationalMode } from "../contracts/operational-mode.js";
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
import { assertNoProductionPayments } from "../security/demo-guardrails.js";

export class DemoAdapter implements ITentacionesExperienceService {
  readonly operationalMode: OperationalMode = "PUBLIC_DEMO";
  private readonly engine: TentacionesCommerceEngine;
  private fittingSessionCount = 42;
  private demoOrderCount = 18;
  private recommendationsCount = 156;

  constructor(engine?: TentacionesCommerceEngine) {
    this.engine = engine ?? new TentacionesCommerceEngine();
  }

  async checkHealth(): Promise<HealthStatus> {
    return {
      status: "HEALTHY",
      operationalMode: "PUBLIC_DEMO",
      version: "1.0.0-demo",
      isDemo: true,
      notice: "Tentaciones AI Commerce Public Showcase — Operating with Synthetic Demo Data.",
    };
  }

  async listCatalog(filter?: { category?: ProductCategory; tag?: string; arOnly?: boolean }): Promise<readonly Product[]> {
    return this.engine.listProducts(filter);
  }

  async getProduct(idOrSlug: string): Promise<Product | null> {
    const p = this.engine.getProductById(idOrSlug) ?? this.engine.getProductBySlug(idOrSlug);
    return p ?? null;
  }

  async searchNaturalLanguage(query: string, traceId = crypto.randomUUID()): Promise<AIProductDiscoveryResult> {
    const local = this.engine.searchProductsNaturalLanguage(query);
    return {
      ...local,
      source: "Local AI Engine",
      fallback: "LOCAL_FALLBACK",
      traceId,
    };
  }

  async getRecommendations(productId: string, traceId = crypto.randomUUID()): Promise<AIRecommendationResult> {
    this.recommendationsCount++;
    const local = this.engine.getRecommendations(productId);
    return {
      ...local,
      source: "Local AI Engine",
      fallback: "LOCAL_FALLBACK",
      traceId,
    };
  }

  async compareProducts(productIds: readonly string[], traceId = crypto.randomUUID()): Promise<AIComparisonResult> {
    const local = this.engine.compareProducts(productIds);
    return {
      ...local,
      source: "Local AI Engine",
      fallback: "LOCAL_FALLBACK",
      traceId,
    };
  }

  async getCart(cartId: string): Promise<CartState> {
    return this.engine.getOrCreateCart(cartId);
  }

  async addToCart(cartId: string, sku: string, quantity = 1): Promise<{ success: boolean; cart: CartState; error?: string }> {
    return this.engine.addToCart(cartId, sku, quantity);
  }

  async removeFromCart(cartId: string, sku: string): Promise<CartState> {
    return this.engine.removeFromCart(cartId, sku);
  }

  async assistCart(cartId: string, query: string, traceId = crypto.randomUUID()): Promise<AICartAssistanceResult> {
    const local = this.engine.assistCartQuery(cartId, query);
    return {
      ...local,
      source: "Local AI Engine",
      fallback: "LOCAL_FALLBACK",
      traceId,
    };
  }

  async resolveFitting(assetUrn: string, profile: ARProfile = "Nova", measurements?: { footLengthCm?: number; chestCm?: number; waistCm?: number }): Promise<FittingRoomResolution> {
    this.fittingSessionCount++;
    return resolveVirtualFitting(assetUrn, profile, measurements);
  }

  async processCheckout(
    cartId: string,
    customer: CustomerOrder["customer"],
    shippingAddress: CustomerOrder["shippingAddress"]
  ): Promise<{ success: boolean; order?: CustomerOrder; error?: string }> {
    assertNoProductionPayments("WEBPAY_DEMO", { mode: "PUBLIC_DEMO", defaultCurrency: "CLP", freeShippingThresholdCLP: 30000 });
    const result = this.engine.processCheckout(cartId, customer, shippingAddress);
    if (result.success) {
      this.demoOrderCount++;
    }
    return result;
  }

  async getCommercialMetrics(): Promise<DemoCommercialMetrics> {
    const catalog = this.engine.listProducts();
    return {
      totalProductsIndexed: catalog.length,
      virtualFittingSessions: this.fittingSessionCount,
      recommendationsServed: this.recommendationsCount,
      demoOrdersConfirmed: this.demoOrderCount,
      averageFittingConfidence: 0.96,
      freeShippingThreshold: 30000,
    };
  }
}
