export type ProductCategory =
  | "poleras"
  | "camisas"
  | "polerones"
  | "chaquetas"
  | "vestidos"
  | "pantalones"
  | "faldas"
  | "accesorios"
  | "calzado";

export interface ProductVariant {
  readonly sku: string;
  readonly color: string;
  readonly size: string | number;
  readonly priceCLP: number;
  readonly priceEUR: number;
  readonly stock: number;
  readonly arAssetUrn?: string | undefined;
}

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly brand: string;
  readonly category: ProductCategory;
  readonly subcategory: string;
  readonly description: string;
  readonly basePriceCLP: number;
  readonly basePriceEUR: number;
  readonly currency: "CLP" | "EUR";
  readonly tags: readonly string[];
  readonly variants: readonly ProductVariant[];
  readonly arAvailable: boolean;
  readonly defaultArUrn?: string | undefined;
  readonly has3D?: boolean | undefined;
  readonly model3DUrl?: string | undefined;
  readonly model3DFormat?: "glb" | "gltf" | "canvas3d" | undefined;
  readonly image: string;
  readonly specifications: Readonly<Record<string, string | number | boolean>>;
}

export interface CartItem {
  readonly productId: string;
  readonly sku: string;
  readonly name: string;
  readonly color: string;
  readonly size: string | number;
  readonly unitPrice: number;
  readonly currency: string;
  readonly quantity: number;
  readonly lineTotal: number;
}

export interface CartState {
  readonly id: string;
  readonly items: readonly CartItem[];
  readonly subtotal: number;
  readonly currency: string;
  readonly freeShippingThreshold: number;
  readonly qualifiesForFreeShipping: boolean;
  readonly missingForFreeShipping: number;
  readonly updatedAt: string;
}

export type PaymentMethod = "WEBPAY_DEMO" | "PRODUCTION_GATEWAY";
export type PaymentStatus = "PAID_DEMO" | "PENDING" | "REJECTED";
export type OrderStatus = "CONFIRMED" | "PROCESSING" | "SHIPPED";

export interface CustomerOrder {
  readonly orderId: string;
  readonly customer: {
    readonly name: string;
    readonly email: string;
    readonly phone?: string | undefined;
  };
  readonly shippingAddress: {
    readonly street: string;
    readonly city: string;
    readonly region: string;
    readonly country: string;
  };
  readonly items: readonly CartItem[];
  readonly subtotal: number;
  readonly shippingFee: number;
  readonly total: number;
  readonly currency: string;
  readonly paymentMethod: PaymentMethod;
  readonly paymentStatus: PaymentStatus;
  readonly orderStatus: OrderStatus;
  readonly createdAt: string;
}

export type ARProfile = "Nova" | "Sora" | "Mateo";
export type ARStatus = "AR_AVAILABLE" | "AR_NOT_AVAILABLE" | "AR_ASSET_INVALID" | "AR_ASSET_OUTDATED" | "AR_PREVIEW_FAILED";

export interface SizeRecommendationInput {
  readonly category: ProductCategory;
  readonly footLengthCm?: number | undefined;
  readonly chestCm?: number | undefined;
  readonly waistCm?: number | undefined;
  readonly hipsCm?: number | undefined;
  readonly profile?: ARProfile | undefined;
}

export interface SizeRecommendationResult {
  readonly recommendedSize: string | number;
  readonly confidence: number;
  readonly rationale: string;
  readonly alternativeSize?: string | number | undefined;
}

export interface FittingRoomResolution {
  readonly assetUrn: string;
  readonly profile: ARProfile;
  readonly arStatus: ARStatus;
  readonly previewUrl: string;
  readonly recommendedSize?: SizeRecommendationResult | undefined;
  readonly fallbackMode: "NONE" | "STANDARD_2D_VIEW";
}

export type FallbackMode = "NONE" | "LOCAL_FALLBACK" | "TRADITIONAL_COMMERCE";

export interface AIProductDiscoveryResult {
  readonly status: "COMPLETED" | "FAILED" | "PLATFORM_UNAVAILABLE";
  readonly source: "AI Operating Platform" | "Local AI Engine" | "Traditional Commerce";
  readonly query: string;
  readonly intent: { readonly category?: string; readonly tags: readonly string[]; readonly maxPrice?: number };
  readonly matches: readonly Product[];
  readonly fallback: FallbackMode;
  readonly traceId?: string;
}

export interface AIRecommendationResult {
  readonly status: "COMPLETED" | "FAILED" | "PLATFORM_UNAVAILABLE";
  readonly source: "AI Operating Platform" | "Local AI Engine" | "Traditional Commerce";
  readonly recommendations: readonly Product[];
  readonly fallback: FallbackMode;
  readonly traceId?: string;
}

export interface AIComparisonResult {
  readonly status: "COMPLETED" | "FAILED" | "PLATFORM_UNAVAILABLE";
  readonly source: "AI Operating Platform" | "Local AI Engine" | "Traditional Commerce";
  readonly products: readonly Product[];
  readonly matrix: readonly Readonly<Record<string, unknown>>[];
  readonly differentiators: readonly string[];
  readonly fallback: FallbackMode;
  readonly traceId?: string;
}

export interface AICartAssistanceResult {
  readonly status: "COMPLETED" | "FAILED" | "PLATFORM_UNAVAILABLE";
  readonly source: "AI Operating Platform" | "Local AI Engine" | "Traditional Commerce";
  readonly query: string;
  readonly answer: string;
  readonly cart: CartState;
  readonly suggestedAction?: string;
  readonly fallback: FallbackMode;
  readonly traceId?: string;
}
