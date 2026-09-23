# CANONICAL DOCUMENT: VTO POLLING ENGINE & RETRY POLICY SPECIFICATION

STATUS: CERTIFIED
VERSION: 1.6.4
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Backend & Resilience Engineer

---

## 1. OBJETIVO Y ARQUITECTURA DE SONDEO

Las operaciones de inferencia generativa neuronal son procesos asÃ­ncronos que requieren una gestiÃ³n acotada del tiempo de espera y un sondeo (*polling*) resiliente sin saturar los lÃ­mites de tasa (*rate limits*) del proveedor.

---

## 2. PARÃMETROS DEL POLLING ENGINE

El componente `VtoPredictionPoller` opera bajo lÃ­mites explÃ­citos para evitar ciclos infinitos:

```text
+----------------------+--------------------+---------------------------------------------------------------+
| ParÃ¡metro            | Valor Predeterminado| JustificaciÃ³n                                                |
+----------------------+--------------------+---------------------------------------------------------------+
| timeoutMs            | 30,000 ms (30 s)   | LÃ­mite superior para evitar que la interfaz quede bloqueada.  |
| pollIntervalMs       | 1,500 ms (1.5 s)   | Frecuencia balanceada que respeta los rate limits de FASHN.  |
| maxPollAttempts      | 25 intentos        | Previene sondeo indefinido en caso de tareas atascadas.       |
| maxRetries           | 2 reintentos       | LÃ­mite para reintentos de fallos transitorios.                |
+----------------------+--------------------+---------------------------------------------------------------+
```

---

## 3. MATRIZ DE DECISIÃ“N DE REINTENTOS (RETRY POLICY)

No todos los errores son reintentables. La clase `VtoRetryPolicy` clasifica deterministamente cada caso:

| CategorÃ­a de Error / CÃ³digo | Reintentable | PolÃ­tica de Reintento | JustificaciÃ³n |
| :--- | :--- | :--- | :--- |
| **`401 / 403 / VTO_AUTH_ERROR`** | **NO** | Aborto inmediato fail-closed. | Claves no vÃ¡lidas no se recuperan con reintentos. |
| **`400 / VTO_INPUT_INVALID`** | **NO** | Aborto inmediato. | Esquema de solicitud o parÃ¡metros corruptos. |
| **`ImageLoadError / VTO_IMAGE_UNREADABLE`** | **NO** | Aborto inmediato. | Imagen de origen inaccesible o daÃ±ada. |
| **`ContentModeration / VTO_CONTENT_BLOCKED`**| **NO** | Aborto inmediato. | Rechazado por polÃ­ticas de seguridad de contenido. |
| **`429 / VTO_PROVIDER_RATE_LIMIT`** | **SÃ** | Exponential Backoff (base: 500ms, mÃ¡x: 5s). | Alivia la saturaciÃ³n del proveedor. |
| **`502 / 503 / VTO_PROVIDER_UNAVAILABLE`** | **SÃ** | Exponential Backoff (base: 500ms, mÃ¡x: 5s). | Espera recuperaciÃ³n de nodos GPU ocupados. |
| **`500 / VTO_PROVIDER_FAILED`** | **SÃ** | Reintento Ãºnico acotado. | Error interno transitorio del servidor. |

---

## 4. FÃ“RMULA DE RETROCESO EXPONENCIAL

$$\text{delay} = \min\left(\text{maxDelayMs}, \text{baseDelayMs} \times 2^{\text{attempt}}\right)$$

Donte $\text{attempt}$ es el Ã­ndice de reintento actual (0, 1, 2).
