# Roadmap Técnico — Tentaciones AI Commerce

============================================================
PROJECT: PROJ-01-TENTACIONES
STATUS: RELEASE CLOSURE PENDING — GitHub Pages manual activation required
VERSION: v1.8.1
============================================================

## 1. Hitos del Proyecto

### Fase 1: Extracción Standalone & Storefront MVP (v1.0.0) — [IMPLEMENTED]
* [x] Extracción de lógica de dominio de la plataforma padre.
* [x] Implementación de `TentacionesPlatformAdapter` con fallback automático.
* [x] Storefront Single Page Application con soporte de temas Claro/Oscuro y modo bilingüe (`es-419` / `en`).
* [x] Catálogo demo multicanal en moneda local CLP y EUR.
* [x] Calibración de tallas y probador virtual AR con perfiles demo (`Nova`, `Sora`, `Mateo`).
* [x] Simulación de checkout `WEBPAY_DEMO` y control de existencias antes de mutación.
* [x] Suite de pruebas automatizadas pasando al 100%.

---

### Fase 2: Demo Seguro, Protección de IP y Preparación Multicliente (v1.1.0) — [IMPLEMENTED]
* [x] Definición e implementación de 3 Modos Operativos: `PUBLIC_DEMO`, `PRIVATE_CONNECTED_DEMO`, `DEVELOPMENT`.
* [x] Implementación del Contrato Multicliente `ITentacionesExperienceService` (`src/contracts/experience-contract.ts`).
* [x] Implementación de `DemoAdapter` (`src/adapter/demo-adapter.ts`) con catálogo sintético aislado y métricas de demostración.
* [x] Implementación de Invariantes de Seguridad Fail-Closed (`src/security/demo-guardrails.ts`).
* [x] Sanitización de errores (`sanitizeErrorMessage`) y Redacción de payloads (`redactSensitivePayload`).
* [x] Banner de Demo Pública Segura, Drawer de Arquitectura Showcase y Barra de Métricas Comerciales en el Storefront.
* [x] Creación de 6 Documentos Canónicos en `docs/` (`PUBLIC_DEMO.md`, `DEMO_SECURITY.md`, `IP_PROTECTION.md`, `MULTICLIENT_ARCHITECTURE.md`, `PORTFOLIO_SHOWCASE.md`, `DEPLOYMENT_STRATEGY.md`).

---

### Fase 3: Hardening de Experiencia AR y Lanzamiento GitHub Privado (v1.1.5) — [IMPLEMENTED]
* [x] Hardening de la experiencia de probador virtual 2D/AR.
* [x] Prevención estricta de inyecciones DOM (0 `innerHTML`, 0 `outerHTML`).
* [x] Creación de `docs/AR_DEMO_GUIDE.md`, `docs/SHOWCASE_CHECKLIST.md`, y `docs/GITHUB_RELEASE.md`.
* [x] Repositorio configurado como estrictamente PRIVADO.

---

### Fase 4: Experiencia 3D GLTF & Despliegue Demo Público (v1.2.0) — [IMPLEMENTED]
* [x] Motor de proyección y renderizado 3D Canvas con rotación orbital, zoom, auto-giro e iluminación Lambertiana.
* [x] Soporte para metadatos de modelos 3D (`has3D`, `model3DUrl`, `model3DFormat`) en el catálogo sintético.
* [x] Generación procedural de geometrías de calzado, vestidos, tops/hoodies y accesorios con 0 dependencias externas.
* [x] Modal de visualización 3D interactivo con transición fluida al probador virtual AR.
* [x] Creación de `docs/3D_ARCHITECTURE.md`, `docs/GLTF_ASSET_GUIDE.md`, `docs/PUBLIC_DEPLOYMENT.md`, `docs/DEMO_RELEASE.md`.

---

