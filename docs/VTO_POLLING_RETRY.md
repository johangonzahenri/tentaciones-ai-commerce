# CANONICAL DOCUMENT: VTO POLLING ENGINE & RETRY POLICY SPECIFICATION

STATUS: CERTIFIED
VERSION: 1.6.4
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Backend & Resilience Engineer

---

## 1. OBJETIVO Y ARQUITECTURA DE SONDEO

Las operaciones de inferencia generativa neuronal son procesos asíncronos que requieren una gestión acotada del tiempo de espera y un sondeo (*polling*) resiliente sin saturar los límites de tasa (*rate limits*) del proveedor.

---

## 2. PARÁMETROS DEL POLLING ENGINE

El componente `VtoPredictionPoller` opera bajo límites explícitos para evitar ciclos infinitos:

```text
+----------------------+--------------------+---------------------------------------------------------------+
| Parámetro            | Valor Predeterminado| Justificación                                                |
+----------------------+--------------------+---------------------------------------------------------------+
| timeoutMs            | 30,000 ms (30 s)   | Límite superior para evitar que la interfaz quede bloqueada.  |
| pollIntervalMs       | 1,500 ms (1.5 s)   | Frecuencia balanceada que respeta los rate limits de FASHN.  |
| maxPollAttempts      | 25 intentos        | Previene sondeo indefinido en caso de tareas atascadas.       |
| maxRetries           | 2 reintentos       | Límite para reintentos de fallos transitorios.                |
+----------------------+--------------------+---------------------------------------------------------------+
```

---

## 3. MATRIZ DE DECISIÓN DE REINTENTOS (RETRY POLICY)

No todos los errores son reintentables. La clase `VtoRetryPolicy` clasifica deterministamente cada caso:

| Categoría de Error / Código | Reintentable | Política de Reintento | Justificación |
| :--- | :--- | :--- | :--- |
| **`401 / 403 / VTO_AUTH_ERROR`** | **NO** | Aborto inmediato fail-closed. | Claves no válidas no se recuperan con reintentos. |
| **`400 / VTO_INPUT_INVALID`** | **NO** | Aborto inmediato. | Esquema de solicitud o parámetros corruptos. |
| **`ImageLoadError / VTO_IMAGE_UNREADABLE`** | **NO** | Aborto inmediato. | Imagen de origen inaccesible o dañada. |
| **`ContentModeration / VTO_CONTENT_BLOCKED`**| **NO** | Aborto inmediato. | Rechazado por políticas de seguridad de contenido. |
| **`429 / VTO_PROVIDER_RATE_LIMIT`** | **SÍ** | Exponential Backoff (base: 500ms, máx: 5s). | Alivia la saturación del proveedor. |
| **`502 / 503 / VTO_PROVIDER_UNAVAILABLE`** | **SÍ** | Exponential Backoff (base: 500ms, máx: 5s). | Espera recuperación de nodos GPU ocupados. |
| **`500 / VTO_PROVIDER_FAILED`** | **SÍ** | Reintento único acotado. | Error interno transitorio del servidor. |

---

## 4. FÓRMULA DE RETROCESO EXPONENCIAL

$$\text{delay} = \min\left(\text{maxDelayMs}, \text{baseDelayMs} \times 2^{\text{attempt}}\right)$$

Donte $\text{attempt}$ es el índice de reintento actual (0, 1, 2).
