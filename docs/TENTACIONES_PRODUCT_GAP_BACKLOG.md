# Tentaciones AI Commerce — Product Gap Backlog

**STATUS:** CANONICAL SPECIFICATION  
**VERSION:** 1.8.1  
**PROJECT:** PROJ-01-TENTACIONES (`tentaciones-ai-commerce`)  
**DATE:** 2026-09-23  

---

## 1. Inventario y Clasificación de Brechas de Producto

| ID | Área / Módulo | Estado Actual | Necesidad / Justificación | Prioridad | Estado de Implementación | Evidencia Verificada |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **GAP-001** | Catálogo Reconciliado | Reconciliado 9 productos | El cliente fallback y el backend deben tener exactamente las mismas 9 prendas | **P0** | **IMPLEMENTED** | `src/domain/catalog-data.ts`, `public/app.js` |
| **GAP-002** | VTO $\to$ Cart Handoff | Reconciliado | La talla recomendada por el probador virtual debe transferirse automáticamente al carrito | **P0** | **IMPLEMENTED** | `public/app.js` (`btnVtoAddToCart`) |
| **GAP-003** | Free Shipping Math | Preciso a $30.000 CLP | Cálculo dinámico exacto de faltante y costo de despacho estándar ($3.990) | **P0** | **IMPLEMENTED** | `src/domain/types.ts`, `tests/tentaciones.test.ts` |
| **GAP-004** | Webpay Demo Transaccional | Simulado seguro | Flujo de checkout completo con número de orden único y reseteo atómico | **P0** | **IMPLEMENTED** | `src/engine/commerce-engine.ts`, `public/app.js` |
| **GAP-005** | Fallback Sintético Seguro | Fails Closed | Sin API keys en cliente; fallback determinista con disclaimer explícito | **P0** | **IMPLEMENTED** | `src/security/vto-guardrails.ts`, `tests/demo-security.test.ts` |
| **GAP-006** | Product Comparison | Implementado en motor | Comparación técnica lado a lado de especificaciones y materiales | **P1** | **IMPLEMENTED** | `src/engine/commerce-engine.ts`, `tests/tentaciones.test.ts` |
| **GAP-007** | Búsqueda Semántica Local | Regex / Token scoring | Búsqueda en lenguaje natural con extracción de intención en español | **P1** | **IMPLEMENTED** | `src/engine/commerce-engine.ts` |
| **GAP-008** | Avatares Biométricos | 3 Perfiles (Nova, Sora, Mateo) | Estimación antropométrica por categoría sin almacenar biometría real | **P1** | **IMPLEMENTED** | `src/domain/ar-fitting.ts`, `tests/tentaciones.test.ts` |
| **GAP-009** | Order Tracking & Post-Sale | Demo simulado | Sistema de post-venta con historial de órdenes en cliente | **P2** | **PLANNED** | Futuro hito v2.0 |
| **GAP-010** | Live User Wishlist | En memoria de sesión | Persistencia de favoritos entre pestañas | **P2** | **PLANNED** | Futuro hito v2.0 |
| **GAP-011** | Multi-Currency Real FX | CLP por defecto / EUR fijo | Tipo de cambio en tiempo real con pasarelas internacionales | **P3** | **OUT OF SCOPE** | Desestimado para mantener determinismo demo |

---

## 2. Decisión Arquitectónica de Alcance

Para preservar la pureza técnica del producto y el axioma de **Cero Dependencias en Tiempo de Ejecución**:
1. **Desestimación de Autenticación Pesada (Auth0 / Firebase):** La aplicación no incluye sistemas de autenticación invasivos en el storefront público para no degradar la velocidad de demostración.
2. **Preservación de Webpay Demo:** No se integran pasarelas de pago bancarias reales para garantizar seguridad absoluta en demostraciones públicas.
3. **Persistencia Inmutable:** El estado del carrito y la sesión de usuario operan en memoria y estado reactivo seguro sin cookies de rastreo de terceros.