### Fase 5: Pipeline GLB/GLTF Real & Verificación de Despliegue Público (v1.3.0) — [IMPLEMENTED]
* [x] Registro central de assets 3D en `src/domain/3d-assets.ts` con control estricto de licencias CC0 y procedencia sintética.
* [x] Generador de binarios reales GLB 2.0 (`pro-carbon-racer.glb`, `reloj-titanio.glb`) y GLTF 2.0 (`polera-essential.gltf`, `silk-evening-dress.gltf`).
* [x] Parser cliente de buffers binarios GLB y JSON GLTF en `public/app.js` con fallback automático a renderizado procedural.
* [x] Configuración de tipos MIME para `.glb`, `.gltf` y `.bin` en `src/server.ts`.
* [x] Creación del registro canónico de release `docs/RELEASE_1_3_0.md` y actualización de `docs/GLTF_ASSET_GUIDE.md`.
* [x] Invariantes de seguridad para despliegue estático público con 0 fugas de secretos y 14 documentos canónicos certificados.

---

### Fase 6: WebXR AR Espacial Real & Hit-Test Surface Placement (v1.4.0) — [IMPLEMENTED]
* [x] Soporte de sesión `immersive-ar` con detección de capacidades `navigator.xr` y degradación a 5 niveles de fallback.
* [x] Detección de planos y anclaje espacial con retícula de Hit-Test en tiempo real.
* [x] Anclaje y colocación interactiva de modelos GLB/GLTF y procedurales en el espacio físico.
* [x] Controles de transformación espacial (Escala 0.25x - 2.5x, Rotación 45° planar, Quitar objeto).
* [x] Limpieza completa de recursos de sesión XR (cancelAnimationFrame, clearTimeout, session.end()) evitando fugas de memoria.
* [x] Creación de 3 documentos canónicos: `docs/WEBXR_AR_ARCHITECTURE.md`, `docs/WEBXR_COMPATIBILITY.md`, `docs/AR_SESSION_GUIDE.md` (Total 17 docs).

---

### Fase 7: Showcase Profesional, Media Assets & Walkthrough Interactivo del Probador AR (v1.5.0) — [IMPLEMENTED]
* [x] Registro central de media assets y pasos interactivos en `src/domain/showcase-assets.ts`.
* [x] Ilustraciones técnicas SVG vectoriales para portada hero y los 5 pasos del probador AR.
* [x] Componente interactivo de AR Walkthrough con navegación de pasos, indicadores de progreso y lanzamiento directo a prueba en vivo.
* [x] Matriz de Honestidad Técnica de Producto incorporada al showcase con desglose de funcionalidades implementadas vs fuera de alcance.
* [x] Metadatos Open Graph, Twitter Cards y Favicon SVG para previsualización enriquecida en redes y portafolio.
* [x] Creación de 3 documentos canónicos: `docs/CASE_STUDY.md`, `docs/SHOWCASE_MEDIA.md`, `docs/SHOWCASE_ARCHITECTURE.md` (Total 21 docs certificados).
* [x] Verificación de 40 pruebas unitarias y de integración pasando al 100%.

---

### Fase 8: AI Virtual Try-On Engine & Provider Abstraction (v1.6.0) — [IMPLEMENTED]
* [x] Definición del contrato provider-agnostic `IVirtualTryOnProvider` y máquina de estados `TryOnState`.
* [x] Implementación de `DemoVirtualTryOnProvider` (offline, determinista) y `FashnVirtualTryOnProvider` (FASHN AI API Cloud).
* [x] Servicio de dominio `VirtualTryOnService` y fábrica `createVTOService` según modo operativo.
* [x] Guardrails de seguridad fail-closed (`assertSafeVTOMode`, `validateUserImagePayload`, `sanitizeVTOResponse`, `redactVTOSecrets`).
* [x] Endpoints REST `/api/vto/validate`, `/api/vto/generate`, `/api/vto/status/:id`, `/api/vto/result/:id`, `/api/vto/cancel/:id`.
* [x] UI del probador virtual con modal de 4 etapas (Consentimiento, Selección Avatar/Foto, Progreso por fases, Visualización de Resultado con recomendación de talla).
* [x] Creación de 5 documentos canónicos: `docs/VTO_ENGINE_ARCHITECTURE.md`, `docs/VTO_PROVIDER_EVALUATION.md`, `docs/VTO_PRIVACY.md`, `docs/VTO_API_INTEGRATION.md`, `docs/VTO_PRODUCT_COMPATIBILITY.md` (Total 26 docs certificados).

