# CANONICAL DOCUMENT: VTO EVIDENCE REGISTER & VERIFICATION MATRIX

STATUS: CONTRACT VERIFIED
VERSION: 1.8.0
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Lead Technical Auditor & QA Verification Engineer
LAST VERIFIED DATE: 2026-09-23

---

## 1. RESUMEN Y PROPÃ“SITO

Este documento constituye el **Registro Oficial de Evidencia TÃ©cnica (Evidence Register)** para el motor de **AI Virtual Try-On (VTO)** en **Tentaciones AI Commerce**. Su funciÃ³n es catalogar, auditar y clasificar cada afirmaciÃ³n tÃ©cnica realizada en las fases de desarrollo (Fases 90 a 106), estableciendo su nivel de reproducibilidad real y eliminando cualquier aseveraciÃ³n especulativa o no demostrable.

---

## 2. TAXONOMÃA DE EVIDENCIA

Toda capacidad tÃ©cnica y resultado en este proyecto se clasifica bajo los siguientes estados canÃ³nicos:

* **`VERIFIED`:** Demostrado mediante cÃ³digo fuente, tests automatizados ejecutados en verde y/o inspecciÃ³n estÃ¡tica determinista.
* **`PARTIAL`:** Arquitectura implementada y funcional, con pruebas unitarias de contrato pero sin telemetrÃ­a exhaustiva de producciÃ³n.
* **`NOT MEASURED`:** Requisito de diseÃ±o o target SLA definido pero sin instrumentaciÃ³n de mediciÃ³n cuantitativa en el entorno de testing.
* **`BLOCKED`:** Funcionalidad formalmente diseÃ±ada e integrada en cÃ³digo pero impedida de ejecuciÃ³n real por falta de credenciales externas o hardware.
* **`NOT_APPLICABLE`:** CaracterÃ­stica fuera del alcance del modo operativo actual (`PUBLIC_DEMO`).

---

## 3. MATRIZ MAESTRA DE EVIDENCIA TÃ‰CNICA (EVIDENCE HIERARCHY)

