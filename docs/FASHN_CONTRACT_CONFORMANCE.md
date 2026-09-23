# CANONICAL DOCUMENT: FASHN CONTRACT CONFORMANCE MATRIX

STATUS: CONTRACT VERIFIED
VERSION: 1.7.5
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Lead Integration & External API Contract Engineer
LAST VERIFIED DATE: 2026-09-23

---

## 1. RESUMEN DE CONFORMIDAD

La presente matriz de conformidad desglosa cada parÃ¡metro y comportamiento de la API oficial de **FASHN AI v1** contra la implementaciÃ³n en el adaptador [`FashnVirtualTryOnProvider`](file:///C:/Users/Johan/OneDrive/Documentos/IA_Work/projects/tentaciones-ai-commerce/src/adapter/vto/fashn-vto-provider.ts) y la suite de pruebas [`tests/fashn-provider-contract.test.ts`](file:///C:/Users/Johan/OneDrive/Documentos/IA_Work/projects/tentaciones-ai-commerce/tests/fashn-provider-contract.test.ts).

---

## 2. MATRIZ MAESTRA DE CONFORMIDAD CONTRACTUAL

| Elemento Contractual | EspecificaciÃ³n Oficial FASHN | ImplementaciÃ³n en Adapter | Cobertura en Tests | Estado Contractual | Estado Live | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Max: model_image** | String (URL / Base64 Data-URI) | `inputs.model_image` (sanitizado) | `Contract 1` | **VERIFIED** | `BLOCKED` | `tests/fashn-provider-contract.test.ts` |
| **Max: product_image** | String (URL / Base64 Data-URI) | `inputs.product_image` | `Contract 1` | **VERIFIED** | `BLOCKED` | `tests/fashn-provider-contract.test.ts` |
| **Max: resolution** | `"1k"` \| `"2k"` \| `"4k"` | `resolution?: "1k"\|"2k"\|"4k"` | `Contract 1` | **VERIFIED** | `BLOCKED` | Tipado y test positivo/negativo |
| **Max: generation_mode**| `"fast"` \| `"balanced"` \| `"quality"` | `generation_mode?: "fast"\|"balanced"\|"quality"` | `Contract 1` | **VERIFIED** | `BLOCKED` | Configurable, default `"quality"` |
| **Max: num_images** | Rango `1..4` (Default: 1) | Pilot Policy: exactamente `1` | `Contract 1`, `Contract 8` | **VERIFIED** | `BLOCKED` | Cost guardrail y payload |
| **Max: output_format** | `"png"` \| `"jpeg"` (Default: `"png"`) | `output_format: "png"\|"jpeg"` | `Contract 1` | **VERIFIED** | `BLOCKED` | Default `"png"` |
| **Max: return_base64** | Boolean (Default: `false`) | Configurado en `true` para efimeridad | `Contract 1` | **VERIFIED** | `BLOCKED` | Payload verificado |
| **Max: ExclusiÃ³n v1.6** | No admite `garment_image`, `category`, `mode`, etc. | Propiedades omitidas estrictamente | `Contract 1` (Negativo) | **VERIFIED** | `BLOCKED` | `assert.equal(inputs.garment_image, undefined)` |
| **v1.6: model_image** | String (URL / Base64 Data-URI) | `inputs.model_image` | `Contract 2` | **VERIFIED** | `BLOCKED` | `tests/fashn-provider-contract.test.ts` |
| **v1.6: garment_image**| String (URL / Base64 Data-URI) | `inputs.garment_image` | `Contract 2` | **VERIFIED** | `BLOCKED` | `tests/fashn-provider-contract.test.ts` |
| **v1.6: category** | `"auto"` \| `"tops"` \| `"bottoms"` \| `"one-pieces"` (Opcional) | Mapeado automÃ¡tico o configurable | `Contract 2`, `Contract 3` | **VERIFIED** | `BLOCKED` | Soporta `"auto"`, omisiÃ³n y mapeo |
| **v1.6: mode** | `"performance"` \| `"balanced"` \| `"quality"` | `mode?: "performance"\|"balanced"\|"quality"` | `Contract 2` | **VERIFIED** | `BLOCKED` | Default `"balanced"` |
| **v1.6: moderation_level**| `"none"` \| `"permissive"` \| `"conservative"` | `moderation_level?: "none"\|"permissive"\|"conservative"` | `Contract 2` | **VERIFIED** | `BLOCKED` | Default `"conservative"` en piloto |
| **v1.6: garment_photo_type**| `"auto"` \| `"flat-lay"` \| `"model"` | `garment_photo_type?: "auto"\|"flat-lay"\|"model"` | `Contract 2` | **VERIFIED** | `BLOCKED` | Soporta todos los valores oficiales |
| **v1.6: segmentation_free**| Boolean | `segmentation_free?: boolean` | `Contract 2` | **VERIFIED** | `BLOCKED` | Booleano opcional |
| **v1.6: num_samples** | Rango `1..4` (Default: 1) | Pilot Policy: exactamente `1` | `Contract 2`, `Contract 8` | **VERIFIED** | `BLOCKED` | Cost guardrail |
| **v1.6: ExclusiÃ³n Max** | No admite `product_image`, `generation_mode`, etc. | Propiedades omitidas estrictamente | `Contract 2` (Negativo) | **VERIFIED** | `BLOCKED` | `assert.equal(inputs.product_image, undefined)` |
| **Endpoint: /v1/run** | POST con Bearer Token, retorna `{id, status}` | Implementado en `startTryOn` | `Contract 4` | **VERIFIED** | `BLOCKED` | Mocks HTTP 200 y validaciÃ³n |
| **Endpoint: /v1/status**| GET con Bearer Token, polling acotado | Implementado en `getStatus` | `Contract 5` | **VERIFIED** | `BLOCKED` | Mapeo de estados 20%, 35%, 75%, 100% |
| **Error Handling** | ClasificaciÃ³n HTTP y excepciones FASHN | `classifyFashnError` y HTTP error checks | `Contract 6`, `Contract 10` | **VERIFIED** | `BLOCKED` | 401, 400, 429, 500, ModerationError |
| **Output Whitelist** | CDN FASHN (`cdn.fashn.ai`, `media.fashn.ai`) | `FASHN_ALLOWED_OUTPUT_DOMAINS` | `Contract 7` | **VERIFIED** | `BLOCKED` | Acepta CDN/Base64, rechaza dominios maliciosos |
| **Remote Cancel** | No verificado oficialmente | Reclasificado a Local-Only | `VTO Gateway Test 8` | **NOT VERIFIED** | `NOT APPLICABLE` | Marcado explÃ­citamente como local |
| **Live Inference** | Inferencia en vivo con GPU FASHN | `scripts/vto-pilot.mjs real-run` | Preflight check | **READY IN CODE** | **BLOCKED** | Credencial ausente, fail-closed activo |

---

## 3. LEYENDA DE ESTADOS

* **`VERIFIED`**: EspecificaciÃ³n contractual respaldada por tipos TypeScript, cÃ³digo de adaptador y pruebas unitarias passing.
* **`PARTIAL`**: Funcionalidad implementada pero con supuestos operativos documentados.
* **`NOT VERIFIED`**: Comportamiento no documentado oficialmente en la API pÃºblica de FASHN (e.g. cancelaciÃ³n remota).
* **`BLOCKED`**: Capacidad lista en arquitectura pero bloqueada de ejecuciÃ³n real por falta de credenciales de producciÃ³n.
* **`UNSUPPORTED`**: ParÃ¡metros obsoletos o no soportados por el proveedor.