---

### Fase 9: Validación End-to-End del Conector FASHN (v1.6.1) — [IMPLEMENTED]
* [x] Integración de esquemas oficiales FASHN API (`tryon-max` con `product_image`, `tryon-v1.6` con `garment_image`).
* [x] Salida efímera en memoria con `return_base64: true` y validación estricta de dominios CDN (`cdn.fashn.ai`, `media.fashn.ai`).
* [x] Clasificación y sanitización de errores FASHN (`ImageLoadError`, `InputValidationError`, `ContentModerationError`, `UnavailableError`, `PipelineError`).
* [x] Creación de `docs/VTO_FIRST_PILOT.md` (Total 27 documentos canónicos certificados).

---

### Fase 10: Auditoría del Primer Piloto Real & Matriz de Calidad VTO (v1.6.2) — [IMPLEMENTED]
* [x] Clasificación de `tryon-max` como *Recommended Preview Model* y `tryon-v1.6` como *Stable Model*.
* [x] Soporte tipado para `PoseError` en el clasificador de errores de inferencia.
* [x] Creación de la matriz observacional de calidad `docs/VTO_FIRST_PILOT_EVALUATION.md`.
* [x] Verificación de aislamiento estricto `PUBLIC_DEMO` vs `PRIVATE_CONNECTED_DEMO`.
* [x] Diagnóstico técnico honesto: `REAL PILOT = BLOCKED BY MISSING CREDENTIAL`.

---

### Fase 11: VTO Image Pipeline & Input Quality Engine (v1.6.3) — [IMPLEMENTED]
* [x] Creación de `TryOnImagePipeline` para validación, normalización y preparación de fotografías de usuarios y prendas.
* [x] Auditoría binaria de cabeceras mágicas (JPEG `0xFFD8FF`, PNG `0x89504E47`, WebP `RIFF...WEBP`) contra ataques de MIME spoofing y polyglot.
* [x] Taxonomía de calidad en 5 estados (`EXCELLENT`, `ACCEPTABLE`, `WARNING`, `REJECT`, `UNKNOWN`).
* [x] Límites de resolución y payload justificados (Min 384x512, Max 4096x4096 / 16 MP / 10 MB, Floor 2 KB).
* [x] Contratos desacoplados `PreparedUserImage` y `PreparedProductImage` con preservación de 0 fugas de memoria y destrucción efímera.
* [x] Función automatizada de preparación de piloto real `isReadyForRealVTO()`.
* [x] Paridad de internacionalización bilingüe `es-419` y `en` con llaves `imageQuality.*` y `tryon.image.*`.
* [x] Creación de 3 nuevos documentos canónicos: `docs/VTO_IMAGE_PIPELINE.md`, `docs/VTO_INPUT_QUALITY.md`, `docs/VTO_REAL_PILOT_CHECKLIST.md`.
* [x] Suite de 64 pruebas automatizadas pasando al 100%.

---

### Fase 12: VTO Execution Gateway & Real Pilot Readiness (v1.6.4) — [IMPLEMENTED]
* [x] Implementación de `VTOExecutionGateway` para orquestación centralizada, control de idempotencia y aislamiento de proveedores.
* [x] Motor de sondeo acotado `VtoPredictionPoller` y matriz de reintentos determinista con retroceso exponencial `VtoRetryPolicy`.
* [x] Contratos de dominio neutrales `VirtualTryOnExecutionRequest` y `VirtualTryOnExecutionResult`.
* [x] Validación estricta de dominios de salida (Data URI, `https://cdn.fashn.ai/`, `https://media.fashn.ai/`).
* [x] Herramienta CLI de ejecución controlada `scripts/vto-pilot.mjs` con soporte para `CHECK`, `DRY_RUN` y `REAL_RUN` (Fail-Closed ante ausencia de credenciales).
* [x] Creación de 6 nuevos documentos canónicos: `docs/VTO_EXECUTION_GATEWAY.md`, `docs/VTO_PROVIDER_POLICY.md`, `docs/VTO_POLLING_RETRY.md`, `docs/VTO_RESULT_CONTRACT.md`, `docs/VTO_REAL_PILOT_RUNBOOK.md`, `docs/VTO_PRIVACY_EXECUTION.md` (Total 37 documentos certificados).
* [x] Suite de 72 pruebas automatizadas pasando al 100%.

