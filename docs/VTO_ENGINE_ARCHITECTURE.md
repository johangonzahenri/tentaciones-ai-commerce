# TENTACIONES AI COMMERCE â€” VIRTUAL TRY-ON (VTO) ENGINE ARCHITECTURE

============================================================
CANONICAL DOCUMENT: docs/VTO_ENGINE_ARCHITECTURE.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: ENGINE ARCHITECTURE & PROVIDER ABSTRACTION
CORRESPONDING CODE CONTRACT: IVirtualTryOnProvider / VirtualTryOnService
============================================================

## 1. Resumen Ejecutivo y la TrÃ­ada Visual de Tentaciones

*Tentaciones AI Commerce* consolida su propuesta de valor visual mediante una **TrÃ­ada de Capacidades Visuales** complementarias y no excluyentes:

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    TENTACIONES VISUAL CAPABILITIES TRIAD                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚    1. 3D VIEWER         â”‚   2. SPATIAL AR         â”‚   3. AI VIRTUAL TRY-ON  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â€¢ Ã“rbita 360Â°           â”‚ â€¢ SesiÃ³n WebXR          â”‚ â€¢ SÃ­ntesis neuronal 2D  â”‚
â”‚ â€¢ GLB / glTF 2.0 real   â”‚ â€¢ Hit-Test contra suelo â”‚ â€¢ Avatares o foto real  â”‚
â”‚ â€¢ InspecciÃ³n de textura â”‚ â€¢ Anclaje 6-DoF         â”‚ â€¢ RecomendaciÃ³n talla   â”‚
â”‚ â€¢ Canvas WebGL local    â”‚ â€¢ Escala mÃ©trica 1:1    â”‚ â€¢ SegmentaciÃ³n e inpaintâ”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

El **AI Virtual Try-On Engine** responde a la necesidad de visualizar cÃ³mo cae una prenda de vestir sobre una silueta humana real o avatar sintÃ©tico calibrado, resolviendo la principal fricciÃ³n en la compra digital de indumentaria: la incertidumbre de calce y proporciones.

---

## 2. Arquitectura Provider-Agnostic & Capas de Dominio

La arquitectura desacopla estrictamente la experiencia de usuario de cualquier proveedor SaaS de inferencia de visiÃ³n artificial mediante el contrato `IVirtualTryOnProvider`:

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚             Storefront UI / SPA (public/app.js)        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ REST / JSON (HTTP)
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚         API Gateway / Server (src/server.ts)           â”‚
â”‚      Endpoints: /api/vto/validate, generate, status    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚      Security Guardrails (src/security/vto-guardrails) â”‚
â”‚      â€¢ assertSafeVTOMode â€¢ validateUserImagePayload    â”‚
â”‚      â€¢ sanitizeVTOResponse â€¢ redactVTOSecrets          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚     Domain Service (src/domain/vto/vto-service.ts)     â”‚
â”‚        OrquestaciÃ³n, validaciÃ³n, job polling           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â–¼                               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ DemoVirtualTryOnProvider â”‚    â”‚ FashnVirtualTryOnProviderâ”‚
â”‚ (src/adapter/vto/demo)   â”‚    â”‚ (src/adapter/vto/fashn)  â”‚
â”‚ â€¢ Inferencia sintÃ©tica   â”‚    â”‚ â€¢ FASHN AI API Cloud     â”‚
â”‚ â€¢ Determinista & Offline â”‚    â”‚ â€¢ tryon-v1.6 / tryon-max â”‚
â”‚ â€¢ 0 tokens / 0 latency   â”‚    â”‚ â€¢ Server-side API Key    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 3. MÃ¡quina de Estados del Try-On Job

Cada trabajo de Virtual Try-On sigue un ciclo de vida estrictamente tipado:

```text
[IDLE]
  â”‚ (User uploads photo / selects synthetic avatar + grants consent)
  â–¼
[SUBMITTED] â”€â”€(Validation passed)â”€â”€â–º [QUEUED]
                                         â”‚
                                         â–¼
                                   [PROCESSING]
                                   â”œâ”€â”€ SEGMENTING
                                   â”œâ”€â”€ WARPING
                                   â”œâ”€â”€ INPAINTING
                                   â””â”€â”€ FINALIZING
                                         â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â–¼                                         â–¼
               [COMPLETED]                                 [FAILED]
          (Result image + Size rec)                   (Sanitized error)
```

### Estados y Descripciones

1. **`IDLE`**: Estado inicial. El usuario no ha iniciado el flujo o cancelÃ³ el modal.
2. **`SUBMITTED`**: La solicitud fue recibida por el servidor y validada por `validateUserImagePayload` y `assertSafeVTOMode`.
3. **`QUEUED`**: El trabajo estÃ¡ en cola interna del proveedor.
4. **`PROCESSING`**: La red neuronal estÃ¡ ejecutando las fases de segmentaciÃ³n corporal, deformaciÃ³n de tela (*garment warping*) e *inpainting* fotorrealista.
5. **`COMPLETED`**: Imagen final renderizada disponible. Retorna URL temporal de resultado y recomendaciÃ³n de talla biomÃ©trica.
6. **`FAILED`**: FallÃ³ la generaciÃ³n (e.g. pose no detectada, oclusiÃ³n severa, timeout de inferencia). Se retorna mensaje saneado sin fugas tÃ©cnicas.

---

## 4. Privacy by Design & In-Memory Pipeline

El motor implementa protecciÃ³n estricta de datos biomÃ©tricos y privacidad:
* **Fotos EfÃ­meras**: Las fotos de usuarios se procesan exclusivamente en memoria volÃ¡til (`Buffer`). Nunca se escriben a disco ni se persisten en bases de datos.
* **Consentimiento ExplÃ­cito**: El modal exige aceptaciÃ³n inequÃ­voca de consentimiento de procesamiento efÃ­mero antes de permitir la captura o subida de imagen.
* **Limpieza de Recursos**: Los `Blob` y `Object URL` en el cliente se revocan inmediatamente mediante `URL.revokeObjectURL()`.
* **Zero Logging de ImÃ¡genes**: Los logs del servidor omiten intencionalmente payloads binarios y cadenas Base64.

---

## 5. Barreras de Seguridad & Fail-Closed Invariants

| Regla de Seguridad | Modo `PUBLIC_DEMO` | Modo `PRIVATE_CONNECTED_DEMO` |
|---|---|---|
| **Proveedor Activo** | `DemoVirtualTryOnProvider` obligatorio | `FashnVirtualTryOnProvider` o `Demo` |
| **Llamadas Externas** | Bloqueadas en runtime (`assertSafeVTOMode`) | Permitidas solo con `FASHN_API_KEY` |
| **ExposiciÃ³n de API Keys** | Terminantemente prohibido (0 keys en repo) | Solo en variables de entorno servidor |
| **SanitizaciÃ³n de Errores** | Errores genÃ©ricos no revelan stack ni rutas | Mensajes saneados de negocio |

---

## 6. Modos de Falla y DegradaciÃ³n Elegante

Si el proveedor externo no estÃ¡ configurado, responde con timeout o devuelve un error de inferencia:
1. El backend captura la excepciÃ³n sin interrumpir el servidor Node.js.
2. Si estÃ¡ configurado el fallback automÃ¡tico, conmuta a `DemoVirtualTryOnProvider` para asegurar continuidad de la experiencia.
3. Si ocurre un error irrecuperable, la interfaz ofrece reintentar con un avatar sintÃ©tico pre-renderizado (Nova, Sora, Mateo).
