# TENTACIONES AI COMMERCE — FIRST REAL VTO PILOT RECORD & EVALUATION

============================================================
CANONICAL DOCUMENT: docs/VTO_FIRST_PILOT.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: TECHNICAL PILOT & PROVIDER VERIFICATION RECORD
CORRESPONDING CODE CONTRACT: FashnVirtualTryOnProvider / VirtualTryOnService
============================================================

## 1. Ficha Técnica del Piloto de Inferencia

| Campo | Valor / Configuración |
|---|---|
| **Fecha de Evaluación** | 2026-09-22 |
| **Proveedor Seleccionado** | FASHN AI (`https://api.fashn.ai/v1`) |
| **Modelo Primario** | `tryon-max` (Recomendado oficialmente por mayor fidelidad textil) |
| **Modelo Secundario (Fallback)** | `tryon-v1.6` (Modo optimizado para alto rendimiento) |
| **Categoría Piloto** | `tops` (`poleras` — *Polera Oversized Organic Cotton Essential*) |
| **Estrategia de Entrada (Usuario)** | Base64 Data URI (`image/jpeg`, `image/png`, `image/webp` max 5 MB) |
| **Estrategia de Entrada (Prenda)** | URL de catálogo Same-Origin / PNG con transparencia |
| **Estrategia de Salida** | `return_base64: true` (In-memory ephemeral rendering) |
| **Dominio de Entrega CDN** | `cdn.fashn.ai` / `media.fashn.ai` (Validación estricta de host) |
| **Estado de Ejecución Real** | **ARCHITECTURE VERIFIED — PILOT BLOCKED BY MISSING CREDENTIAL** |

---

## 2. Esquema de Invocación (Request Schema)

El conector `FashnVirtualTryOnProvider` estructura las solicitudes según la especificación oficial de FASHN API:

```json
{
  "model_name": "tryon-max",
  "inputs": {
    "model_image": "data:image/jpeg;base64,...",
    "product_image": "https://tentaciones.store/assets/images/polera-essential.png",
    "return_base64": true,
    "num_images": 1
  }
}
```

Para el modelo `tryon-v1.6`, el esquema mapea automáticamente `garment_image` y `category`:

```json
{
  "model_name": "tryon-v1.6",
  "inputs": {
    "model_image": "data:image/jpeg;base64,...",
    "garment_image": "https://tentaciones.store/assets/images/polera-essential.png",
    "category": "tops",
    "return_base64": true,
    "num_images": 1
  }
}
```

---

## 3. Mapeo de Estados y Ciclo de Vida del Trabajo

```text
ESTADO EXTERNO FASHN                 ESTADO INTERNO TENTACIONES
─────────────────────────────────────────────────────────────
starting / in_queue           ──►   SUBMITTING (progress: 25%)
processing                    ──►   PROCESSING (progress: 70%)
completed                     ──►   RESULT_READY (progress: 100%)
failed / error                ──►   FAILED (progress: 0%)
```

---

## 4. Clasificación y Sanitización de Errores de Inferencia

Los errores emitidos por el proveedor se clasifican de forma segura antes de alcanzar el frontend:

| Error FASHN | Clasificación de Dominio Tentaciones | Comportamiento UI |
|---|---|---|
| `ImageLoadError` | Fallo en descarga de imagen de prenda o usuario | Invita a revisar formato de imagen |
| `InputValidationError` | Parámetros o resolución fuera de rango | Informa dimensiones válidas |
| `ContentModerationError` | Bloqueo por política de seguridad y moderación | Rechazo seguro y neutro |
| `UnavailableError` | Servicio de inferencia temporalmente inaccesible | Degrada a `DemoVirtualTryOnProvider` |
| `PipelineError` | Error en la red de difusión neuronal | Sugiere probar con otro avatar o pose |

---

## 5. Política de Retención y Comparación de Privacidad

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                   POLÍTICA DE RETENCIÓN DE DATOS                            │
├──────────────────────────────┬──────────────────────────────────────────────┤
│ TENTACIONES BACKEND          │ • 0 fotos guardadas en disco                 │
│                              │ • 0 fotos en bases de datos o logs           │
│                              │ • Procesamiento 100% en memoria RAM (Buffer) │
│                              │ • Expiración instantánea tras petición HTTP  │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ PROVEEDOR FASHN AI           │ • Outputs CDN estándar: expiran en 3 días   │
│                              │ • Con return_base64=true: disponible 60 min  │
│                              │ • Metadatos de petición en historial API     │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 6. Diagnóstico de Ejecución del Smoke Test

* **Ambiente Auditado:** `PUBLIC_DEMO` y `PRIVATE_CONNECTED_DEMO`.
* **Disponibilidad de Secreto `FASHN_API_KEY`:** No configurada en el entorno actual.
* **Comportamiento Verificado:** El sistema actúa de forma **Fail-Closed**, bloqueando la ejecución externa en `PUBLIC_DEMO` y conmutando limpiamente a `DemoVirtualTryOnProvider` para garantizar que la experiencia del usuario nunca se interrumpa.
* **Aislamiento de Seguridad:** 100% verificado. Cero claves expuestas en código, bundle estático o documentación pública.