---

### Fase 13: VTO Storefront Experience Integration & UI Benchmark (v1.6.5) — [IMPLEMENTED]
* [x] Integración de máquina de estados determinista en UI (`IDLE`, `VALIDATING_INPUT`, `QUALITY_REJECTED`, `QUALITY_WARNING`, `READY`, `CONSENT_REQUIRED`, `EXECUTING`, `POLLING`, `SUCCESS`, `FAILED`, `CANCELLED`).
* [x] Gestión de ciclo de vida de memoria y revocación explícita de `URL.createObjectURL` (`releaseVTOObjectUrl`).
* [x] Endpoint de validación técnica preventiva en tiempo real `/api/vto/assess` conectado con `TryOnImagePipeline`.
* [x] Badges de calidad visual (`EXCELLENT`, `ACCEPTABLE`, `WARNING`, `REJECT`) con feedback detallado de dimensiones, formato y orientación.
* [x] Sanitización estricta y redacción de credenciales en errores de cliente (`[REDACTED]`).
* [x] Higiene DOM estricta: 0 `innerHTML`, 0 `outerHTML`, 0 `eval`, 0 `document.write`.
* [x] Creación de 2 nuevos documentos canónicos: `docs/VTO_STOREFRONT_INTEGRATION.md`, `docs/VTO_STOREFRONT_UI_BENCHMARK.md` (Total 39 documentos certificados).
* [x] Suite de 77 pruebas automatizadas pasando al 100%.

---

### Fase 14: VTO Evidence Hardening & Real Pilot Preflight (v1.6.6) — [IMPLEMENTED]
* [x] Auditoría integral de claims técnicos y reclasificación formal (`VERIFIED`, `PARTIAL`, `NOT MEASURED`, `BLOCKED`, `NOT_APPLICABLE`).
* [x] Reclasificación semántica de métricas de rendimiento en UI Benchmark distinguiendo Targets SLA de mediciones reales.
* [x] Sustitución de claim sobre memoria por verificación estricta de ciclo de vida `URL.revokeObjectURL()`.
* [x] Creación del Registro Canónico de Evidencia Técnica `docs/VTO_EVIDENCE_REGISTER.md`.
* [x] Creación de la Especificación de Diagnóstico y Preflight de Piloto Real `docs/VTO_REAL_PILOT_PREFLIGHT.md`.
* [x] Verificación de suite de pruebas automatizadas y compilación TypeScript limpia (Total 41 documentos certificados).

---

### Fase 15: Controlled Real FASHN Pilot & VTO Production Evidence (v1.6.7) — [IMPLEMENTED]
* [x] Protocolo de ejecución controlada con intercepción Fail-Closed verificado vía CLI `scripts/vto-pilot.mjs`.
* [x] Preflight Check verificado: Estado de credenciales reportado de manera determinista (`BLOCKED (MISSING CREDENTIAL)`).
* [x] Dry-run gateway validado exitosamente (`status: COMPLETED`, `providerId: demo-synthetic`).
* [x] Intento de ejecución real bloqueado antes de invocar red externa con código de salida 1 (`FAIL-CLOSED (EXPECTED)`).
* [x] Creación del documento canónico `docs/VTO_REAL_PILOT_EVIDENCE.md` con matriz de reproducibilidad EV-01 a EV-15.
* [x] Actualización de matriz de evidencia en `docs/VTO_EVIDENCE_REGISTER.md` y actualización de suite de seguridad (Total 42 documentos certificados).
* [x] 78 tests pasando al 100% con 0 errores TypeScript.

