# PORTFOLIO PROJECT CARD: TENTACIONES AI COMMERCE

STATUS: CERTIFIED
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
PARENT PLATFORM: AI Operating Platform (v1.4.0)
VERSION: 1.8.1 (Final Release Package Ready)
LICENSE: Apache-2.0
OWNER: Lead Product & Systems Architect

---

## 1. Project Overview
**Tentaciones AI Commerce** es una aplicaciÃ³n satÃ©lite de comercio electrÃ³nico de moda y calzado, diseÃ±ada como el Proyecto 01 del ecosistema **AI Operating Platform**. Demuestra una experiencia de compra asistida por Inteligencia Artificial que combina descubrimiento en lenguaje natural, inspecciÃ³n tridimensional Canvas/GLB, Realidad Aumentada WebXR con anclaje espacial y un motor de Virtual Try-On (VTO) con aislamiento determinista.

---

## 2. Problem & Solution
* **Problema**: Las tiendas de moda online sufren tasas de devoluciÃ³n elevadas (30-40%) debido a la incertidumbre en calce, caÃ­da textil y visualizaciÃ³n tridimensional de prendas.
* **SoluciÃ³n**: Un storefront reactivo sin dependencias pesadas de runtime que integra la "TrÃ­ada Visual" (3D Canvas + WebXR AR + AI Virtual Try-On), permitiendo previsualizar el calce con avatares calibrados y fotos personales bajo estrictos estÃ¡ndares de privacidad efÃ­mera.

---

## 3. System Architecture & Platform Relationship

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚               AI OPERATING PLATFORM (Parent)            â”‚
â”‚  â€¢ Governance Engine    â€¢ Ontological Commerce Kernel   â”‚
â”‚  â€¢ Secure Vault         â€¢ Multi-Agent Services          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚ (Platform SDK / REST)
                             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚           TENTACIONES AI COMMERCE (Project 01)          â”‚
â”‚                                                         â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚   â”‚ Multiclient Experience Service Layer            â”‚   â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚            â–¼                               â–¼            â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚   â”‚ Storefront Web   â”‚           â”‚ VTO Domain       â”‚   â”‚
â”‚   â”‚ (Vanilla / DOM)  â”‚           â”‚ ExecutionGateway â”‚   â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                            â”‚            â”‚
â”‚                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”     â”‚
â”‚                     â–¼                             â–¼     â”‚
â”‚          DemoVirtualTryOnProvider      FashnVirtualTryOnâ”‚
â”‚          (Public Demo / In-Memory)     (Private Gated)  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 4. Key Capabilities & Technical Highlights
1. **AI Virtual Try-On (VTO Engine)**:
   * Arquitectura agnÃ³stica de proveedor con soporte dual para `DemoVirtualTryOnProvider` y `FashnVirtualTryOnProvider`.
   * Pipeline de validaciÃ³n de calidad de imagen con detecciÃ³n binaria de cabeceras mÃ¡gicas (JPEG, PNG, WebP).
   * Guardrails operacionales: disyuntor de fallos, control de concurrencia y lÃ­mites estrictos de presupuesto.
2. **Interactive 3D & Spatial WebXR**:
   * Motor de proyecciÃ³n 3D Canvas autÃ³nomo con renderizado de modelos GLB 2.0 y glTF 2.0.
   * Sesiones WebXR con detecciÃ³n de planos mediante retÃ­cula Hit-Test y degradaciÃ³n suave.
3. **Conversational Assistant & Sizing**:
   * InterpretaciÃ³n de intenciones de bÃºsqueda en espaÃ±ol e inglÃ©s.
   * CalibraciÃ³n paramÃ©trica de tallas basada en perfiles biomÃ©tricos (`Nova`, `Sora`, `Mateo`).

---

## 5. Security & Privacy Invariants
* **Zero Runtime Secrets**: Cero claves API o tokens embebidos en el cliente pÃºblico.
* **Fail-Closed Gate**: Bloqueo preventivo automÃ¡tico ante la ausencia de credenciales externas.
* **Efimeridad de Memoria**: LiberaciÃ³n determinista de referencias mediante `URL.revokeObjectURL()`.
* **Higiene DOM**: Cero mÃ©todos inseguros (`.innerHTML`, `.outerHTML`, `eval()`, `document.write()`).

---

## 6. Technology Stack
* **Lenguajes**: TypeScript (Strict ES2022 / NodeNext), Modern Vanilla JavaScript (ES Modules).
* **Backend Runtime**: Node.js $\ge 22.0.0$ (Servidor HTTP nativo con 0 dependencias de producciÃ³n).
* **Formatos de Activos**: GLB 2.0, glTF 2.0, SVG vectorial optimizado.
* **Testing**: Node.js Test Runner nativo (`node:test`, `node:assert/strict`).

---

## 7. Current Status & Known Limitations
* **Estado Actual**: `FINAL RELEASE PACKAGE READY (v1.8.1)` verificado para publicaciÃ³n estÃ¡tica y demostraciÃ³n pÃºblica.
* **Inferencia FASHN Real**: Bloqueada preventivamente (`BLOCKED / FAIL-CLOSED`) hasta aprovisionamiento de credencial segura en servidor.
* **Pasarela de Pago**: Modo simulaciÃ³n (`WEBPAY_DEMO`) sin transacciones bancarias reales.
