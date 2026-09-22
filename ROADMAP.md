# Roadmap Técnico — Tentaciones AI Commerce

============================================================
PROJECT: PROJ-01-TENTACIONES
STATUS: UPDATED (Prompt 84 Certified)
============================================================

## 1. Hitos del Proyecto

### Fase 1: Extracción Standalone & Storefront MVP (v1.0.0) — [COMPLETADA]
* [x] Extracción de lógica de dominio de la plataforma padre.
* [x] Implementación de `TentacionesPlatformAdapter` con fallback automático.
* [x] Storefront Single Page Application con soporte de temas Claro/Oscuro y modo bilingüe (`es-419` / `en`).
* [x] Catálogo demo multicanal en moneda local CLP y EUR.
* [x] Calibración de tallas y probador virtual AR con perfiles demo (`Nova`, `Sora`, `Mateo`).
* [x] Simulación de checkout `WEBPAY_DEMO` y control de existencias antes de mutación.
* [x] Suite de pruebas automatizadas pasando al 100%.

---

### Fase 2: Demo Seguro, Protección de IP y Preparación Multicliente (v1.1.0) — [COMPLETADA]
* [x] Definición e implementación de 3 Modos Operativos: `PUBLIC_DEMO`, `PRIVATE_CONNECTED_DEMO`, `DEVELOPMENT`.
* [x] Implementación del Contrato Multicliente `ITentacionesExperienceService` (`src/contracts/experience-contract.ts`).
* [x] Implementación de `DemoAdapter` (`src/adapter/demo-adapter.ts`) con catálogo sintético aislado y métricas de demostración.
* [x] Implementación de Invariantes de Seguridad Fail-Closed (`src/security/demo-guardrails.ts`).
* [x] Sanitización de errores (`sanitizeErrorMessage`) y Redacción de payloads (`redactSensitivePayload`).
* [x] Banner de Demo Pública Segura, Drawer de Arquitectura Showcase y Barra de Métricas Comerciales en el Storefront.
* [x] Creación de 6 Documentos Canónicos en `docs/` (`PUBLIC_DEMO.md`, `DEMO_SECURITY.md`, `IP_PROTECTION.md`, `MULTICLIENT_ARCHITECTURE.md`, `PORTFOLIO_SHOWCASE.md`, `DEPLOYMENT_STRATEGY.md`).

---

### Fase 3: Pipeline WebXR & Modelos 3D GLTF Nativos (v1.2.0) — [PLANIFICADA]
* [ ] Integración de renderizado Three.js y soporte GLTF/USDZ nativo en el probador virtual.
* [ ] Proyección espacial AR en dispositivos móviles con cámara WebXR activa.
* [ ] Mapeo dinámico de texturas y drapeado de telas en avatares paramétricos.

---

### Fase 4: Clientes Nativos Mobile (iOS / Android / Flutter) (v1.5.0) — [PLANIFICADA]
* [ ] Implementación de cliente móvil Flutter consumiendo `ITentacionesExperienceService` vía REST.
* [ ] Probador AR con ARKit (iOS) y ARCore (Android).
* [ ] Notificaciones push contextuales sobre carrito y promociones personalizadas.

---

### Fase 5: Conectividad Empresarial & ERP Sync (v2.0.0) — [BACKLOG]
* [ ] Integración de pasarela de pago real Webpay Plus Transbank / Stripe vía Gateway seguro en `PRIVATE_CONNECTED_DEMO`.
* [ ] Sincronización bidireccional de inventario con catálogos externos (Shopify/WooCommerce).
