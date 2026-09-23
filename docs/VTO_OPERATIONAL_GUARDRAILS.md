# CANONICAL DOCUMENT: VTO OPERATIONAL GUARDRAILS & COST RELIABILITY

STATUS: CERTIFIED
VERSION: 1.6.8
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Lead SRE & Security Architecture Engineer
DATE: 2026-09-22

---

## 1. RESUMEN EJECUTIVO Y ARQUITECTURA OPERACIONAL

El presente documento define los guardrails operacionales, controles de costo, lÃ­mites de concurrencia, gestiÃ³n de idempotencia, polÃ­ticas de reintentos acotados, disyuntor de fallos (circuit breaker) y mecanismos de descarte de estados tardÃ­os para el motor **AI Virtual Try-On (VTO)** en **Tentaciones AI Commerce**.

```text
STOREFRONT (Web UI)
    â”‚
    â–¼
VTO API (/api/vto/generate, /api/vto/assess, /api/vto/status/:id)
    â”‚
    â–¼
VTOExecutionGateway
    â”‚
    â”œâ”€â”€ 1. Cost & Execution Budget Guard (numImages === 1, retries <= 3, timeout <= 120s)
    â”œâ”€â”€ 2. Rate Limiting Guard (Token Bucket / Sliding Window por sesiÃ³n/IP)
    â”œâ”€â”€ 3. Concurrency & Idempotency Manager (In-flight lock + TTL Cache)
    â”œâ”€â”€ 4. Consent Gate (Consentimiento explÃ­cito mandatorio)
    â”œâ”€â”€ 5. Input Quality Gate (EvaluaciÃ³n de resoluciÃ³n y artefactos)
    â”œâ”€â”€ 6. Provider Policy & Circuit Breaker (Aislamiento y protecciÃ³n anti-cascada)
    â”œâ”€â”€ 7. Bounded Polling Engine (Sondeo asÃ­ncrono con backoff exponencial)
    â”œâ”€â”€ 8. Cancellation & Stale Execution Guard (Descarte de callbacks tardÃ­os)
    â”œâ”€â”€ 9. Output Whitelist & HTTPS Enforcer
    â””â”€â”€ 10. Normalized Result & Structured Telemetry
```

---

## 2. POLÃTICA DE IDEMPOTENCIA Y CONCURRENCIA

### 2.1 SemÃ¡ntica de Idempotencia
* **Clave de Idempotencia**: Derivada de `metadata.idempotencyKey` o `requestId`.
* **CachÃ© en Memoria con TTL**: Si una peticiÃ³n idÃ©ntica se recibe dentro de la ventana de validez (5 minutos), el gateway retorna directamente el resultado normalizado en cachÃ© sin reenviar la llamada a la inferencia ni consumir cuota del proveedor.
* **Control en Vuelo**: Si una peticiÃ³n con la misma clave ya se encuentra procesÃ¡ndose, se rechaza de inmediato con el cÃ³digo `VTO_DUPLICATE_REQUEST`.

### 2.2 Control de Concurrencia por SesiÃ³n
* **Alcance**: Por `clientSessionId` en el proceso del servidor.
* **LÃ­mite**: MÃ¡ximo **1 ejecuciÃ³n VTO concurrente** activa por sesiÃ³n.
* **Respuesta Fail-Closed**: Cualquier solicitud concurrente adicional es rechazada con el cÃ³digo `VTO_CONCURRENCY_LIMIT`.

---

## 3. GUARDRAILS DE COSTO Y PRESUPUESTO DE EJECUCIÃ“N (EXECUTION BUDGET)

Para proteger los costes de inferencia externa en GPU y evitar bucles descontrolados:

| DimensiÃ³n | LÃ­mite MÃ¡ximo Certificado | PolÃ­tica ante Exceso |
| :--- | :--- | :--- |
| **ImÃ¡genes por Inferencia (`numImages`)** | **Exactamente 1 (`numImages === 1`)** | **Rechazo inmediato (`VTO_COST_LIMIT_EXCEEDED`)** |
| **Reintentos MÃ¡ximos (`maxRetries`)** | **$\le 3$** | **Rechazo en preflight de presupuesto** |
| **Intentos de Sondeo (`maxPollAttempts`)** | **$\le 60$** | **Rechazo en preflight de presupuesto** |
| **Timeout Total de EjecuciÃ³n (`timeoutMs`)** | **$\le 120.000\text{ ms}$ (2 min)** | **Rechazo en preflight de presupuesto** |
| **TamaÃ±o MÃ¡ximo de Payload HTTP** | **$12\text{ MB}$ raw / $10\text{ MB}$ decoded** | **HTTP 413 (`Payload Too Large`)** |

