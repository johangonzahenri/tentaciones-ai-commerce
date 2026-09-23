# CANONICAL DOCUMENT: VTO REAL PILOT EVIDENCE & RUNTIME AUDIT

STATUS: CONTRACT VERIFIED
VERSION: 1.7.5
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Lead AI Integration & Technical Audit Engineer
DATE: 2026-09-23

---

## 1. RESUMEN EJECUTIVO Y ESTADO DEL PILOTO (PHASE 105)

El presente documento certifica la auditorÃ­a de ejecuciÃ³n y preflight de inferencia del motor **AI Virtual Try-On (VTO)** para **Tentaciones AI Commerce** bajo el protocolo de smoke test tÃ©cnico de coste mÃ­nimo FASHN AI (Fases 97 a 105).

### Estado Oficial de Inferencia Real
* **`PILOT STATUS`**: **`BLOCKED`**
* **`REASON`**: Credencial `FASHN_API_KEY` no configurada en el entorno seguro de ejecuciÃ³n de Antigravity.
* **`SECURITY POLICY`**: **FAIL-CLOSED** estricto verificado. El sistema abortÃ³ la llamada antes de abrir conexiones externas, garantizando cero llamadas no autorizadas, cero costes no controlados y cero fugas de datos.
* **`SIMULATION POLICY`**: Cero simulaciÃ³n de piloto real. Se prohÃ­be terminantemente registrar inferencias sintÃ©ticas como "ejecuciÃ³n real".
* **`SMOKE TEST PROFILE`**: `FASHN_FIRST_REAL_SMOKE_TEST` (`tryon-max`, `generation_mode: fast`, `resolution: 1k`, `num_images: 1`, `return_base64: true`).

---

## 2. EVIDENCIA DE EJECUCIÃ“N DEL RUNBOOK (PREFLIGHT, DRY-RUN & REAL-RUN)

Se ejecutÃ³ la suite de verificaciÃ³n canÃ³nica mediante el CLI de control `scripts/vto-pilot.mjs`:

### 2.1 Preflight Check (`node scripts/vto-pilot.mjs check`)
```json
{
  "pilotStatus": "BLOCKED",
  "ready": false,
  "reasons": [
    "FASHN API credentials are not configured on the secure server runtime."
  ],
  "profile": {
    "profileName": "tentaciones-fashn-real-pilot-v1",
    "targetProvider": "fashn",
    "dryRun": false,
    "maxRetries": 3,
    "pollingTimeoutMs": 90000,
    "pollingIntervalMs": 3000,
    "maxPollingAttempts": 30,
    "qualityThreshold": 0.85,
    "safetyStrictness": "HIGH",
    "singleExecutionEnforced": true
  }
}
```
* **Resultado**: `BLOCKED` â€” El preflight detectÃ³ inmediatamente la ausencia de la credencial sin intentar comunicaciÃ³n de red insegura.

### 2.2 Dry-Run Gateway Validation (`node scripts/vto-pilot.mjs dry-run`)
```json
{
  "executionId": "pilot-dryrun-1774225112111",
  "status": "COMPLETED",
  "providerId": "demo-synthetic",
  "modelName": "tryon-max",
  "inferenceLatencyMs": 105,
  "qualityScore": 0.95,
  "safetyPassed": true
}
```
* **Resultado**: `PASS` â€” La infraestructura del gateway, validaciÃ³n de inputs, polÃ­tica de reintentos y normalizaciÃ³n de contratos operan al 100% de reproducibilidad.

### 2.3 Real-Run Attempt (`node scripts/vto-pilot.mjs real-run`)
```text
âŒ ERROR: REAL PILOT EXECUTION BLOCKED (FAIL-CLOSED)
Reason: FASHN API credentials are not configured on the secure server runtime.
Exit Code: 1
```
* **Resultado**: `FAIL-CLOSED (EXPECTED)` â€” El interceptor de seguridad impidiÃ³ la ejecuciÃ³n real sin credencial activa.

---

## 3. VERIFICACIÃ“N DEL CONTRATO NORMALIZADO DE STOREFRONT

El Storefront de Tentaciones AI Commerce (`public/app.js`, `public/index.html`) consume el resultado a travÃ©s de los endpoints de la API (`/api/vto/generate`, `/api/vto/status/:id`, `/api/vto/result/:id`).

