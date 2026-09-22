# SHOWCASE ARCHITECTURE & PORTFOLIO INTEGRATION

CANONICAL DOCUMENT: docs/SHOWCASE_ARCHITECTURE.md  
STATUS: CERTIFIED  
VERSION: 1.5.0  
APPLICATION: PROJ-01-TENTACIONES  
PORTFOLIO: AI Operating Platform  

---

## 1. Architectural Philosophy

Tentaciones AI Commerce acts as a **flagship showcase application** for the broader **AI Operating Platform** polyrepo portfolio. Its architecture demonstrates how high-fidelity customer-facing applications can interact with autonomous platform capabilities while preserving strict boundaries around proprietary intellectual property.

---

## 2. Multi-Tier Boundary Model

```text
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC SHOWCASE TIER                     │
│  - Static zero-secret bundle (HTML5/CSS3/ESM)               │
│  - Real GLB/glTF 2.0 3D spatial models                      │
│  - WebXR spatial hit-test & procedural fitting fallbacks   │
│  - Simulated Webpay demo checkout                           │
└──────────────────────────────┬──────────────────────────────┘
                               │
            [Fail-Closed Boundary & Demo Guardrails]
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    EXPERIENCE ADAPTER TIER                  │
│  - ITentacionesExperienceService contract                   │
│  - DemoAdapter: Deterministic synthetic business logic      │
│  - TentacionesPlatformAdapter: Connected platform bridge    │
└──────────────────────────────┬──────────────────────────────┘
                               │
             [Enterprise Authentication & REST API]
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                AI OPERATING PLATFORM CORE                   │
│  - Multi-Enterprise Governance & Mandate Reconciliation     │
│  - Distributed Task Orchestration & Ontology Engines        │
│  - Strict Private Repositories & Enterprise WAL DB          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Key Invariants & Safeguards

1. **Zero Secret Footprint:** No sensitive platform API keys, database credentials, or secret tokens are bundled in the public static distribution.
2. **Fail-Closed Protection:** The `assertSafeDemoMode` invariant throws a `SecurityViolationError` if any production configuration is accidentally exposed in `PUBLIC_DEMO` mode.
3. **DOM Safety:** The web interface employs 100% programmatic DOM generation (`createElement`, `setAttribute`, `textContent`), strictly excluding unsafe APIs (`innerHTML`, `outerHTML`, `eval()`, `document.write()`).
4. **Polyrepo Decoupling:** The application codebase is completely autonomous. The parent AI Operating Platform remains unpolluted by storefront UI dependencies.

---

## 4. Multiclient Scalability

The `ITentacionesExperienceService` interface allows identical business logic to power multiple frontends:
* **Web Storefront:** Browser-based responsive web app with WebGL/WebXR.
* **Mobile Apps:** Future React Native / Flutter apps consuming the same experience contract.
* **Physical Store Kiosks:** In-store smart mirrors and interactive fitting terminals.

---

*Certified by AI Operating Platform Technical Architecture Board.*
