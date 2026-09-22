# TENTACIONES AI COMMERCE — VIRTUAL TRY-ON API INTEGRATION & PROTOCOL SPECIFICATION

============================================================
CANONICAL DOCUMENT: docs/VTO_API_INTEGRATION.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: API PROTOCOL & BACKEND SPECIFICATION
CORRESPONDING CODE CONTRACT: vto-contract.ts / server.ts
============================================================

## 1. Resumen de Endpoints REST del Backend

El backend de *Tentaciones AI Commerce* expone 5 endpoints REST dedicados a la orquestación del probador virtual:

```text
POST /api/vto/validate      ──► Valida compatibilidad de prenda e inputs
POST /api/vto/generate      ──► Inicia trabajo de inferencia (asíncrono)
GET  /api/vto/status/:id    ──► Consulta progreso y estado del job
GET  /api/vto/result/:id    ──► Obtiene la imagen resultante y talla sugerida
POST /api/vto/cancel/:id    ──► Cancela un trabajo en ejecución
```

---

## 2. Especificación de Endpoints

### 2.1 `POST /api/vto/validate`
Valida si un producto y los parámetros seleccionados son aptos para Virtual Try-On antes de iniciar la inferencia.

* **Request Body**:
```json
{
  "productId": "prod-polera-essential",
  "category": "tops",
  "inputType": "SYNTHETIC_AVATAR",
  "userConsentGiven": true
}
```

* **Response (200 OK)**:
```json
{
  "valid": true,
  "category": "tops",
  "supportedProviders": ["DEMO", "FASHN"]
}
```

---

### 2.2 `POST /api/vto/generate`
Envía la solicitud de generación. Retorna inmediatamente con el ID del trabajo (`jobId`) y el estado inicial (`QUEUED`).

* **Request Body**:
```json
{
  "productId": "prod-vestido-seda",
  "inputType": "USER_PHOTO",
  "userConsentGiven": true,
  "userImageBase64": "<base64_encoded_jpeg>",
  "userImageMimeType": "image/jpeg"
}
```

* **Response (202 Accepted)**:
```json
{
  "jobId": "vto_job_1727000000_abc123",
  "status": "QUEUED",
  "progress": 10,
  "stage": "QUEUED",
  "estimatedWaitSeconds": 8
}
```

---

### 2.3 `GET /api/vto/status/:id`
Consulta el progreso de la inferencia. Se invoca periódicamente (polling) por el cliente.

* **Response (200 OK - En progreso)**:
```json
{
  "jobId": "vto_job_1727000000_abc123",
  "status": "PROCESSING",
  "progress": 65,
  "stage": "WARPING"
}
```

* **Response (200 OK - Completado)**:
```json
{
  "jobId": "vto_job_1727000000_abc123",
  "status": "COMPLETED",
  "progress": 100,
  "stage": "FINALIZING"
}
```

---

### 2.4 `GET /api/vto/result/:id`
Recupera el resultado final una vez que el trabajo está en estado `COMPLETED`.

* **Response (200 OK)**:
```json
{
  "jobId": "vto_job_1727000000_abc123",
  "status": "COMPLETED",
  "outputImageUrl": "https://tentaciones.demo/assets/images/demo-vto-composite.svg",
  "recommendedSize": "M",
  "confidencePercent": 94,
  "provider": "DEMO_OFFLINE",
  "disclaimer": "Renderizado sintético generado por Tentaciones AI VTO Engine. Para fines ilustrativos."
}
```

---

## 3. Integración con FASHN AI Cloud API

El conector `FashnVirtualTryOnProvider` traduce las peticiones internas al esquema oficial de FASHN AI (`https://api.fashn.ai/v1`):

### Modelos y Parámetros
1. **`tryon-v1.6`**:
   - `model_image`: URL o Base64 de la persona o avatar.
   - `garment_image`: URL de la prenda de catálogo.
   - `category`: `"tops" | "bottoms" | "one-pieces"`.
   - `mode`: `"performance"` o `"balanced"`.
2. **`tryon-max`**:
   - Soporta mayor resolución de texturas y preservación de pliegues complejos.
   - Parámetros: `model_image`, `product_image`.

---

## 4. Variables de Entorno de Configuración

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `VTO_PROVIDER` | string | `"DEMO"` | Proveedor activo (`"DEMO"` o `"FASHN"`). |
| `FASHN_API_KEY` | string | `""` | Llave API privada del proveedor FASHN (solo backend). |
| `FASHN_MODEL_NAME` | string | `"tryon-v1.6"` | Modelo de red neuronal (`"tryon-v1.6"` o `"tryon-max"`). |
| `VTO_POLL_INTERVAL_MS` | number | `1000` | Intervalo de polling al proveedor externo en ms. |
| `VTO_JOB_TIMEOUT_MS` | number | `60000` | Tiempo máximo de espera de inferencia (60s). |