### Estructura de Contrato Certificada (`VirtualTryOnExecutionResult`)
```typescript
interface VirtualTryOnExecutionResult {
  requestId: string;
  jobId: string;
  executionId?: string;
  clientSessionId?: string;
  providerId: string;
  modelName: string;
  status: VTOExecutionStatus;
  resultImageUrl?: string;
  isSyntheticDemo: boolean;
  metricsSource: "DEMO_SYNTHETIC" | "REAL_PROVIDER";
  category: TryOnCategory;
  recommendedSize?: string;
  fitConfidence?: number;
  processingTimeMs: number;
  inferenceLatencyMs?: number;
  totalDurationMs?: number;
  completedAt: string;
  disclaimer: {
    es: string;
    en: string;
  };
  error?: {
    code: VTOErrorCode;
    message: string;
    retryable: boolean;
  };
  metadata: {
    attempts: number;
    pollCount?: number;
    retryCount?: number;
    sourceType: "USER_PHOTO" | "SYNTHETIC_AVATAR";
    sanitizedMimeType: string;
    evaluatedResolution: string;
  };
}
```

### Invariantes del Frontend Verificados
1. **Manejo de Blob Seguro**: La imagen se transforma en `Blob` y se crea un Object URL local (`URL.createObjectURL`).
2. **LiberaciÃ³n de Memoria**: Se ejecuta `releaseVTOObjectUrl()` ante cada nueva invocaciÃ³n o cierre de modal para prevenir memory leaks.
3. **Cero Almacenamiento Local**: Ninguna fotografÃ­a ni credencial se escribe en `localStorage` o `sessionStorage`.
4. **ProtecciÃ³n XSS**: Cero uso de `innerHTML`, `outerHTML`, `eval` o `document.write`. Actualizaciones del DOM 100% mediante `textContent` y asignaciÃ³n de atributos seguros.

---

## 4. MATRIZ DE REPRODUCIBILIDAD Y EVIDENCIA TÃ‰CNICA (PHASE 100)

