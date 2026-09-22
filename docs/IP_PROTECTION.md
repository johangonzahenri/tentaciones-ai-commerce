# TENTACIONES AI COMMERCE — INTELLECTUAL PROPERTY PROTECTION & REPO BOUNDARIES

============================================================
CANONICAL DOCUMENT: docs/IP_PROTECTION.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: INTELLECTUAL PROPERTY BOUNDARY
CORRESPONDING CODE CONTRACT: ITentacionesExperienceService / Architecture Boundary
============================================================

## 1. The Core Protection Problem

Modern AI enterprises face a critical dilemma when presenting applications to clients, investors, or open-source communities:
* **Requirement:** Provide a fully functional, impressive, interactive software application.
* **Risk:** Exposing core proprietary reasoning kernels, multi-agent arbitration engines, ontological knowledge graphs, or commercial trade secrets.

Tentaciones AI Commerce implements an airtight **Polyrepo Intellectual Property Boundary** that solves this completely.

---

## 2. Polyrepo Architectural Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRIVATE CORE (Proprietary Asset)                         │
│                                                                             │
│   AI OPERATING PLATFORM (Parent Platform)                                  │
│   - Multi-Agent Orchestration Kernels                                       │
│   - Enterprise Governance & Mandate Reconciliation                          │
│   - Cryptographic Audit Ledger & Memory Graphs                              │
│   - Self-Healing Infrastructure Controllers                                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (Exposes Public REST API & SDK Contract)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PUBLIC BOUNDARY (Public Showcase)                        │
│                                                                             │
│   PLATFORM CLIENT SDK (Public Contract)                                     │
│   - Standard HTTP/REST Request Dispatchers                                  │
│   - Standard DTO Schemas & Type Definitions                                 │
│                                      │
│                                      ▼
│   PROJ-01-TENTACIONES (Public Repository)                                   │
│   - Storefront UI (HTML5, Native Vanilla JS, Modern CSS)                    │
│   - Multiclient Experience Contract (ITentacionesExperienceService)         │
│   - Demo Adapter (Purely Synthetic Engine, 0 Secrets)                       │
│   - Connected Adapter (Optional Proxy via Private Gateway)                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. What is Public vs. What is Private

### 3.1 Public Components (Safe for Open Exhibition)
- **Storefront Client:** Clean vanilla HTML/CSS/JS with zero frameworks.
- **Multiclient Experience Contract:** Interface definitions defining how applications query commerce data.
- **Demo Adapter (`DemoAdapter`):** Deterministic mock responses, heuristic recommendations, and synthetic catalog.
- **Biometric Fitting Heuristics:** Standard mathematical sizing calculations based on silhouette measurements.
- **Fail-Closed Guardrails:** Open security routines proving isolation to external auditors.

### 3.2 Private Components (Never Checked in or Bundled)
- **AI Operating Platform Core Engine:** All 80+ foundational platform modules.
- **Multi-Agent Governance Kernels:** Dynamic mandate resolution and compliance auditing algorithms.
- **Production Credentials & API Keys:** Stored in enterprise key vaults, never packaged in child repositories.
- **Enterprise Ontologies:** Proprietary customer graph models and business logic.
- **Internal Microservice Topology:** Hostnames, cluster IPs, and private service meshes.

---

## 4. Reverse Engineering Prevention

1. **No Code Bundling of Parent Modules:** The `tentaciones-ai-commerce` project has zero direct relative file imports (`../../src/core/...`) into the parent repository's internal engine.
2. **Contract-Driven Decoupling:** Communication only occurs through typed contracts (`src/contracts/experience-contract.ts`) or HTTP endpoints.
3. **Synthetic Determinism:** The AI assistant in public demo mode uses localized contextual heuristics rather than revealing raw prompt templates, system instructions, or internal chain-of-thought tokens.
