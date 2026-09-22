# Roadmap Técnico — Tentaciones AI Commerce

---

## 1. Fases del Proyecto

### Fase 1: Extracción Standalone & Storefront MVP (v1.0.0) — [COMPLETADA]
* [x] Extracción de lógica de dominio de la plataforma padre.
* [x] Implementación de `TentacionesPlatformAdapter` con fallback automático.
* [x] Storefront Single Page Application con soporte de temas Claro/Oscuro y modo bilingüe (`es-419` / `en`).
* [x] Catálogo demo multicanal en moneda local CLP y EUR.
* [x] Calibración de tallas y probador virtual AR con perfiles demo (`Nova`, `Sora`, `Mateo`).
* [x] Simulación de checkout `WEBPAY_DEMO` y control de existencias antes de mutación.
* [x] Suite de 18 pruebas automatizadas pasando al 100%.

---

### Fase 2: Pipeline WebXR & Modelos 3D GLTF (v1.1.0) — [PLANIFICADA]
* [ ] Integración de Three.js y cargador GLTFLoader para modelos 3D reales de prendas.
* [ ] Proyección espacial AR en dispositivos móviles con cámara WebXR activa.
* [ ] Mapeo de texturas dinámicas sobre avatares paramétricos.

---

### Fase 3: Pasarela Webpay Plus Producción & Sincronización ERP (v1.2.0) — [BACKLOG]
* [ ] Integración con SDK oficial Webpay Plus Transbank con firma criptográfica en vivo.
* [ ] Sincronización bidireccional de inventario con catálogos externos (Shopify/WooCommerce).