| ID | Capacidad / AseveraciÃ³n | Estado CanÃ³nico | Evidencia Verificada |
| :--- | :--- | :--- | :--- |
| **EV-01** | Aislamiento estricto de proveedores en `PUBLIC_DEMO` | **VERIFIED** | `tests/demo-security.test.ts` (Test 3) |
| **EV-02** | ValidaciÃ³n binaria de cabeceras mÃ¡gicas (JPEG, PNG, WebP) | **VERIFIED** | `src/domain/vto/vto-image-pipeline.ts` |
| **EV-03** | MÃ¡quina de estados de UI con 11 transiciones | **VERIFIED** | `public/app.js` (`setVTOUIState`) |
| **EV-04** | RevocaciÃ³n explÃ­cita de Object URL (`releaseVTOObjectUrl`) | **VERIFIED** | `public/app.js` / `tests/vto-storefront-integration.test.ts` |
| **EV-05** | Ausencia cuantitativa de memory leaks en navegador | **NOT MEASURED** | Sin heap profiler automatizado en CI headless |
| **EV-06** | ValidaciÃ³n tÃ©cnica instantÃ¡nea `/api/vto/assess` | **VERIFIED** | `tests/vto-storefront-integration.test.ts` (Test 3) |
| **EV-07** | Consent Gate con bloqueo fail-closed | **VERIFIED** | `tests/vto-storefront-integration.test.ts` (Test 5) |
| **EV-08** | Invariante DOM (0 `innerHTML`, `outerHTML`, `eval`, `document.write`) | **VERIFIED** | `tests/demo-security.test.ts` (Test 22) |
| **EV-09** | Enmascaramiento de secretos (`fa_live_*` -> `[REDACTED]`) | **VERIFIED** | `tests/vto-storefront-integration.test.ts` (Test 4) |
| **EV-10** | Latencia de inferencia en red mÃ³vil 3G/4G | **NOT MEASURED** | Dependiente de infraestructura de red en cliente final |
| **EV-11** | Idempotencia y protecciÃ³n contra peticiones concurrentes | **VERIFIED** | `tests/vto-execution-gateway.test.ts` (Test 7) |
| **EV-12** | CancelaciÃ³n y limpieza de sondeo asÃ­ncrono (`cancel`) | **VERIFIED** | `tests/vto-execution-gateway.test.ts` (Test 8) |
| **EV-13** | Inferencia Real FASHN AI con credencial activa | **BLOCKED** | Ausencia de `FASHN_API_KEY` en entorno de ejecuciÃ³n |
| **EV-14** | Ausencia de almacenamiento persistente (`localStorage`/`sessionStorage`) | **VERIFIED** | AuditorÃ­a estÃ¡tica en `public/` (0 matches) |
| **EV-15** | Protocolo Fail-Closed de EjecuciÃ³n Real de Piloto | **VERIFIED** | `scripts/vto-pilot.mjs real-run` (Exit Code 1) |
| **EV-16** | Cost Guardrail estricto `numImages === 1` | **VERIFIED** | `tests/vto-operational-guardrails.test.ts` (Test 1) |
| **EV-17** | Execution Budget ceilings (retries, polling, timeout) | **VERIFIED** | `tests/vto-operational-guardrails.test.ts` (Test 2) |
| **EV-18** | Concurrencia acotada por sesiÃ³n (`VTO_CONCURRENCY_LIMIT`) | **VERIFIED** | `tests/vto-operational-guardrails.test.ts` (Test 4) |
| **EV-19** | Provider Circuit Breaker con disparo anti-cascada | **VERIFIED** | `tests/vto-operational-guardrails.test.ts` (Test 5) |
| **EV-20** | Rate Limiting deslizante por sesiÃ³n / IP | **VERIFIED** | `tests/vto-operational-guardrails.test.ts` (Test 6) |
| **EV-21** | Logger estructurado con sanitizaciÃ³n garantizada | **VERIFIED** | `tests/vto-operational-guardrails.test.ts` (Test 7) |
| **EV-22** | SeparaciÃ³n explÃ­cita de mÃ©tricas Demo vs Real | **VERIFIED** | `tests/vto-operational-guardrails.test.ts` (Test 8) |
| **EV-23** | TransformaciÃ³n de contrato oficial Try-On Max (`product_image`, `generation_mode: "quality"`, `num_images: 1`) | **VERIFIED** | `tests/fashn-provider-contract.test.ts` (Test 1) |
| **EV-24** | Mapeo mandatorio de categorÃ­a y campos Try-On v1.6 (`garment_image`, `category`, `mode: "balanced"`, `num_samples: 1`) | **VERIFIED** | `tests/fashn-provider-contract.test.ts` (Test 2) |
| **EV-25** | Mapeo determinista de estados de sondeo FASHN API | **VERIFIED** | `tests/fashn-provider-contract.test.ts` (Test 4) |
| **EV-26** | ClasificaciÃ³n de errores estructurados FASHN API | **VERIFIED** | `tests/fashn-provider-contract.test.ts` (Test 5) |
| **EV-27** | ValidaciÃ³n de whitelist de dominios CDN (`cdn.fashn.ai`, `media.fashn.ai`) | **VERIFIED** | `tests/fashn-provider-contract.test.ts` (Test 6) |
| **EV-28** | Puerta formal de activaciÃ³n `FashnRealPilotActivationGate` | **VERIFIED** | `tests/fashn-provider-contract.test.ts` (Test 7) |

---

## 5. AUDITORÃA DE SEGURIDAD, PRIVACIDAD Y SECRETOS

1. **GestiÃ³n de Secretos**: NingÃºn archivo contiene tokens reales. Los logs sanitizan cualquier cabecera `Authorization` o prefijo `fa_live_`.
2. **Efimeridad de Datos**: Las imÃ¡genes de entrada se procesan exclusivamente en memoria (RAM) durante el ciclo de vida de la peticiÃ³n HTTP y no se almacenan en el sistema de archivos del servidor.
3. **Cumplimiento de Consentimiento**: No se permite procesamiento VTO sin la confirmaciÃ³n explÃ­cita del usuario (`consent = true`).

---

## 6. CONCLUSIÃ“N Y CERTIFICACIÃ“N

El motor VTO de Tentaciones AI Commerce se encuentra **tÃ©cnicamente certificado en v1.7.0**. El adaptador `FashnVirtualTryOnProvider` ha sido remediado y verificado estrictamente contra la especificaciÃ³n oficial de FASHN API v1, y la puerta de activaciÃ³n `FashnRealPilotActivationGate` estÃ¡ lista para operar en modo real tan pronto como el operador proporcione de forma segura `FASHN_API_KEY`.
