import crypto from "node:crypto";
import { TENTACIONES_DEMO_CATALOG } from "../domain/catalog-data.js";
import { resolveVirtualFitting } from "../domain/ar-fitting.js";
import type {
  AIProductDiscoveryResult,
  AIRecommendationResult,
  AIComparisonResult,
  AICartAssistanceResult,
  CartItem,
  CartState,
  CustomerOrder,
  FittingRoomResolution,
  Product,
  ProductCategory,
  ProductVariant,
  ARProfile,
} from "../domain/types.js";

export class TentacionesCommerceEngine {
  private readonly catalog: Map<string, Product> = new Map();
  private readonly carts: Map<string, CartState> = new Map();
  private readonly orders: Map<string, CustomerOrder> = new Map();
  private readonly freeShippingThresholdCLP = 30000;
  private readonly freeShippingThresholdEUR = 100;

  constructor(initialCatalog: readonly Product[] = TENTACIONES_DEMO_CATALOG) {
    for (const item of initialCatalog) {
      this.catalog.set(item.id, item);
    }
  }

  // --- Catalog Queries ---

  listProducts(filter?: { category?: ProductCategory; tag?: string; arOnly?: boolean }): readonly Product[] {
    let result = Array.from(this.catalog.values());
    if (filter?.category) {
      result = result.filter((p) => p.category === filter.category);
    }
    if (filter?.tag) {
      result = result.filter((p) => p.tags.includes(filter.tag!.toLowerCase()));
    }
    if (filter?.arOnly) {
      result = result.filter((p) => p.arAvailable);
    }
    return result;
  }

