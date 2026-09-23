# CANONICAL DOCUMENT: VTO REAL PILOT PREFLIGHT & DIAGNOSTIC SPECIFICATION

STATUS: CONTRACT VERIFIED
VERSION: 1.7.3
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal AI Operations & Infrastructure Engineer

---

## 1. PROPÃ“SITO DEL PREFLIGHT

Este documento define el procedimiento tÃ©cnico y la especificaciÃ³n de diagnÃ³stico automatizado para evaluar la **preparaciÃ³n operativa (Preflight Readiness)** antes de disparar inferencias reales contra la API de **FASHN AI**.

El preflight asegura que ninguna llamada externa sea enviada si los prerrequisitos de seguridad, contratos de entrada, consentimiento o credenciales no estÃ¡n 100% satisfechos.

---

## 2. MATRIZ DE COMPROBACIÃ“N DE PRERREQUISITOS (PREFLIGHT CHECKLIST)

| DimensiÃ³n | Requisito TÃ©cnico | MÃ©todo de VerificaciÃ³n | Estado Actual |
| :--- | :--- | :--- | :--- |
| **1. Credencial Segura** | Variable de entorno `FASHN_API_KEY` o `VTO_API_KEY` presente en el servidor | `scripts/vto-pilot.mjs check` | **BLOCKED** (Missing Credential) |
| **2. Modo Operacional** | Servidor configurado en `PRIVATE_CONNECTED_DEMO` o `DEVELOPMENT` | `resolveOperationalMode(process.env)` | **VERIFIED** |
| **3. ConfiguraciÃ³n de Modelo** | Modelo seleccionado compatible (`tryon-max` o `tryon-v1.6`) | `DEFAULT_PILOT_PROFILE.model` | **VERIFIED** |
| **4. Contrato de Entrada** | Imagen de usuario vÃ¡lida con calidad `>= ACCEPTABLE` | `TryOnImagePipeline.assessUserImage()` | **VERIFIED** |
| **5. Prenda Compatible** | Prenda perteneciente a categorÃ­a compatible (`tops`, `dresses`, `outerwear`, `pants`, `skirts`) | `TryOnImagePipeline.assessProductImage()` | **VERIFIED** |
| **6. Consent Gate** | Consentimiento explÃ­cito del usuario (`userConsentGranted === true`) | `validateUserImagePayload()` | **VERIFIED** |
| **7. ValidaciÃ³n de Salida** | Dominio de CDN autorizado (`https://cdn.fashn.ai/`, `https://media.fashn.ai/`) o Data URI | `VTOExecutionGateway.validateOutputUrl()` | **VERIFIED** |
| **8. Motor de Sondeo** | Poller acotado con lÃ­mite mÃ¡ximo de 25 intentos e intervalo exponencial | `VtoPredictionPoller` | **VERIFIED** |
| **9. RedacciÃ³n de Errores** | Filtro de redacciÃ³n de secretos activo en respuestas de cliente | `redactVTOSecrets()` / `sanitizeErrorMessage()` | **VERIFIED** |

---

## 3. PROCEDIMIENTO DE EJECUCIÃ“N DEL PILOTO

El diagnÃ³stico e inferencia se operan de forma reproducible mediante el CLI [`scripts/vto-pilot.mjs`](../scripts/vto-pilot.mjs):

### A. DiagnÃ³stico de Prerrequisitos (Check)
```bash
node scripts/vto-pilot.mjs check
```
*Salida esperada ante ausencia de API Key:*
```json
{
  "mode": "CHECK",
  "pilotStatus": "BLOCKED",
  "ready": false,
  "checklist": {
    "hasApiKey": false,
    "userImageValid": true,
    "productImageValid": true,
    "userConsentGranted": true
  },
  "reasons": [
    "FASHN_API_KEY is not configured in the environment."
  ],
  "recommendation": "Configure FASHN_API_KEY in secure server environment before attempting live inference."
}
```

### B. SimulaciÃ³n End-to-End Segura (Dry-Run)
```bash
node scripts/vto-pilot.mjs dry-run
```
*Ejecuta el flujo completo utilizando el proveedor sintÃ©tico determinista sin consumir crÃ©ditos ni conectar con APIs externas.*

### C. Inferencia Real de Prueba Unitaria (Real-Run)
```bash
FASHN_API_KEY="fa_live_..." node scripts/vto-pilot.mjs real-run
```
*Comportamiento:* Si la variable estÃ¡ ausente, aborta inmediatamente con cÃ³digo de salida 1 (Fail-Closed). Si estÃ¡ presente, ejecuta una Ãºnica inferencia controlada de 1 imagen, valida el resultado, imprime el reporte sin revelar el token y finaliza.

---

## 4. GOBERNANZA DE SECRETOS Y PRIVACIDAD

* **ProhibiciÃ³n de Secretos en Repositorio:** Ninguna clave de API debe ser escrita, commiteada o almacenada en archivos de texto, scripts o repositorios Git.
* **Aislamiento de Navegador:** Las credenciales de FASHN son exclusivas del entorno backend; el frontend jamÃ¡s recibe ni transmite claves de autenticaciÃ³n.
