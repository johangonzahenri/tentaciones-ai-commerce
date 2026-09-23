# TENTACIONES AI COMMERCE â€” MULTICLIENT ARCHITECTURE & EXPERIENCE CONTRACT

============================================================
CANONICAL DOCUMENT: docs/MULTICLIENT_ARCHITECTURE.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: ARCHITECTURAL DESIGN
CORRESPONDING CODE CONTRACT: src/contracts/experience-contract.ts
============================================================

## 1. Vision & Architectural Principle

Tentaciones AI Commerce is engineered from the ground up as a **headless, multi-surface commerce platform**. The application core must serve diverse frontend clients without duplicating domain logic, recalculating shopping cart totals differently across channels, or fragmenting AI recommendations.

The single source of truth for all client surfaces is the **Multiclient Experience Contract** (`ITentacionesExperienceService`).

```
                              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                              â”‚ ITentacionesExperienceService     â”‚
                              â”‚ (src/contracts/experience-        â”‚
                              â”‚  contract.ts)                     â”‚
                              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                â”‚
                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                 â”‚                              â”‚                              â”‚
                 â–¼                              â–¼                              â–¼
      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
      â”‚ Storefront Web App â”‚         â”‚ Mobile App (iOS /  â”‚         â”‚ In-Store AR Kiosk  â”‚
      â”‚ (HTML5 / Vanilla)  â”‚         â”‚ Android / Flutter) â”‚         â”‚ (Point of Sale)    â”‚
      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 2. Core Experience Contract API

Located at `src/contracts/experience-contract.ts`, the interface defines 10 core capabilities:

```typescript
export interface ITentacionesExperienceService {
  /** Retrieves full product catalog or filtered by category/query */
  getCatalog(category?: string, query?: string): Promise<Product[]>;

  /** Retrieves single product detail by ID or Slug */
  getProduct(id: string): Promise<Product | null>;

  /** Natural language product search with intent recognition */
  searchProducts(query: string): Promise<Product[]>;

  /** Retrieves active shopping cart state */
  getCart(cartId: string): Promise<Cart>;

  /** Adds SKU to cart and recalculates shipping rules */
  addToCart(cartId: string, item: CartItemInput): Promise<Cart>;

  /** Removes item from cart */
  removeFromCart(cartId: string, sku: string): Promise<Cart>;

  /** Executes simulated or live checkout workflow */
  simulateCheckout(payload: CheckoutPayload): Promise<CheckoutResult>;

  /** Calculates recommended size and fit confidence based on biometric avatar */
  getARRecommendation(profile: ARProfile, category: string): Promise<ARRecommendation>;

  /** Context-aware conversational assistant queries */
  queryAIAssistant(prompt: string, context?: AIQueryContext): Promise<AIResponse>;

  /** Real-time commercial and operational performance metrics */
  getCommercialMetrics(): Promise<CommercialDemoMetrics>;
}
```

---

## 3. Multiclient Surface Implementations

### 3.1 Web Storefront (Active Reference Implementation)
- **Technology:** Native HTML5, modern CSS3 variables, ES2022 Vanilla JavaScript.
- **Characteristics:** Zero bundle compile step required for browser; loads instantly; 100% accessible; responsive from 320px mobile to 4K desktop.
- **DOM Safety:** Strict direct node creation (`document.createElement`), zero `innerHTML`.

### 3.2 Mobile App (Roadmap v1.5 / Flutter & React Native)
- **Bridge:** Will consume the exact same JSON REST API `/api/*` exposed by the Tentaciones Node server.
- **Native AR Support:** Uses ARKit (iOS) and ARCore (Android) with GLTF/USDZ 3D models mapped to product URNs (`urn:tentaciones:ar:apparel:*`).

### 3.3 Physical Store Fitting Kiosks (Roadmap v2.0)
- **Deployment:** Touchscreen displays in retail fitting rooms with integrated camera depth sensors.
- **Interface:** Consumes `getARRecommendation(profile, category)` via local high-speed edge service.

---

## 4. Separation of Concerns & Reusability

By enforcing `ITentacionesExperienceService`:
1. **Zero Logic Duplication:** Shipping thresholds, tax calculations, biometric sizing heuristics, and promotional rules live exclusively behind the contract.
2. **Pluggable Backends:** Switching from `DemoAdapter` (synthetic showcase) to `ConnectedServiceWrapper` (live AI Operating Platform backend) requires zero changes to any client UI.
3. **Deterministic Testing:** Automated tests mock the single interface, validating complete storefront behavior with 100% reliability.