---

### Fase 16: VTO Operational Hardening, Cost Guardrails & Observability (v1.6.8) — [IMPLEMENTED]
* [x] Guardrails de costo estrictos con verificación determinista (`numImages === 1`, tech ceilings en retries, polling y timeout).
* [x] Gestor de concurrencia in-memory con bloqueo por sesión (`VTO_CONCURRENCY_LIMIT`) y caché de idempotencia con TTL.
* [x] Disyuntor de fallos de proveedor `VTOProviderCircuitBreaker` (anticascada con apertura tras 5 fallos y cooldown de 30s).
* [x] Rate limiting deslizante por sesión / IP para prevención de abuso y llamadas involuntarias en bucle.
* [x] Módulo de observabilidad `VTOLogger` y `VTOMetricsCollector` con registro estructurado, identificadores de correlación y cero fugas de secretos o imágenes.
* [x] Endpoint de métricas en tiempo real `/api/vto/metrics` con separación inequívoca de métricas de Demo vs Real.
* [x] Protección contra resultados tardíos o callbacks obsoletos (`VTO_STALE_EXECUTION`) ante cancelación o expiración de tiempo.
* [x] Creación de 2 nuevos documentos canónicos: `docs/VTO_OPERATIONAL_GUARDRAILS.md` y `docs/VTO_OBSERVABILITY.md` (Total 44 documentos certificados).
* [x] Suite ampliada de 87 pruebas automatizadas pasando al 100% con 0 errores TypeScript.

---

### Fase 17: Final Pilot Gate & Cost-Safe Real FASHN Smoke Test Profile (v1.7.3) — [IMPLEMENTED]
* [x] Congelamiento del perfil de smoke test técnico de mínimo coste `FASHN_FIRST_REAL_SMOKE_TEST` (`tryon-max`, `generation_mode: fast`, `resolution: 1k`, `num_images: 1`, `return_base64: true`).
* [x] Eliminación de la suposición de "tryon-max + quality + 1k = 1 crédito", estableciendo la configuración `fast + 1k + 1 img` para consumo mínimo controlado.
* [x] Priorización de privacidad mediante `return_base64 = true` para transporte de inferencia en memoria RAM hacia el Storefront.
* [x] Preflight y compuerta de activación `FashnRealPilotActivationGate` evaluados deterministamente: `PILOT BLOCKED (FAIL-CLOSED)` ante la ausencia de `FASHN_API_KEY`.
* [x] Actualización de documentos canónicos `docs/FASHN_PROVIDER_CONTRACT.md`, `docs/FASHN_CONTRACT_CONFORMANCE.md`, `docs/VTO_EVIDENCE_REGISTER.md` y `docs/VTO_REAL_PILOT_EVIDENCE.md` (Total 46 documentos certificados).
* [x] Suite completa de 97 pruebas automatizadas pasando al 100% con 0 errores TypeScript.

---

### Fase 18: VTO Release Closure, Demo E2E & Storefront Production Certification (v1.7.5) — [IMPLEMENTED]
* [x] Certificación de experiencia VTO de extremo a extremo en Storefront en modo Demo (`DemoVirtualTryOnProvider`).
* [x] Corrección semántica estricta del Gate: Estado `BLOCKED (FAIL-CLOSED)` consistente cuando falta `FASHN_API_KEY`.
* [x] Verificación de ciclo de vida de memoria (`URL.revokeObjectURL`), prevención de peticiones duplicadas y mitigación de fugas.
* [x] Creación de la suite de pruebas `tests/vto-demo-e2e.test.ts` garantizando invariante `REAL ≠ DEMO` sin fallback silencioso.
* [x] Creación de `docs/VTO_DEMO_RELEASE_CHECKLIST.md` con 20 secciones de certificación (Total 47 documentos certificados).
* [x] Suite ampliada de 105 pruebas automatizadas pasando al 100% con 0 errores TypeScript.

---

