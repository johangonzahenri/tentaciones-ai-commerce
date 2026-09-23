# CANONICAL DOCUMENT: FASHN AI PROVIDER CONTRACT & ADAPTER SPECIFICATION

STATUS: CONTRACT VERIFIED
VERSION: 1.7.2
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Lead External API Contract & Integration Engineer
LAST VERIFIED DATE: 2026-09-23

---

## 1. RESUMEN EJECUTIVO Y ESTADO DE CONFORMIDAD (PHASE 102)

El presente documento constituye la **especificaciÃ³n final de conformidad del contrato externo de FASHN AI Virtual Try-On API (v1)** para **Tentaciones AI Commerce**.

Se establecen las distinciones inequÃ­vocas entre:
```text
DOCUMENTATION VERIFIED  (EspecificaciÃ³n oficial FASHN 2026 auditada y formalizada)
          â‰
CONTRACT TEST VERIFIED  (Suite de 97+ pruebas automatizadas con tipado TypeScript estricto)
          â‰
LIVE PROVIDER VERIFIED  (Inferencia real con crÃ©dito consumido â€” BLOQUEADO / NO EJECUTADO)
```

```text
ADAPTER STATUS:          FINAL CONTRACT CONFORMANCE (v1.7.2)
API BASE URL:            https://api.fashn.ai/v1
AUTH SCHEME:             Bearer Token (fa_live_* / fa_test_*)
ACTIVE MODELS:           tryon-max (Flagship), tryon-v1.6 (Standard)
REMOTE CANCELLATION:     NOT OFFICIALLY VERIFIED (Local Lifecycle Management Only)
ACTIVATION GATE:         FashnRealPilotActivationGate (Fail-Closed)
REAL PILOT STATUS:       BLOCKED (FASHN_API_KEY absent / Fail-Closed)
```

---

## 2. REFERENCIAS OFICIALES Y FUENTE DE VERDAD EXTERNA

