# CANONICAL DOCUMENT: VTO OBSERVABILITY & STRUCTURED TELEMETRY

STATUS: CERTIFIED
VERSION: 1.6.8
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Lead Observability & Platform Reliability Engineer
DATE: 2026-09-22

---

## 1. RESUMEN Y PROPÃ“SITO

Este documento establece la arquitectura de observabilidad, formato de logs estructurados, correlaciÃ³n de eventos, ciclo de vida de peticiones y mÃ©tricas operacionales del motor **AI Virtual Try-On (VTO)** en **Tentaciones AI Commerce**.

---

## 2. INVARIANTES DE PRIVACIDAD Y SEGURIDAD EN TELEMETRÃA

1. **Cero Fuga de Secretos**: Los campos `Authorization`, prefijos `fa_live_`, `sk_live_` y tokens API se enmascaran automÃ¡ticamente como `[REDACTED_FASHN_KEY]`, `[REDACTED_SECRET]` o `[REDACTED_TOKEN]`.
2. **Cero Registro de ImÃ¡genes**: Queda terminantemente prohibido registrar cadenas Base64 de fotografÃ­as, buffers binarios, firmas biomÃ©tricas o URLs privadas no procesadas en logs o trazas.
3. **Identificadores de CorrelaciÃ³n Seguros**: Cada flujo se traza mediante `executionId` (`vto-exec-<timestamp>-<rand>`), `requestId` y `clientSessionId`.

---

## 3. ESQUEMA DE EVENTOS ESTRUCTURADOS (`VTOStructuredEvent`)

```json
{
  "timestamp": "2026-09-22T21:26:00.000Z",
  "eventType": "vto.execution.completed",
  "executionId": "vto-exec-1774225560000-a1b2c",
  "requestId": "req-98fbc21",
  "clientSessionId": "session-user-123",
  "providerId": "demo-synthetic",
  "isSynthetic": true,
  "status": "COMPLETED",
  "durationMs": 120,
  "inferenceLatencyMs": 120,
  "pollAttempt": 1,
  "retryAttempt": 0
}
```

### Tipos CanÃ³nicos de Eventos (`VTOEventType`)
* `vto.execution.started`: Inicio de ciclo en gateway.
* `vto.provider.selected`: ResoluciÃ³n del proveedor segÃºn modo y configuraciÃ³n.
* `vto.job.submitted`: EnvÃ­o de trabajo al proveedor.
* `vto.polling.attempt`: Intento individual de consulta de estado.
* `vto.retry.scheduled`: Reintento programado ante fallo transitorio con backoff.
* `vto.execution.completed`: FinalizaciÃ³n con resultado vÃ¡lido y normalizado.
* `vto.execution.failed`: Fallo terminal con cÃ³digo de error clasificado.
* `vto.execution.cancelled`: InterrupciÃ³n solicitada por el cliente.
* `vto.execution.timeout`: ExpiraciÃ³n del lÃ­mite de tiempo de sondeo o ejecuciÃ³n.
* `vto.circuit.opened`: ActivaciÃ³n del disyuntor por fallos consecutivos.
* `vto.circuit.closed`: Restablecimiento del disyuntor tras cooldown exitoso.
* `vto.rate_limit.exceeded`: Bloqueo por exceso de peticiones por sesiÃ³n/IP.

---

## 4. SEPARACIÃ“N EXPLÃCITA DE MÃ‰TRICAS: DEMO VS REAL

Para garantizar honestidad tÃ©cnica y evitar mezclas errÃ³neas de rendimiento:

| MÃ©trica | Modo `DEMO_SYNTHETIC` | Modo `REAL_PROVIDER` (FASHN) |
| :--- | :--- | :--- |
| **`metricsSource`** | `"DEMO_SYNTHETIC"` | `"REAL_PROVIDER"` |
| **`inferenceLatencyMs`** | Latencia simulada en memoria (~100â€“150 ms) | Tiempo real de GPU en infraestructura de FASHN |
| **`totalDurationMs`** | DuraciÃ³n completa del pipeline local | DuraciÃ³n completa incluyendo red, polling y GPU |
| **InterpretaciÃ³n** | DemostraciÃ³n funcional offline | TelemetrÃ­a real de producciÃ³n |

---

## 5. RESUMEN DE MÃ‰TRICAS DISPONIBLES (`VTOMetricsSummary`)

El endpoint `/api/vto/metrics` expone en tiempo real las estadÃ­sticas agregadas de ejecuciÃ³n del servidor:

```json
{
  "totalExecutions": 24,
  "demoExecutions": 24,
  "realExecutions": 0,
  "completedCount": 22,
  "failedCount": 1,
  "cancelledCount": 1,
  "timeoutCount": 0,
  "totalPollAttempts": 26,
  "totalRetries": 0,
  "averageDurationMs": 118,
  "circuitBreakerTrips": 0
}
```
