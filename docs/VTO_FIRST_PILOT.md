# TENTACIONES AI COMMERCE â€” FIRST REAL VTO PILOT RECORD & EVALUATION

============================================================
CANONICAL DOCUMENT: docs/VTO_FIRST_PILOT.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: TECHNICAL PILOT & PROVIDER VERIFICATION RECORD
CORRESPONDING CODE CONTRACT: FashnVirtualTryOnProvider / VirtualTryOnService
============================================================

## 1. Ficha TÃ©cnica del Piloto de Inferencia

| Campo | Valor / ConfiguraciÃ³n |
|---|---|
| **Fecha de EvaluaciÃ³n** | 2026-09-22 |
| **Proveedor Seleccionado** | FASHN AI (`https://api.fashn.ai/v1`) |
| **Modelo Primario** | `tryon-max` (Recomendado oficialmente por mayor fidelidad textil) |
| **Modelo Secundario (Fallback)** | `tryon-v1.6` (Modo optimizado para alto rendimiento) |
| **CategorÃ­a Piloto** | `tops` (`poleras` â€” *Polera Oversized Organic Cotton Essential*) |
| **Estrategia de Entrada (Usuario)** | Base64 Data URI (`image/jpeg`, `image/png`, `image/webp` max 5 MB) |
| **Estrategia de Entrada (Prenda)** | URL de catÃ¡logo Same-Origin / PNG con transparencia |
| **Estrategia de Salida** | `return_base64: true` (In-memory ephemeral rendering) |
| **Dominio de Entrega CDN** | `cdn.fashn.ai` / `media.fashn.ai` (ValidaciÃ³n estricta de host) |
| **Estado de EjecuciÃ³n Real** | **ARCHITECTURE VERIFIED â€” PILOT BLOCKED BY MISSING CREDENTIAL** |

---

## 2. Esquema de InvocaciÃ³n (Request Schema)

El conector `FashnVirtualTryOnProvider` estructura las solicitudes segÃºn la especificaciÃ³n oficial de FASHN API:

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

Para el modelo `tryon-v1.6`, el esquema mapea automÃ¡ticamente `garment_image` y `category`:

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
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
starting / in_queue           â”€â”€â–º   SUBMITTING (progress: 25%)
processing                    â”€â”€â–º   PROCESSING (progress: 70%)
completed                     â”€â”€â–º   RESULT_READY (progress: 100%)
failed / error                â”€â”€â–º   FAILED (progress: 0%)
```

---

## 4. ClasificaciÃ³n y SanitizaciÃ³n de Errores de Inferencia

Los errores emitidos por el proveedor se clasifican de forma segura antes de alcanzar el frontend:

| Error FASHN | ClasificaciÃ³n de Dominio Tentaciones | Comportamiento UI |
|---|---|---|
| `ImageLoadError` | Fallo en descarga de imagen de prenda o usuario | Invita a revisar formato de imagen |
| `InputValidationError` | ParÃ¡metros o resoluciÃ³n fuera de rango | Informa dimensiones vÃ¡lidas |
| `ContentModerationError` | Bloqueo por polÃ­tica de seguridad y moderaciÃ³n | Rechazo seguro y neutro |
| `UnavailableError` | Servicio de inferencia temporalmente inaccesible | Degrada a `DemoVirtualTryOnProvider` |
| `PipelineError` | Error en la red de difusiÃ³n neuronal | Sugiere probar con otro avatar o pose |

---

## 5. PolÃ­tica de RetenciÃ³n y ComparaciÃ³n de Privacidad

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   POLÃTICA DE RETENCIÃ“N DE DATOS                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ TENTACIONES BACKEND          â”‚ â€¢ 0 fotos guardadas en disco                 â”‚
â”‚                              â”‚ â€¢ 0 fotos en bases de datos o logs           â”‚
â”‚                              â”‚ â€¢ Procesamiento 100% en memoria RAM (Buffer) â”‚
â”‚                              â”‚ â€¢ ExpiraciÃ³n instantÃ¡nea tras peticiÃ³n HTTP  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ PROVEEDOR FASHN AI           â”‚ â€¢ Outputs CDN estÃ¡ndar: expiran en 3 dÃ­as   â”‚
â”‚                              â”‚ â€¢ Con return_base64=true: disponible 60 min  â”‚
â”‚                              â”‚ â€¢ Metadatos de peticiÃ³n en historial API     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 6. DiagnÃ³stico de EjecuciÃ³n del Smoke Test

* **Ambiente Auditado:** `PUBLIC_DEMO` y `PRIVATE_CONNECTED_DEMO`.
* **Disponibilidad de Secreto `FASHN_API_KEY`:** No configurada en el entorno actual.
* **Comportamiento Verificado:** El sistema actÃºa de forma **Fail-Closed**, bloqueando la ejecuciÃ³n externa en `PUBLIC_DEMO` y conmutando limpiamente a `DemoVirtualTryOnProvider` para garantizar que la experiencia del usuario nunca se interrumpa.
* **Aislamiento de Seguridad:** 100% verificado. Cero claves expuestas en cÃ³digo, bundle estÃ¡tico o documentaciÃ³n pÃºblica.
