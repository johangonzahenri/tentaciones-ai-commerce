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
import type { OperationalMode } from "./operational-mode.js";

export interface HealthStatus {
  readonly status: "HEALTHY" | "DEGRADED" | "OFFLINE";
  readonly operationalMode: OperationalMode;
  readonly version: string;
  readonly isDemo: boolean;
  readonly notice: string;
}

export interface DemoCommercialMetrics {
  readonly totalProductsIndexed: number;
  readonly virtualFittingSessions: number;
  readonly recommendationsServed: number;
  readonly demoOrdersConfirmed: number;
  readonly averageFittingConfidence: number;
  readonly freeShippingThreshold: number;
}

export interface ITentacionesExperienceService {
  readonly operationalMode: OperationalMode;

  checkHealth(): Promise<HealthStatus>;

  listCatalog(filter?: { category?: ProductCategory; tag?: string; arOnly?: boolean }): Promise<readonly Product[]>;

  getProduct(idOrSlug: string): Promise<Product | null>;

  searchNaturalLanguage(query: string, traceId?: string): Promise<AIProductDiscoveryResult>;

  getRecommendations(productId: string, traceId?: string): Promise<AIRecommendationResult>;

  compareProducts(productIds: readonly string[], traceId?: string): Promise<AIComparisonResult>;

  getCart(cartId: string): Promise<CartState>;

  addToCart(cartId: string, sku: string, quantity?: number): Promise<{ success: boolean; cart: CartState; error?: string }>;

  removeFromCart(cartId: string, sku: string): Promise<CartState>;

  assistCart(cartId: string, query: string, traceId?: string): Promise<AICartAssistanceResult>;

  resolveFitting(assetUrn: string, profile?: ARProfile, measurements?: { footLengthCm?: number; chestCm?: number; waistCm?: number }): Promise<FittingRoomResolution>;

  processCheckout(cartId: string, customer: CustomerOrder["customer"], shippingAddress: CustomerOrder["shippingAddress"]): Promise<{ success: boolean; order?: CustomerOrder; error?: string }>;

  getCommercialMetrics(): Promise<DemoCommercialMetrics>;
}
