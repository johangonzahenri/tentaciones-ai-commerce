# CANONICAL DOCUMENT: VTO PRIVACY & DATA TRANSPORT SPECIFICATION

STATUS: CERTIFIED
VERSION: 1.6.4
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Privacy & Compliance Architect

---

## 1. DISTINCIÓN ENTRE POLÍTICAS DE PRIVACIDAD

Es fundamental distinguir con total precisión técnica las dos políticas de retención involucradas en el flujo:

```text
┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
│     TENTACIONES COMMERCE PLATFORM     │       │            FASHN AI CLOUD             │
├───────────────────────────────────────┤       ├───────────────────────────────────────┤
│ • 0 Persistencia en disco o BD        │       │ • Outputs Base64: hasta 60 minutos    │
│ • Buffer RAM efímero (destrucción)    │  ──►  │ • URLs CDN: retención de 3 días       │
│ • 0 Carpetas uploads/ ni historiales  │       │ • Historial de requests en servidor   │
│ • 0 Registro de imágenes en logs      │       │ • Recomienda URLs firmadas temporales │
└───────────────────────────────────────┘       └───────────────────────────────────────┘
```

---

## 2. POLÍTICA DE TENTACIONES (EPHEMERAL RAM ONLY)

- **Frontend:** La fotografía cargada se almacena en memoria volátil de la pestaña activa mediante `Blob` / `DataURI`. Al cerrar el modal o cambiar de página, se liberan referencias mediante `URL.revokeObjectURL()`.
- **Backend / Gateway:** Los tensores y cadenas Base64 existen exclusivamente durante la duración de la petición HTTP y son eliminados inmediatamente tras la entrega de la respuesta.
- **Auditoría de Logs:** Los interceptores de telemetría filtran explícitamente cualquier campo con imágenes en bruto, tokens de autorización y datos personales biométricos.

---

## 3. POLÍTICA DEL PROVEEDOR EXTERNO (FASHN AI)

- FASHN AI documenta que almacena metadatos de solicitud e historial de inferencia en su plataforma.
- Cuando se utiliza `return_base64: true`, los artefactos están disponibles temporalmente hasta por **60 minutos**.
- Cuando se utilizan enlaces CDN estándar (`cdn.fashn.ai`), la ventana de disponibilidad es de **3 días**.
- Tentaciones utiliza prioritariamente el modo Base64 efímero para minimizar la exposición en CDNs públicas.
