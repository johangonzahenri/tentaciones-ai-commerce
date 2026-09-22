# CANONICAL DOCUMENT: VTO REAL PILOT EXECUTION RUNBOOK

STATUS: CERTIFIED
VERSION: 1.6.4
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal AI Operations & Infrastructure Engineer

---

## 1. RESUMEN OPERACIONAL

Este runbook detalla los pasos reproducibles para auditar, simular y ejecutar un piloto real del motor de **AI Virtual Try-On** con FASHN AI mediante la herramienta CLI [`scripts/vto-pilot.mjs`](../scripts/vto-pilot.mjs).

---

## 2. MODOS DE OPERACIÓN DEL RUNNER

El CLI soporta 3 modos de operación:

```bash
# 1. Modo Auditoría y Chequeo de Prerrequisitos (CHECK)
node scripts/vto-pilot.mjs check

# 2. Modo Simulación sin Inferencia Externa (DRY_RUN)
node scripts/vto-pilot.mjs dry-run

# 3. Modo Ejecución Real contra FASHN API (REAL_RUN)
# (Requiere FASHN_API_KEY configurada en variables de entorno seguras)
FASHN_API_KEY="fa_live_..." node scripts/vto-pilot.mjs real-run
```

---

## 3. COMPORTAMIENTO FAIL-CLOSED ANTE AUSENCIA DE CREDENCIALES

Si se invoca `real-run` sin la variable `FASHN_API_KEY`, el runner aborta inmediatamente:

```text
============================================================
  TENTACIONES AI COMMERCE — VTO PILOT RUNNER CLI
============================================================
Command Mode:    REAL-RUN
FASHN_API_KEY:   NOT CONFIGURED (Missing)
Runtime:         Node.js v22.x
------------------------------------------------------------
❌ ERROR: REAL PILOT EXECUTION BLOCKED (FAIL-CLOSED)
Reason: FASHN_API_KEY is not configured in the environment.
Honesty Invariant: No fake pilot calls or synthetic tokens will be emitted.
```

---

## 4. INVENTARIO DE SEGURIDAD OPERACIONAL

- **Zero Secret Output:** El CLI jamás imprime en pantalla o en logs la clave de API ni tokens Bearer.
- **Zero Raw Image Dump:** Las fotos de usuario o prendas no se vuelcan al disco ni se persisten en archivos locales.
- **Idempotencia:** Cada ejecución genera un `requestId` único e irrepetible.