| ID | AfirmaciÃ³n / Capacidad TÃ©cnica | Tipo de Evidencia | Fuente / Artefacto | Reproducibilidad | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EV-01** | Aislamiento estricto de proveedores en `PUBLIC_DEMO` | Test Automatizado | `tests/demo-security.test.ts` (Test 3) | 100% Determinista | **VERIFIED** |
| **EV-02** | ValidaciÃ³n binaria de cabeceras mÃ¡gicas (JPEG, PNG, WebP) | Test Automatizado | `src/domain/vto/vto-image-pipeline.ts` | 100% Determinista | **VERIFIED** |
| **EV-03** | MÃ¡quina de estados de UI con 11 transiciones | CÃ³digo Fuente / DOM | `public/app.js` (`setVTOUIState`) | 100% Determinista | **VERIFIED** |
| **EV-04** | RevocaciÃ³n explÃ­cita de Object URL (`releaseVTOObjectUrl`) | CÃ³digo Fuente / Test | `public/app.js` / `tests/vto-storefront-integration.test.ts` | 100% Determinista | **VERIFIED** |
| **EV-05** | Ausencia cuantitativa de memory leaks en navegador | TelemetrÃ­a / Heap | N/A (Sin instrumentaciÃ³n de heap profiling) | No medido en CI | **NOT MEASURED** |
| **EV-06** | ValidaciÃ³n tÃ©cnica instantÃ¡nea `/api/vto/assess` | Test de IntegraciÃ³n | `tests/vto-storefront-integration.test.ts` (Test 3) | 100% Determinista | **VERIFIED** |
| **EV-07** | Consent Gate con bloqueo fail-closed | Test de IntegraciÃ³n | `tests/vto-storefront-integration.test.ts` (Test 5) | 100% Determinista | **VERIFIED** |
| **EV-08** | Invariante DOM (0 `innerHTML`, `outerHTML`, `eval`, `document.write`) | AuditorÃ­a EstÃ¡tica / Test | `tests/demo-security.test.ts` (Test 22) | 100% Determinista | **VERIFIED** |
| **EV-09** | Enmascaramiento de secretos (`fa_live_*` -> `[REDACTED]`) | Test Automatizado | `tests/vto-storefront-integration.test.ts` (Test 4) | 100% Determinista | **VERIFIED** |
| **EV-10** | Latencia de inferencia en red mÃ³vil 3G/4G | TelemetrÃ­a de Red | N/A (Dependiente de GPU externa FASHN) | No medido en CI | **NOT MEASURED** |
| **EV-11** | Idempotencia y protecciÃ³n contra peticiones concurrentes | Test Automatizado | `tests/vto-execution-gateway.test.ts` (Test 7) | 100% Determinista | **VERIFIED** |
| **EV-12** | CancelaciÃ³n y limpieza de sondeo asÃ­ncrono (`cancel`) | Test Automatizado | `tests/vto-execution-gateway.test.ts` (Test 8) | 100% Determinista | **VERIFIED** |
| **EV-13** | Inferencia Real FASHN AI con credencial activa | Inferencia Externa | `scripts/vto-pilot.mjs real-run` | Bloqueado por ausencia de `FASHN_API_KEY` | **BLOCKED** |
| **EV-14** | Ausencia de almacenamiento persistente (`localStorage`/`sessionStorage`) | BÃºsqueda EstÃ¡tica | Directorio `public/` (0 matches) | 100% Determinista | **VERIFIED** |
| **EV-15** | Protocolo Fail-Closed de EjecuciÃ³n Real de Piloto | VerificaciÃ³n CLI | `scripts/vto-pilot.mjs real-run` (Exit Code 1) | 100% Determinista | **VERIFIED** |
| **EV-16** | Cost Guardrail estricto `numImages === 1` | Test Automatizado | `tests/vto-operational-guardrails.test.ts` (Test 1) | 100% Determinista | **VERIFIED** |
| **EV-17** | Execution Budget ceilings (retries, polling, timeout) | Test Automatizado | `tests/vto-operational-guardrails.test.ts` (Test 2) | 100% Determinista | **VERIFIED** |
| **EV-18** | Concurrencia acotada por sesiÃ³n (`VTO_CONCURRENCY_LIMIT`) | Test Automatizado | `tests/vto-operational-guardrails.test.ts` (Test 4) | 100% Determinista | **VERIFIED** |
| **EV-19** | Provider Circuit Breaker con disparo anti-cascada | Test Automatizado | `tests/vto-operational-guardrails.test.ts` (Test 5) | 100% Determinista | **VERIFIED** |
| **EV-20** | Rate Limiting deslizante por sesiÃ³n / IP | Test Automatizado | `tests/vto-operational-guardrails.test.ts` (Test 6) | 100% Determinista | **VERIFIED** |
| **EV-21** | Logger estructurado con sanitizaciÃ³n garantizada | Test Automatizado | `tests/vto-operational-guardrails.test.ts` (Test 7) | 100% Determinista | **VERIFIED** |
| **EV-22** | SeparaciÃ³n explÃ­cita de mÃ©tricas Demo vs Real | Test Automatizado | `tests/vto-operational-guardrails.test.ts` (Test 8) | 100% Determinista | **VERIFIED** |
| **EV-23** | TransformaciÃ³n de contrato oficial Try-On Max (`product_image`, `resolution: "1k"\|"2k"\|"4k"`, `generation_mode: "fast"`) | Test Automatizado | `tests/fashn-provider-contract.test.ts` (Test 1) | 100% Determinista | **VERIFIED** |
| **EV-24** | Mapeo mandatorio de campos Try-On v1.6 (`garment_image`, `category`, `mode`, `moderation_level`) | Test Automatizado | `tests/fashn-provider-contract.test.ts` (Test 2) | 100% Determinista | **VERIFIED** |
| **EV-25** | SemÃ¡ntica de categorÃ­a en v1.6 (`auto`, omisiÃ³n o mapeo) | Test Automatizado | `tests/fashn-provider-contract.test.ts` (Test 3) | 100% Determinista | **VERIFIED** |
| **EV-26** | Mapeo determinista de estados de sondeo FASHN API | Test Automatizado | `tests/fashn-provider-contract.test.ts` (Test 5) | 100% Determinista | **VERIFIED** |
| **EV-27** | ClasificaciÃ³n de errores estructurados FASHN API | Test Automatizado | `tests/fashn-provider-contract.test.ts` (Test 6) | 100% Determinista | **VERIFIED** |
| **EV-28** | ValidaciÃ³n de whitelist de dominios CDN (`cdn.fashn.ai`, `media.fashn.ai`) | Test Automatizado | `tests/fashn-provider-contract.test.ts` (Test 7) | 100% Determinista | **VERIFIED** |
| **EV-29** | Puerta formal de activaciÃ³n `FashnRealPilotActivationGate` | Test Automatizado | `tests/fashn-provider-contract.test.ts` (Test 8) | 100% Determinista | **VERIFIED** |
| **EV-30** | Manejo de errores HTTP (401, 400, 429, malformed response) | Test Automatizado | `tests/fashn-provider-contract.test.ts` (Test 10) | 100% Determinista | **VERIFIED** |
| **EV-31** | Final Conformance: `resolution = "1k"\|"2k"\|"4k"` y matriz de costes combinada | InspecciÃ³n de Tipos / Tests | `src/adapter/vto/fashn-vto-provider.ts` | 100% Determinista | **VERIFIED** |
| **EV-32** | Smoke Test Profile (`FASHN_FIRST_REAL_SMOKE_TEST`: `tryon-max`, `fast`, `1k`, `num_images=1`, `return_base64=true`) | Script CLI / Tests | `scripts/vto-pilot.mjs` / `tests/fashn-provider-contract.test.ts` | 100% Determinista | **VERIFIED** |
| **EV-33** | Storefront Demo E2E Certification & Separation Invariant (`REAL â‰  DEMO`) | Test Automatizado / Release Checklist | `tests/vto-demo-e2e.test.ts` (Tests 1-8) | 100% Determinista | **VERIFIED** |
| **EV-34** | Public Demo Release Candidate Policy & Boundary Verification | Test Automatizado / Health Check | `tests/public-demo-release.test.ts` / `scripts/release-check.mjs` | 100% Determinista | **VERIFIED** |

---

## 4. REGISTRO DE CLAIMS CORREGIDOS Y ACLARACIONES TÃ‰CNICAS (PHASE 106)

1. **Release Candidate PÃºblico Certificado:** Se consolida el entorno `PUBLIC_DEMO` como demostraciÃ³n comercial y tÃ©cnica 100% autÃ³noma, sin dependencias externas obligatorias ni fugas de secretos.
2. **LÃ­mites Operacionales ExplÃ­citos:** Se define formalmente la polÃ­tica en `src/config/demo-release-policy.ts` distinguiendo quÃ© capacidades corresponden a demostraciÃ³n sintÃ©tica y cuÃ¡les a inferencia privada conectada.
3. **Invariante de SeparaciÃ³n Real:** La inferencia real FASHN permanece en estado `BLOCKED (FAIL-CLOSED)` y no bloquea ni degrada la experiencia pÃºblica de demostraciÃ³n.
4. **AuditorÃ­a de Salud de Release:** El script `scripts/release-check.mjs` certifica la integridad de archivos, ausencia de credenciales pÃºblicas y consistencia documental.
