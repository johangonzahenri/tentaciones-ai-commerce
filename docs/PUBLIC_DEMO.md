# TENTACIONES AI COMMERCE â€” PUBLIC DEMO SPECIFICATION & ARCHITECTURE

============================================================
CANONICAL DOCUMENT: docs/PUBLIC_DEMO.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: PUBLIC SAFE
CORRESPONDING CODE CONTRACT: ITentacionesExperienceService / DemoAdapter
============================================================

## 1. Executive Summary & Purpose

The **PUBLIC DEMO** of *Tentaciones AI Commerce* (`PROJ-01-TENTACIONES`) represents an isolated, zero-risk, high-fidelity interactive showcase designed for external presentations, public portfolio exhibition, client pitches, and technical evaluations.

The fundamental design mandate of the Public Demo is:
> **Deliver 100% of the commercial and AI user experience with 0% risk of sensitive intellectual property leakage, data exfiltration, or unauthorized platform core invocation.**

---

## 2. The 3 Operational Modes

Tentaciones AI Commerce strictly enforces three mutually exclusive operational modes configured via environment variables and resolved by `resolveOperationalMode()`:

```
+-----------------------------------------------------------------------------------+
|                              OPERATIONAL MODES                                    |
+--------------------------+------------------------------+-------------------------+
| Mode                     | Adapter Class                | Exposure / Connectivity |
+--------------------------+------------------------------+-------------------------+
| PUBLIC_DEMO (Default)    | DemoAdapter                  | Synthetic, 0 Secrets    |
| PRIVATE_CONNECTED_DEMO   | ConnectedServiceWrapper      | Authenticated Satellite |
| DEVELOPMENT              | DemoAdapter / Fallback       | Local Workspace Dev     |
+--------------------------+------------------------------+-------------------------+
```

### Mode Comparison Matrix

| Property / Vector | `PUBLIC_DEMO` | `PRIVATE_CONNECTED_DEMO` | `DEVELOPMENT` |
| :--- | :--- | :--- | :--- |
| **Catalog Source** | Synthetic Deterministic Model | AI Operating Platform Core | Local / Fixtures |
| **Payment Gateway** | Synthetic Simulator (`demo_token_`) | Private Sandbox / Test Token | Simulated Sandbox |
| **AI NLP Engine** | Safe Deterministic Rule/NLP Engine | Platform LLM / Ontology Core | Simulated / Local |
| **Secrets in Bundle** | **0 Secrets (Enforced)** | Secured Server Session | None / Local Dev |
| **Private URLs Exposed**| **BLOCKED (Fail-Closed)** | Allowed (Internal Network)| Localhost |
| **Network Calls** | Same-Origin Local API (`/api/*`)| Private VPC / Mutual TLS | Localhost |
| **Fail-Closed Gatekeeper**| Active (`assertSafeDemoMode`)| Standard Validation | Debug Mode |

---

## 3. Experience Contract (`ITentacionesExperienceService`)

All store interactions are executed through the standard interface contract:

```typescript
export interface ITentacionesExperienceService {
  getCatalog(category?: string, query?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  searchProducts(query: string): Promise<Product[]>;
  getCart(cartId: string): Promise<Cart>;
  addToCart(cartId: string, item: CartItemInput): Promise<Cart>;
  removeFromCart(cartId: string, sku: string): Promise<Cart>;
  simulateCheckout(payload: CheckoutPayload): Promise<CheckoutResult>;
  getARRecommendation(profile: ARProfile, category: string): Promise<ARRecommendation>;
  queryAIAssistant(prompt: string, context?: AIQueryContext): Promise<AIResponse>;
  getCommercialMetrics(): Promise<CommercialDemoMetrics>;
}
```

This ensures that UI clients (Web Storefront, Future Mobile iOS/Android, In-Store Kiosk) never know whether they are communicating with the synthetic `DemoAdapter` or the live `ConnectedServiceWrapper`.

---

## 4. Synthetic Data Integrity & Catalog

In `PUBLIC_DEMO` mode, all products, prices, brands, reviews, and categories are synthesized to represent a modern luxury and athletic apparel brand:
- **Categories:** Poleras, Camisas, Polerones, Chaquetas, Vestidos, Pantalones, Faldas, Calzado, Accesorios.
- **Biometric Fitting Profiles:**
  - `Nova`: Athletic Female (1.68m, bust: 88cm, waist: 66cm, hips: 94cm).
  - `Sora`: Unisex Slim (1.75m, chest: 92cm, waist: 74cm, hips: 90cm).
  - `Mateo`: Athletic Male (1.82m, chest: 104cm, waist: 82cm, hips: 98cm).
- **Virtual Try-On Assets:** URN schemas (`urn:tentaciones:ar:apparel:*`, `urn:tentaciones:ar:footwear:*`) with WebXR detection and 2D canvas fallback.

---

## 5. Security & Isolation Invariants

1. **Deterministic Responses:** Identical search prompts yield structured, repeatable, hallucination-free suggestions.
2. **Error Masking:** Raw stack traces, database schema names, and platform internal endpoints are stripped via `sanitizeErrorMessage()`.
3. **No External Dependencies:** The application bundle runs purely with native DOM APIs, zero third-party tracking scripts, zero external CDNs, and zero runtime npm dependencies.
