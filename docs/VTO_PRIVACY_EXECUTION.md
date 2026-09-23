# CANONICAL DOCUMENT: VTO PRIVACY & DATA TRANSPORT SPECIFICATION

STATUS: CERTIFIED
VERSION: 1.6.4
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Privacy & Compliance Architect

---

## 1. DISTINCIÃ“N ENTRE POLÃTICAS DE PRIVACIDAD

Es fundamental distinguir con total precisiÃ³n tÃ©cnica las dos polÃ­ticas de retenciÃ³n involucradas en el flujo:

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚     TENTACIONES COMMERCE PLATFORM     â”‚       â”‚            FASHN AI CLOUD             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤       â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â€¢ 0 Persistencia en disco o BD        â”‚       â”‚ â€¢ Outputs Base64: hasta 60 minutos    â”‚
â”‚ â€¢ Buffer RAM efÃ­mero (destrucciÃ³n)    â”‚  â”€â”€â–º  â”‚ â€¢ URLs CDN: retenciÃ³n de 3 dÃ­as       â”‚
â”‚ â€¢ 0 Carpetas uploads/ ni historiales  â”‚       â”‚ â€¢ Historial de requests en servidor   â”‚
â”‚ â€¢ 0 Registro de imÃ¡genes en logs      â”‚       â”‚ â€¢ Recomienda URLs firmadas temporales â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 2. POLÃTICA DE TENTACIONES (EPHEMERAL RAM ONLY)

- **Frontend:** La fotografÃ­a cargada se almacena en memoria volÃ¡til de la pestaÃ±a activa mediante `Blob` / `DataURI`. Al cerrar el modal o cambiar de pÃ¡gina, se liberan referencias mediante `URL.revokeObjectURL()`.
- **Backend / Gateway:** Los tensores y cadenas Base64 existen exclusivamente durante la duraciÃ³n de la peticiÃ³n HTTP y son eliminados inmediatamente tras la entrega de la respuesta.
- **AuditorÃ­a de Logs:** Los interceptores de telemetrÃ­a filtran explÃ­citamente cualquier campo con imÃ¡genes en bruto, tokens de autorizaciÃ³n y datos personales biomÃ©tricos.

---

## 3. POLÃTICA DEL PROVEEDOR EXTERNO (FASHN AI)

- FASHN AI documenta que almacena metadatos de solicitud e historial de inferencia en su plataforma.
- Cuando se utiliza `return_base64: true`, los artefactos estÃ¡n disponibles temporalmente hasta por **60 minutos**.
- Cuando se utilizan enlaces CDN estÃ¡ndar (`cdn.fashn.ai`), la ventana de disponibilidad es de **3 dÃ­as**.
- Tentaciones utiliza prioritariamente el modo Base64 efÃ­mero para minimizar la exposiciÃ³n en CDNs pÃºblicas.