### Fase 19: Release Candidate & Public Demo Hardening (v1.8.0) — [IMPLEMENTED]
* [x] Definición formal de límites y política de release (`src/config/demo-release-policy.ts`).
* [x] Creación del script de auditoría de release `scripts/release-check.mjs`.
* [x] Creación de la suite de pruebas de release público `tests/public-demo-release.test.ts`.
* [x] Creación de `docs/RELEASE_MANIFEST.md`, `docs/PUBLIC_DEMO_ARCHITECTURE.md` y `docs/PUBLIC_DEMO_RELEASE_CHECKLIST.md` (Total 50 documentos certificados).
* [x] Suite ampliada de 110 pruebas automatizadas pasando al 100% con 0 errores TypeScript.

---

### Fase 20: Publication Readiness Audit & Portfolio Card (v1.8.1) — [IMPLEMENTED]
* [x] Corrección estricta de claims no fundamentados (60 FPS $\rightarrow$ renderizado interactivo, eliminación de afirmaciones de riesgo cero, cualificación de accesibilidad).
* [x] Auditoría integral de almacenamiento cliente (0 usos de `localStorage`, `sessionStorage`, `IndexedDB` o cookies para datos sensibles).
* [x] Creación del script de auditoría de publicación `scripts/publication-check.mjs` con clasificación `PASS / FAIL / MANUAL_VERIFICATION_REQUIRED`.
* [x] Creación de la suite de pruebas de publicación `tests/publication-readiness.test.ts`.
* [x] Creación de `docs/PUBLIC_DEMO_DEPLOYMENT.md` y `docs/PORTFOLIO_PROJECT_CARD.md`.
* [x] Suite ampliada de 115 pruebas automatizadas pasando al 100% con 0 errores TypeScript.

---

### Fase 21: Final Release Package, Remote Publication & CI/CD Verification (v1.8.1) — [IMPLEMENTED / PAGES PENDING]
* [x] Delimitación formal del artefacto estático de publicación (`docs/PUBLIC_RELEASE_TREE.md`).
* [x] Normalización de rutas de activos relativas en `public/index.html` y `public/app.js` para compatibilidad con subrutas GitHub Pages.
* [x] Implementación de fallback sintético de VTO en cliente en `public/app.js` para hosting estático puro sin servidor Node.js.
* [x] Creación del workflow de CI/CD para GitHub Pages `.github/workflows/deploy-public-demo.yml`.
* [x] Creación del script de inventario reproducible de release `scripts/release-inventory.mjs`.
* [x] Sincronización canónica de versiones (`v1.8.1`) en `package.json`, `ROADMAP.md`, `RELEASE_MANIFEST.md` y `PORTFOLIO_PROJECT_CARD.md`.
* [x] Ampliación de la suite `tests/publication-readiness.test.ts` (117 pruebas automatizadas totales).
* [x] Publicación y sincronización en repositorio remoto oficial (`johangonzahenri/tentaciones-ai-commerce`).
* [x] Reparación y verificación de integridad de dependencias (`package-lock.json`), compilación TypeScript y suite completa en CI (Node 24).
* [x] Preparación técnica de despliegue en GitHub Pages (`actions/configure-pages@v5`, `upload-pages-artifact@v4`, `deploy-pages@v4`).
* [x] Conteo exacto de 53 documentos canónicos verificado en disco.

---

### Fase 22: Clientes Nativos Mobile (iOS / Android / Flutter) (v2.0.0) — [PLANIFICADA]
* [ ] Implementación de cliente móvil Flutter consumiendo `ITentacionesExperienceService` vía REST.
* [ ] Probador AR nativo con ARKit (iOS) y ARCore (Android).
* [ ] Notificaciones push contextuales sobre carrito y promociones personalizadas.

---

### Fase 23: Conectividad Empresarial & ERP Sync (v2.1.0) — [BACKLOG]
* [ ] Integración de pasarela de pago real Webpay Plus Transbank / Stripe vía Gateway seguro en `PRIVATE_CONNECTED_DEMO`.
* [ ] Sincronización bidireccional de inventario con catálogos externos (Shopify/WooCommerce).
