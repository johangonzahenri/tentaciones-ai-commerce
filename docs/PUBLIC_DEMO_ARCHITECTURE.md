# CANONICAL DOCUMENT: PUBLIC DEMO ARCHITECTURE & RUNTIME ISOLATION

STATUS: CERTIFIED
VERSION: 1.8.0
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Lead Solution Architect & Systems Engineer
DATE: 2026-09-23

---

## 1. TopologÃ­a ArquitectÃ³nica del Demo PÃºblico

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                           PUBLIC BROWSER / CLIENT                       â”‚
â”‚                                                                         â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚   â”‚   DEMO COMMERCE   â”‚  â”‚   DEMO AR / 3D    â”‚  â”‚     DEMO VTO      â”‚   â”‚
â”‚   â”‚  â€¢ Catalog Data   â”‚  â”‚  â€¢ GLB 2.0 Parser â”‚  â”‚  â€¢ Upload Preview â”‚   â”‚
â”‚   â”‚  â€¢ Cart Engine    â”‚  â”‚  â€¢ WebXR Spatial  â”‚  â”‚  â€¢ Avatars (Nova) â”‚   â”‚
â”‚   â”‚  â€¢ Webpay Sim     â”‚  â”‚  â€¢ Canvas Engine  â”‚  â”‚  â€¢ Quality Badges â”‚   â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
              â”‚                      â”‚                      â”‚
              â–¼                      â–¼                      â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 STATIC WEB ASSETS & LOCAL RUNTIME SERVER                â”‚
â”‚                                                                         â”‚
â”‚   â€¢ public/index.html        â€¢ public/app.js       â€¢ public/styles.css  â”‚
â”‚   â€¢ public/assets/images/*.svg                     â€¢ *.glb / *.gltf     â”‚
â”‚                                                                         â”‚
â”‚   Local REST Middleware (src/server.ts):                                â”‚
â”‚   â€¢ POST /api/vto/assess    â€¢ POST /api/vto/generate                    â”‚
â”‚   â€¢ GET  /api/vto/status/:id â€¢ GET /api/vto/result/:id                  â”‚
â”‚   â€¢ POST /api/vto/cancel/:id â€¢ GET /api/vto/metrics                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   VTO DOMAIN ENGINE & DEMO GATEWAY                      â”‚
â”‚                                                                         â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚   â”‚  VTOExecutionGateway                                            â”‚   â”‚
â”‚   â”‚  â€¢ Operational Guards (Rate Limiter, Idempotency, Budget)       â”‚   â”‚
â”‚   â”‚  â€¢ Provider Policy: PUBLIC_DEMO -> DemoVirtualTryOnProvider     â”‚   â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                 â–¼                                       â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”             â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  PUBLIC DEMO PROVIDER   â”‚             â”‚   REAL FASHN PROVIDER   â”‚
    â”‚                         â”‚             â”‚                         â”‚
    â”‚ â€¢ DemoVirtualTryOn      â”‚             â”‚ â€¢ FashnVirtualTryOn     â”‚
    â”‚ â€¢ Deterministic Output  â”‚             â”‚ â€¢ Try-On Max / v1.6     â”‚
    â”‚ â€¢ 0 External API Calls  â”‚             â”‚ â€¢ External API v1       â”‚
    â”‚ â€¢ 0 Cost / 0 Tokens     â”‚             â”‚ â€¢ FASHN_API_KEY Gate    â”‚
    â”‚ â€¢ STATUS: OPERATIONAL   â”‚             â”‚ â€¢ STATUS: BLOCKED       â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜             â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 2. LÃ­mites de Aislamiento y Requerimientos de Infraestructura

| Capacidad | Modo Public Demo | Modo Private Connected | Requerimiento de Credenciales |
|---|---|---|---|
| **Storefront Navigation** | Totalmente AutÃ³nomo | Conectado a AI Platform | Ninguna |
| **Visualizador 3D Canvas** | Local (GLB/GLTF en `public/assets`) | Dynamic Asset CDN | Ninguna |
| **WebXR Hit-Test AR** | Contexto HTTPS / Localhost | Contexto HTTPS / Localhost | Ninguna |
| **Virtual Try-On Demo** | `DemoVirtualTryOnProvider` | `DemoVirtualTryOnProvider` | Ninguna |
| **Virtual Try-On FASHN** | **BLOQUEADO (Fail-Closed)** | Inferencia Real Activa | `FASHN_API_KEY` requerida |
| **Checkout Simulado** | `WEBPAY_DEMO` (En memoria) | Transbank / Stripe Gateway | Credenciales de Comercio |

---

## 3. GarantÃ­as de Privacidad en Entorno PÃºblico
* **Cero Almacenamiento**: Las fotos cargadas por el usuario no se persisten en base de datos, `localStorage` ni `sessionStorage`.
* **Transporte EfÃ­mero**: Todo el procesamiento se realiza en memoria volÃ¡til.
* **LiberaciÃ³n de Memoria**: Las referencias `blob:` se revocan inmediatamente mediante `URL.revokeObjectURL()`.