| SecciÃ³n Documental | URL Oficial | Fecha VerificaciÃ³n | Mapeo en Proyecto |
| :--- | :--- | :--- | :--- |
| **API Fundamentals** | [https://docs.fashn.ai/api-reference/try-on/run-try-on](https://docs.fashn.ai/api-reference/try-on/run-try-on) | 2026-09-23 | Endpoints `/v1/run`, headers `Authorization: Bearer <key>`. |
| **Try-On Max Model** | [https://docs.fashn.ai/models/tryon-max](https://docs.fashn.ai/models/tryon-max) | 2026-09-23 | `product_image`, `resolution: "1k"\|"2k"\|"4k"`, `generation_mode: "fast"\|"balanced"\|"quality"`, `num_images: 1..4`. |
| **Try-On v1.6 Model** | [https://docs.fashn.ai/models/tryon-v1.6](https://docs.fashn.ai/models/tryon-v1.6) | 2026-09-23 | `garment_image`, `category: "auto"\|"tops"\|...`, `moderation_level: "none"\|"permissive"\|"conservative"`, `mode`, `num_samples: 1..4`. |
| **Status Polling** | [https://docs.fashn.ai/api-reference/try-on/get-try-on-status](https://docs.fashn.ai/api-reference/try-on/get-try-on-status) | 2026-09-23 | Estados: `starting`, `in_queue`, `processing`, `completed`, `failed`. |
| **Error Handling** | [https://docs.fashn.ai/errors](https://docs.fashn.ai/errors) | 2026-09-23 | ClasificaciÃ³n: `ImageLoadError`, `PoseError`, `ContentModerationError`, etc. |
| **Privacy & Data Retention** | [https://docs.fashn.ai/privacy-and-data-retention](https://docs.fashn.ai/privacy-and-data-retention) | 2026-09-23 | Disponibilidad CDN (3 dÃ­as) vs status Base64 (60 min). |

---

## 3. ESPECIFICACIÃ“N DETALLADA DE MODELOS

### 3.1 Try-On Max (`model_name: "tryon-max"`) â€” Modelo Insignia de Alta Fidelidad

* **Required Inputs**:
  * `model_image`: String (URL pÃºblica o Data-URI Base64) â€” FotografÃ­a de la persona.
  * `product_image`: String (URL pÃºblica o Data-URI Base64) â€” FotografÃ­a de la prenda individual.
* **Optional Inputs & Allowed Values**:
  * `prompt`: String (opcional) â€” Instrucciones contextuales de drapeado.
  * `resolution`: `"1k"` | `"2k"` | `"4k"` â€” Niveles de resoluciÃ³n soportados por el pipeline neuronal.
  * `generation_mode`: `"fast"` | `"balanced"` | `"quality"` â€” Balance de pasos de difusiÃ³n neuronal.
  * `seed`: Number (entero opcional) â€” Semilla para reproducibilidad estocÃ¡stica.
  * `num_images`: Number (Rango del provider: `1..4`) â€” Cantidad de variantes generadas.
  * `output_format`: `"png"` | `"jpeg"`.
  * `return_base64`: Boolean â€” Retorna la imagen codificada en base64 en el objeto de salida.
* **Defaults Documentados del Provider**:
  * `resolution`: `"1k"`.
  * `generation_mode`: `"balanced"`.
  * `num_images`: `1`.
  * `output_format`: `"png"`.
  * `return_base64`: `false`.
* **ConfiguraciÃ³n del Proyecto (FASHN_FIRST_REAL_SMOKE_TEST Profile)**:
  * `num_images`: **Exactamente 1** (PolÃ­tica estricta de control de costes).
  * `generation_mode`: `"fast"` (MÃ­nimo coste documentado de inferencia para smoke test tÃ©cnico).
  * `resolution`: `"1k"` (Tier base conservador).
  * `return_base64`: `true` (Para transferencia efÃ­mera en memoria y evitar URL pÃºblica externa).
  * `output_format`: `"png"`.
* **Reglas de Aislamiento Negativo**:
  * âŒ NO enviar `garment_image`, `category`, `num_samples`, `mode`, `moderation_level`, `garment_photo_type`, ni `segmentation_free`.

---

### 3.2 Try-On v1.6 (`model_name: "tryon-v1.6"`) â€” Modelo EstÃ¡ndar

* **Required Inputs**:
  * `model_image`: String (URL o Data-URI Base64).
  * `garment_image`: String (URL o Data-URI Base64).
* **Optional Inputs & Allowed Values**:
  * `category`: `"auto"` | `"tops"` | `"bottoms"` | `"one-pieces"` â€” TaxonomÃ­a de prenda. Puede omitirse o asignarse a `"auto"`.
  * `mode`: `"performance"` | `"balanced"` | `"quality"` â€” Modo de procesamiento v1.6.
  * `segmentation_free`: Boolean â€” Omite el enmascarado explÃ­cito de prenda si es `true`.
  * `moderation_level`: `"none"` | `"permissive"` | `"conservative"`.
  * `garment_photo_type`: `"auto"` | `"flat-lay"` | `"model"`.
  * `seed`: Number.
  * `num_samples`: Number (Rango del provider: `1..4`).
  * `output_format`: `"png"` | `"jpeg"`.
  * `return_base64`: Boolean.
* **Defaults Documentados del Provider**:
  * `category`: `"auto"`.
  * `mode`: `"balanced"`.
  * `moderation_level`: `"conservative"`.
  * `garment_photo_type`: `"auto"`.
  * `num_samples`: `1`.
  * `return_base64`: `false`.
* **ConfiguraciÃ³n del Proyecto (Tentaciones Pilot Policy)**:
  * `num_samples`: **Exactamente 1**.
  * `mode`: `"balanced"`.
  * `category`: Mapeado automÃ¡ticamente desde catÃ¡logo (`tops`, `bottoms`, `one-pieces`) o fallback a `"auto"`.
  * `return_base64`: `true`.
* **Reglas de Aislamiento Negativo**:
  * âŒ NO enviar `product_image`, `num_images`, `generation_mode`, ni `resolution`.

---

## 4. MODELO DE COSTES Y PERFIL DE PILOTO

El coste de inferencia en FASHN AI varÃ­a en funciÃ³n de la combinaciÃ³n de parÃ¡metros seleccionados. No se debe generalizar como "1 crÃ©dito fijo".

| Modelo | CombinaciÃ³n de ParÃ¡metros | Rango Provider | SelecciÃ³n Piloto Tentaciones (`FASHN_FIRST_REAL_SMOKE_TEST`) | Coste Documentado Provider | PolÃ­tica Piloto |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Try-On Max** | `generation_mode: fast`, `resolution: 1k`, `num_images: 1` | `1..4` imÃ¡genes, `fast` a `quality`, `1k` a `4k` | **`fast + 1k + 1 img`** | **MÃ­nimo coste documentado** | **Perfil congelado para smoke test tÃ©cnico**. |
| **Try-On Max** | `generation_mode: quality`, `resolution: 1k`, `num_images: 1` | `1..4` imÃ¡genes, `fast` a `quality`, `1k` a `4k` | *No seleccionado en smoke test* | Coste superior a modo fast | Alternativa futura para producciÃ³n. |
| **Try-On Max** | `generation_mode: quality`, `resolution: 4k`, `num_images: 4` | ConfiguraciÃ³n mÃ¡xima | *No seleccionada* | MÃ¡ximo tier de crÃ©ditos | **Prohibido en piloto** (Cost Guardrail). |
| **Try-On v1.6**| `mode: balanced`, `num_samples: 1` | `1..4` muestras, `performance` a `quality` | *No ejecutado en smoke test* | 1 crÃ©dito estÃ¡ndar v1.6 | Alternativa secundaria futura. |

---

## 5. LÃMITES TÃ‰CNICOS: VALIDACIÃ“N LOCAL VS PROVEEDOR

| DimensiÃ³n | LÃ­mite ValidaciÃ³n Local Tentaciones | LÃ­mite TÃ©cnico Documentado Provider (FASHN) | LÃ­mite Efectivo en Piloto |
| :--- | :--- | :--- | :--- |
| **TamaÃ±o MÃ¡ximo Archivo** | `10 MB` (Hard limit en `vto-guardrails.ts`) | `30 MB` (LÃ­mite de payload HTTP en FASHN) | **`10 MB`** (MÃ¡s restrictivo) |
| **ResoluciÃ³n MÃ¡xima Imagen**| `16 MegapÃ­xeles` (e.g. 4096 x 4096 px) | Sin lÃ­mite estricto publicado (Downscaled internamente) | **`16 MP`** |
| **ResoluciÃ³n MÃ­nima** | `384 x 512 px` (Aspecto retrato mÃ­nimo) | `256 x 256 px` | **`384 x 512 px`** |
| **Formatos Soportados** | `image/jpeg`, `image/png`, `image/webp` | JPEG, PNG, WebP | **JPEG, PNG, WebP** |

---

## 6. MAPEO DE ESTADOS Y OBSERVABILIDAD

| Estado FASHN Oficial | Estado Interno VTO | Progreso Reportado | Mensaje de Etapa |
| :--- | :--- | :--- | :--- |
| `starting` | `SUBMITTING` | 20% | "Iniciando contenedor de inferencia en FASHN AI..." |
| `in_queue` | `SUBMITTING` | 35% | "Tarea encolada en FASHN AI..." |
| `processing` | `PROCESSING` | 75% | "Generando drapeado neuronal con FASHN AI..." |
| `completed` | `RESULT_READY` | 100% | "Prueba virtual completada por FASHN AI." |
| `failed` | `FAILED` | 0% | "Error en el procesamiento de imagen en FASHN AI." |

> [!NOTE]
> El estado `cancelled` no es un estado documentado de respuesta del provider. La cancelaciÃ³n en el proyecto se maneja como estado interno **`LOCAL_CANCELLED`** abortando el sondeo y limpiando el tracking.

---

## 7. SEMÃNTICA DE CANCELACIÃ“N: LOCAL VS REMOTA

* **CancelaciÃ³n Remota (`POST /v1/cancel`)**: **`NOT OFFICIALLY VERIFIED`**. No existe endpoint oficial documentado en la API pÃºblica de FASHN v1.
* **CancelaciÃ³n Local (`LOCAL CANCEL`)**: **`VERIFIED`**.
  * Aborta inmediatamente el fetch activo (`AbortController.abort()`).
  * Detiene el sondeo asÃ­ncrono.
  * Descarta cualquier resultado tardÃ­o que arribe fuera de tiempo (`VTO_STALE_EXECUTION`).
  * Libera recursos y remueve metadatos en memoria (`jobMetadata.delete(jobId)`).

---

## 8. DISPONIBILIDAD DE SALIDAS Y POLÃTICA DE PRIVACIDAD EXTERNA

Es mandatorio distinguir entre la retenciÃ³n local de la aplicaciÃ³n y las polÃ­ticas de retenciÃ³n del proveedor externo:

1. **RetenciÃ³n Local (Tentaciones AI Commerce)**:
   * `0 bytes` de imÃ¡genes almacenadas en el disco del servidor.
   * Procesamiento efÃ­mero en memoria RAM durante el ciclo de vida del request.
   * DestrucciÃ³n explÃ­cita de Object URLs en cliente (`URL.revokeObjectURL`).
2. **Disponibilidad y RetenciÃ³n en Proveedor (FASHN AI)**:
   * **Salidas CDN (`https://cdn.fashn.ai/*`, `https://media.fashn.ai/*`)**: Las URLs generadas por FASHN permanecen disponibles temporalmente (expiraciÃ³n programada tras **3 dÃ­as** segÃºn la documentaciÃ³n de retenciÃ³n de FASHN).
   * **Transporte Base64 (`return_base64 = true`)**: El resultado estÃ¡ disponible para consulta a travÃ©s del endpoint de status durante un mÃ¡ximo de **60 minutos**.
   * **Metadatos e Historial de Peticiones**: FASHN retiene los identificadores de predicciÃ³n (`prediction_id`), timestamps y metadatos de uso para fines de facturaciÃ³n y auditorÃ­a.

---

## 9. HISTORIAL DE AUDITORÃAS Y CONTROL DE CAMBIOS

| Fecha | Fase | Cambio / CorrecciÃ³n | Estado |
| :--- | :--- | :--- | :--- |
| **2026-09-21** | Fase 94 | ImplementaciÃ³n de `VTOExecutionGateway`. | Prototipo |
| **2026-09-22** | Fase 99 | AuditorÃ­a inicial y congelamiento. | Auditado |
| **2026-09-23** | Fase 100 | SeparaciÃ³n de payloads Try-On Max vs v1.6. | Remediado |
| **2026-09-23** | Fase 101 | Conformidad V2: CorrecciÃ³n de enums y categorÃ­as opcionales. | Contract Verified |
| **2026-09-23** | Fase 102 | **Final Conformance & Cost Profile**: CorrecciÃ³n de `resolution` a `"1k"\|"2k"\|"4k"`, matriz de costes combinada, distinciÃ³n entre lÃ­mites locales y de proveedor, especificaciÃ³n exacta de disponibilidad CDN (3 dÃ­as) vs Base64 (60 min) y preflight estricto para piloto en vivo. | **CONTRACT VERIFIED** |