---

## 4. DISYUNTOR DE FALLOS (PROVIDER CIRCUIT BREAKER)

El gateway implementa un `VTOProviderCircuitBreaker` in-memory para prevenir la sobrecarga de proveedores en estado degradado o inaccesibles:
* **Umbral de Disparo**: 5 fallos consecutivos (cÃ³digos 5xx, timeouts o unavailable).
* **Estado OPEN**: Ante 5 fallos consecutivos, el circuito se abre por **30.000 ms (30 segundos)**.
* **Comportamiento en OPEN**: Las solicitudes dirigidas a dicho proveedor fallan inmediatamente con `VTO_CIRCUIT_OPEN` sin abrir conexiones de red externas.
* **RecuperaciÃ³n (Half-Open)**: Tras 30 segundos, la siguiente solicitud evalÃºa la disponibilidad; si tiene Ã©xito, el circuito se restablece a `CLOSED`.

---

## 5. POLÃTICA DE CANCELACIÃ“N Y PROTECCIÃ“N DE ESTADOS TARDÃOS (STALE EXECUTION)

1. **CancelaciÃ³n Local vs Remota**:
   - `LOCAL EXECUTION CANCELLED`: El gateway aborta inmediatamente el sondeo, libera el lock de concurrencia y marca el estado como `CANCELLED`.
   - Si el proveedor remoto (FASHN) soporta cancelaciÃ³n explÃ­cita, se emite la orden; en caso contrario, el gateway simplemente ignora cualquier resultado que llegue posteriormente.
2. **ProtecciÃ³n contra Callbacks TardÃ­os**:
   - Si un resultado llega despuÃ©s de que el trabajo fue cancelado o expirÃ³ por `TIMEOUT`, el gateway descarta el resultado (`VTO_STALE_EXECUTION`) y no sobrescribe el estado terminal ni emite eventos en la UI.

---

## 6. TAXONOMÃA COMPLETA DE CÃ“DIGOS DE ERROR (`VTOErrorCode`)

```typescript
export type VTOErrorCode =
  | "VTO_AUTH_ERROR"           // Fallo de autenticaciÃ³n o token invÃ¡lido
  | "VTO_INPUT_INVALID"        // Payload o categorÃ­a incompatible
  | "VTO_IMAGE_UNREADABLE"     // FotografÃ­a corrupta o dimensiones invÃ¡lidas
  | "VTO_CONSENT_REQUIRED"     // Falta de consentimiento explÃ­cito
  | "VTO_PAYLOAD_TOO_LARGE"    // Imagen o payload excede el lÃ­mite
  | "VTO_PROVIDER_RATE_LIMIT"  // Rate limit del proveedor o local excedido
  | "VTO_PROVIDER_UNAVAILABLE" // Proveedor temporalmente inaccesible
  | "VTO_PROVIDER_FAILED"      // Error de inferencia del proveedor
  | "VTO_CIRCUIT_OPEN"         // Disyuntor activado tras fallos repetidos
  | "VTO_CONTENT_BLOCKED"      // Rechazo por filtro de moderaciÃ³n
  | "VTO_COST_LIMIT_EXCEEDED"  // ViolaciÃ³n de numImages > 1 o presupuesto
  | "VTO_TIMEOUT"              // Tiempo de ejecuciÃ³n excedido
  | "VTO_CANCELLED"            // CancelaciÃ³n solicitada por el usuario
  | "VTO_MISSING_CREDENTIAL"   // Credencial requerida no configurada
  | "VTO_RESULT_INVALID"       // URL o formato de salida fuera de whitelist
  | "VTO_DUPLICATE_REQUEST"    // PeticiÃ³n idÃ©ntica en vuelo
  | "VTO_CONCURRENCY_LIMIT"    // LÃ­mite de concurrencia de sesiÃ³n alcanzado
  | "VTO_STALE_EXECUTION"      // Resultado descartado por llegar tras timeout/cancel
  | "VTO_UNAUTHORIZED_ACCESS"; // Consulta no autorizada sobre executionId ajeno
```