  getProductById(id: string): Product | undefined {
    return this.catalog.get(id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return Array.from(this.catalog.values()).find((p) => p.slug === slug);
  }

  findVariant(sku: string): { product: Product; variant: ProductVariant } | undefined {
    for (const p of this.catalog.values()) {
      const v = p.variants.find((variant) => variant.sku === sku);
      if (v) return { product: p, variant: v };
    }
    return undefined;
  }

  // --- Natural Language Search & Discovery ---

  searchProductsNaturalLanguage(query: string): AIProductDiscoveryResult {
    const normalized = query.toLowerCase().trim();
    const extractedTags: string[] = [];
    let detectedCategory: ProductCategory | undefined = undefined;

    if (normalized.includes("polera") || normalized.includes("remera") || normalized.includes("t-shirt") || normalized.includes("camiseta")) {
      detectedCategory = "poleras";
      extractedTags.push("polera");
    } else if (normalized.includes("camisa") || normalized.includes("lino") || normalized.includes("resort")) {
      detectedCategory = "camisas";
      extractedTags.push("camisa");
    } else if (normalized.includes("poleron") || normalized.includes("hoodie") || normalized.includes("sudadera")) {
      detectedCategory = "polerones";
      extractedTags.push("poleron", "hoodie");
    } else if (normalized.includes("chaqueta") || normalized.includes("impermeable") || normalized.includes("jacket") || normalized.includes("parka")) {
      detectedCategory = "chaquetas";
      extractedTags.push("chaqueta", "impermeable");
    } else if (normalized.includes("vestido") || normalized.includes("gala") || normalized.includes("cena") || normalized.includes("dress")) {
      detectedCategory = "vestidos";
      extractedTags.push("vestido", "elegante");
    } else if (normalized.includes("pantalon") || normalized.includes("cargo") || normalized.includes("techwear")) {
      detectedCategory = "pantalones";
      extractedTags.push("pantalon", "cargo");
    } else if (normalized.includes("falda") || normalized.includes("skirt")) {
      detectedCategory = "faldas";
      extractedTags.push("falda");
    } else if (normalized.includes("zapatilla") || normalized.includes("correr") || normalized.includes("running") || normalized.includes("calzado") || normalized.includes("shoes")) {
      detectedCategory = "calzado";
      extractedTags.push("calzado", "zapatillas", "running");
    } else if (normalized.includes("calcetines") || normalized.includes("socks") || normalized.includes("accesorio")) {
      detectedCategory = "accesorios";
      extractedTags.push("calcetines", "accesorios");
    }

    if (normalized.includes("negro") || normalized.includes("negra") || normalized.includes("black")) {
      extractedTags.push("negro", "black");
    }
    if (normalized.includes("blanco") || normalized.includes("blanca") || normalized.includes("white")) {
      extractedTags.push("blanca", "blanco");
    }
    if (normalized.includes("running") || normalized.includes("marathon") || normalized.includes("deporte")) {
      extractedTags.push("running", "deporte");
    }

    let matches = this.listProducts();
    if (detectedCategory) {
      matches = matches.filter((p) => p.category === detectedCategory);
    }
    if (extractedTags.length > 0) {
      const filtered = matches.filter((p) => extractedTags.some((t) => p.tags.includes(t)));
      if (filtered.length > 0) matches = filtered;
    }

    return {
      status: "COMPLETED",
      source: "Local AI Engine",
      query,
      intent: { category: detectedCategory, tags: extractedTags },
      matches,
      fallback: "NONE",
    };
  }

  // --- Recommendations & Product Comparison ---

  getRecommendations(productId: string): AIRecommendationResult {
    const target = this.getProductById(productId);
    if (!target) {
      return { status: "COMPLETED", source: "Local AI Engine", recommendations: [], fallback: "NONE" };
    }

    const related = Array.from(this.catalog.values()).filter((p) => {
      if (p.id === target.id) return false;
      return (
        p.category === target.category ||
        p.tags.some((t) => target.tags.includes(t)) ||
        (target.category === "calzado" && p.category === "accesorios") ||
        (target.category === "poleras" && p.category === "pantalones")
      );
    });

    return {
      status: "COMPLETED",
      source: "Local AI Engine",
      recommendations: related.slice(0, 3),
      fallback: "NONE",
    };
  }

  compareProducts(productIds: readonly string[]): AIComparisonResult {
    const prods = productIds
      .map((id) => this.getProductById(id))
      .filter((p): p is Product => p !== undefined);

    const matrix = prods.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      basePriceCLP: p.basePriceCLP,
      basePriceEUR: p.basePriceEUR,
      arAvailable: p.arAvailable,
      ...p.specifications,
    }));

    const differentiators = ["basePriceCLP", "category", "arAvailable", "material"];

    return {
      status: "COMPLETED",
      source: "Local AI Engine",
      products: prods,
      matrix,
      differentiators,
      fallback: "NONE",
    };
  }

  // --- Shopping Cart & Pre-Mutation Integrity ---

  getOrCreateCart(cartId: string = crypto.randomUUID()): CartState {
    const existing = this.carts.get(cartId);
    if (existing) return existing;

    const initial: CartState = {
      id: cartId,
      items: [],
      subtotal: 0,
      currency: "CLP",
      freeShippingThreshold: this.freeShippingThresholdCLP,
      qualifiesForFreeShipping: false,
      missingForFreeShipping: this.freeShippingThresholdCLP,
      updatedAt: new Date().toISOString(),
    };
    this.carts.set(cartId, initial);
    return initial;
  }

  addToCart(cartId: string, sku: string, quantity = 1): { readonly success: boolean; readonly cart: CartState; readonly error?: string } {
    const cart = this.getOrCreateCart(cartId);
    const lookup = this.findVariant(sku);

    if (!lookup) {
      return { success: false, cart, error: `SKU '${sku}' no encontrado en el catálogo.` };
    }

    const { product, variant } = lookup;
    if (variant.stock < quantity) {
      return {
        success: false,
        cart,
        error: `Stock insuficiente para SKU '${sku}'. Solicitado: ${quantity}, Disponible: ${variant.stock}.`,
      };
    }

    const existingIndex = cart.items.findIndex((item) => item.sku === sku);
    const updatedItems = [...cart.items];

    if (existingIndex >= 0) {
      const existing = updatedItems[existingIndex]!;
      const newQty = existing.quantity + quantity;
      if (variant.stock < newQty) {
        return {
          success: false,
          cart,
          error: `No es posible agregar ${quantity} unidades más. Excedería el stock disponible (${variant.stock}).`,
        };
      }
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        lineTotal: Math.round(newQty * existing.unitPrice),
      };
    } else {
      updatedItems.push({
        productId: product.id,
        sku: variant.sku,
        name: product.name,
        color: variant.color,
        size: variant.size,
        unitPrice: variant.priceCLP,
        currency: "CLP",
        quantity,
        lineTotal: Math.round(quantity * variant.priceCLP),
      });
    }

    const subtotal = Math.round(updatedItems.reduce((acc, item) => acc + item.lineTotal, 0));
    const missing = Math.max(0, this.freeShippingThresholdCLP - subtotal);
    const updatedCart: CartState = {
      id: cart.id,
      items: updatedItems,
      subtotal,
      currency: "CLP",
      freeShippingThreshold: this.freeShippingThresholdCLP,
      qualifiesForFreeShipping: missing === 0,
      missingForFreeShipping: missing,
      updatedAt: new Date().toISOString(),
    };

    this.carts.set(cart.id, updatedCart);
    return { success: true, cart: updatedCart };
  }

  removeFromCart(cartId: string, sku: string): CartState {
    const cart = this.getOrCreateCart(cartId);
    const updatedItems = cart.items.filter((item) => item.sku !== sku);
    const subtotal = Math.round(updatedItems.reduce((acc, item) => acc + item.lineTotal, 0));
    const missing = Math.max(0, this.freeShippingThresholdCLP - subtotal);

    const updatedCart: CartState = {
      id: cart.id,
      items: updatedItems,
      subtotal,
      currency: "CLP",
      freeShippingThreshold: this.freeShippingThresholdCLP,
      qualifiesForFreeShipping: missing === 0,
      missingForFreeShipping: missing,
      updatedAt: new Date().toISOString(),
    };

    this.carts.set(cart.id, updatedCart);
    return updatedCart;
  }

  // --- AI Cart Assistant ---

  assistCartQuery(cartId: string, question: string): AICartAssistanceResult {
    const cart = this.getOrCreateCart(cartId);
    const normalized = question.toLowerCase();

    if (normalized.includes("contenido") || normalized.includes("qué tengo") || normalized.includes("productos")) {
      if (cart.items.length === 0) {
        return {
          status: "COMPLETED",
          source: "Local AI Engine",
          query: question,
          answer: "Tu carrito de compras está vacío. Te sugiero explorar nuestras poleras de algodón orgánico o zapatillas de running.",
          cart,
          fallback: "NONE",
        };
      }
      const summary = cart.items.map((i) => `${i.quantity}x ${i.name} (Talla: ${i.size}, $${i.lineTotal.toLocaleString("es-CL")} CLP)`).join(", ");
      return {
        status: "COMPLETED",
        source: "Local AI Engine",
        query: question,
        answer: `Tienes ${cart.items.length} ítem(s) en tu carrito: ${summary}. Subtotal: $${cart.subtotal.toLocaleString("es-CL")} CLP.`,
        cart,
        fallback: "NONE",
      };
    }

    if (normalized.includes("despacho") || normalized.includes("envío gratis") || normalized.includes("cuánto me falta")) {
      if (cart.qualifiesForFreeShipping) {
        return {
          status: "COMPLETED",
          source: "Local AI Engine",
          query: question,
          answer: `¡Excelente! Tu carrito suma $${cart.subtotal.toLocaleString("es-CL")} CLP y califica para Despacho Gratis (umbral: $${cart.freeShippingThreshold.toLocaleString("es-CL")} CLP).`,
          cart,
          fallback: "NONE",
        };
      }
      return {
        status: "COMPLETED",
        source: "Local AI Engine",
        query: question,
        answer: `Tu subtotal actual es de $${cart.subtotal.toLocaleString("es-CL")} CLP. Te faltan $${cart.missingForFreeShipping.toLocaleString("es-CL")} CLP para obtener Despacho Gratis. ¿Deseas agregar calcetines técnicos por $19.990 CLP?`,
        cart,
        suggestedAction: "ADD_ADDON_SOCKS",
        fallback: "NONE",
      };
    }

    return {
      status: "COMPLETED",
      source: "Local AI Engine",
      query: question,
      answer: `Tu carrito acumula un subtotal de $${cart.subtotal.toLocaleString("es-CL")} CLP. ¿Deseas proceder al checkout simulado Webpay Demo?`,
      cart,
      fallback: "NONE",
    };
  }

  // --- Checkout Simulation (WEBPAY_DEMO) ---

  processCheckout(
    cartId: string,
    customer: CustomerOrder["customer"],
    shippingAddress: CustomerOrder["shippingAddress"]
  ): { readonly success: boolean; readonly order?: CustomerOrder; readonly error?: string } {
    const cart = this.getOrCreateCart(cartId);
    if (cart.items.length === 0) {
      return { success: false, error: "No es posible procesar el pago con un carrito vacío." };
    }

    for (const item of cart.items) {
      const lookup = this.findVariant(item.sku);
      if (!lookup || lookup.variant.stock < item.quantity) {
        return {
          success: false,
          error: `Error de checkout: El producto '${item.name}' (SKU: ${item.sku}) no cuenta con stock suficiente.`,
        };
      }
    }

    const shippingFee = cart.qualifiesForFreeShipping ? 0 : 3990;
    const total = cart.subtotal + shippingFee;
    const orderId = `tentaciones-${crypto.randomUUID().slice(0, 8)}`;

    const order: CustomerOrder = {
      orderId,
      customer,
      shippingAddress,
      items: [...cart.items],
      subtotal: cart.subtotal,
      shippingFee,
      total,
      currency: "CLP",
      paymentMethod: "WEBPAY_DEMO",
      paymentStatus: "PAID_DEMO",
      orderStatus: "CONFIRMED",
      createdAt: new Date().toISOString(),
    };

    this.orders.set(orderId, order);

    // Clear cart after checkout
    this.carts.set(cartId, {
      id: cartId,
      items: [],
      subtotal: 0,
      currency: "CLP",
      freeShippingThreshold: this.freeShippingThresholdCLP,
      qualifiesForFreeShipping: false,
      missingForFreeShipping: this.freeShippingThresholdCLP,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, order };
  }

  getOrder(orderId: string): CustomerOrder | undefined {
    return this.orders.get(orderId);
  }

  // --- AR Virtual Try-On Resolution ---

  resolveFitting(assetUrn: string, profile: ARProfile = "Nova", measurements?: { footLengthCm?: number; chestCm?: number; waistCm?: number }): FittingRoomResolution {
    return resolveVirtualFitting(assetUrn, profile, measurements);
  }
}
