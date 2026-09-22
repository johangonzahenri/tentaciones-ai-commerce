# Roadmap Técnico — Tentaciones AI Commerce

============================================================
PROJECT: PROJ-01-TENTACIONES
STATUS: CERTIFIED (Phase 86 Complete)
VERSION: v1.2.0
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

### Fase 3: Hardening de Experiencia AR y Lanzamiento GitHub Privado (v1.1.5) — [COMPLETADA]
* [x] Hardening de la experiencia de probador virtual 2D/AR.
* [x] Prevención estricta de inyecciones DOM (0 `innerHTML`, 0 `outerHTML`).
* [x] Creación de `docs/AR_DEMO_GUIDE.md`, `docs/SHOWCASE_CHECKLIST.md`, y `docs/GITHUB_RELEASE.md`.
* [x] Repositorio configurado como estrictamente PRIVADO.

---

### Fase 4: Experiencia 3D GLTF & Despliegue Demo Público (v1.2.0) — [COMPLETADA]
* [x] Motor de proyección y renderizado 3D Canvas con rotación orbital, zoom, auto-giro e iluminación Lambertiana.
* [x] Soporte para metadatos de modelos 3D (`has3D`, `model3DUrl`, `model3DFormat`) en el catálogo sintético.
* [x] Generación procedural de geometrías de calzado, vestidos, tops/hoodies y accesorios con 0 dependencias externas.
* [x] Modal de visualización 3D interactivo con transición fluida al probador virtual AR.
* [x] Creación de `docs/3D_ARCHITECTURE.md`, `docs/GLTF_ASSET_GUIDE.md`, `docs/PUBLIC_DEPLOYMENT.md`, `docs/DEMO_RELEASE.md`.
* [x] Certificación de despliegue estático para Vercel / GitHub Pages / Netlify con Content Security Policy.

---

### Fase 5: Pipeline WebXR Inmersivo Avanzado (v1.3.0) — [PLANIFICADA]
* [ ] Proyección espacial WebXR en dispositivos con cámara y sensores de profundidad activos.
* [ ] Mapeo dinámico de texturas y drapeado de telas en avatares paramétricos en tiempo real.

---

### Fase 6: Clientes Nativos Mobile (iOS / Android / Flutter) (v1.5.0) — [PLANIFICADA]
* [ ] Implementación de cliente móvil Flutter consumiendo `ITentacionesExperienceService` vía REST.
* [ ] Probador AR nativo con ARKit (iOS) y ARCore (Android).
* [ ] Notificaciones push contextuales sobre carrito y promociones personalizadas.

---

### Fase 7: Conectividad Empresarial & ERP Sync (v2.0.0) — [BACKLOG]
* [ ] Integración de pasarela de pago real Webpay Plus Transbank / Stripe vía Gateway seguro en `PRIVATE_CONNECTED_DEMO`.
* [ ] Sincronización bidireccional de inventario con catálogos externos (Shopify/WooCommerce).
