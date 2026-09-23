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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    PUBLIC SHOWCASE TIER                     â”‚
â”‚  - Static zero-secret bundle (HTML5/CSS3/ESM)               â”‚
â”‚  - Real GLB/glTF 2.0 3D spatial models                      â”‚
â”‚  - WebXR spatial hit-test & procedural fitting fallbacks   â”‚
â”‚  - Simulated Webpay demo checkout                           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
            [Fail-Closed Boundary & Demo Guardrails]
                               â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    EXPERIENCE ADAPTER TIER                  â”‚
â”‚  - ITentacionesExperienceService contract                   â”‚
â”‚  - DemoAdapter: Deterministic synthetic business logic      â”‚
â”‚  - TentacionesPlatformAdapter: Connected platform bridge    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
             [Enterprise Authentication & REST API]
                               â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                AI OPERATING PLATFORM CORE                   â”‚
â”‚  - Multi-Enterprise Governance & Mandate Reconciliation     â”‚
â”‚  - Distributed Task Orchestration & Ontology Engines        â”‚
â”‚  - Strict Private Repositories & Enterprise WAL DB          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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
