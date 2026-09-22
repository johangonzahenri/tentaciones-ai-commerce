# TENTACIONES AI COMMERCE — VIRTUAL TRY-ON (VTO) ENGINE ARCHITECTURE

============================================================
CANONICAL DOCUMENT: docs/VTO_ENGINE_ARCHITECTURE.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: ENGINE ARCHITECTURE & PROVIDER ABSTRACTION
CORRESPONDING CODE CONTRACT: IVirtualTryOnProvider / VirtualTryOnService
============================================================

## 1. Resumen Ejecutivo y la Tríada Visual de Tentaciones

*Tentaciones AI Commerce* consolida su propuesta de valor visual mediante una **Tríada de Capacidades Visuales** complementarias y no excluyentes:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TENTACIONES VISUAL CAPABILITIES TRIAD                    │
├─────────────────────────┬─────────────────────────┬─────────────────────────┤
│    1. 3D VIEWER         │   2. SPATIAL AR         │   3. AI VIRTUAL TRY-ON  │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Órbita 360°           │ • Sesión WebXR          │ • Síntesis neuronal 2D  │
│ • GLB / glTF 2.0 real   │ • Hit-Test contra suelo │ • Avatares o foto real  │
│ • Inspección de textura │ • Anclaje 6-DoF         │ • Recomendación talla   │
│ • Canvas WebGL local    │ • Escala métrica 1:1    │ • Segmentación e inpaint│
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

El **AI Virtual Try-On Engine** responde a la necesidad de visualizar cómo cae una prenda de vestir sobre una silueta humana real o avatar sintético calibrado, resolviendo la principal fricción en la compra digital de indumentaria: la incertidumbre de calce y proporciones.

---

## 2. Arquitectura Provider-Agnostic & Capas de Dominio

La arquitectura desacopla estrictamente la experiencia de usuario de cualquier proveedor SaaS de inferencia de visión artificial mediante el contrato `IVirtualTryOnProvider`:

```text
┌────────────────────────────────────────────────────────┐
│             Storefront UI / SPA (public/app.js)        │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (HTTP)
┌───────────────────────────▼────────────────────────────┐
│         API Gateway / Server (src/server.ts)           │
│      Endpoints: /api/vto/validate, generate, status    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│      Security Guardrails (src/security/vto-guardrails) │
│      • assertSafeVTOMode • validateUserImagePayload    │
│      • sanitizeVTOResponse • redactVTOSecrets          │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│     Domain Service (src/domain/vto/vto-service.ts)     │
│        Orquestación, validación, job polling           │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│ DemoVirtualTryOnProvider │    │ FashnVirtualTryOnProvider│
│ (src/adapter/vto/demo)   │    │ (src/adapter/vto/fashn)  │
│ • Inferencia sintética   │    │ • FASHN AI API Cloud     │
│ • Determinista & Offline │    │ • tryon-v1.6 / tryon-max │
│ • 0 tokens / 0 latency   │    │ • Server-side API Key    │
└──────────────────────────┘    └──────────────────────────┘
```

---

## 3. Máquina de Estados del Try-On Job

Cada trabajo de Virtual Try-On sigue un ciclo de vida estrictamente tipado:

```text
[IDLE]
  │ (User uploads photo / selects synthetic avatar + grants consent)
  ▼
[SUBMITTED] ──(Validation passed)──► [QUEUED]
                                         │
                                         ▼
                                   [PROCESSING]
                                   ├── SEGMENTING
                                   ├── WARPING
                                   ├── INPAINTING
                                   └── FINALIZING
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
               [COMPLETED]                                 [FAILED]
          (Result image + Size rec)                   (Sanitized error)
```

### Estados y Descripciones

1. **`IDLE`**: Estado inicial. El usuario no ha iniciado el flujo o canceló el modal.
2. **`SUBMITTED`**: La solicitud fue recibida por el servidor y validada por `validateUserImagePayload` y `assertSafeVTOMode`.
3. **`QUEUED`**: El trabajo está en cola interna del proveedor.
4. **`PROCESSING`**: La red neuronal está ejecutando las fases de segmentación corporal, deformación de tela (*garment warping*) e *inpainting* fotorrealista.
5. **`COMPLETED`**: Imagen final renderizada disponible. Retorna URL temporal de resultado y recomendación de talla biométrica.
6. **`FAILED`**: Falló la generación (e.g. pose no detectada, oclusión severa, timeout de inferencia). Se retorna mensaje saneado sin fugas técnicas.

---

## 4. Privacy by Design & In-Memory Pipeline

El motor implementa protección estricta de datos biométricos y privacidad:
* **Fotos Efímeras**: Las fotos de usuarios se procesan exclusivamente en memoria volátil (`Buffer`). Nunca se escriben a disco ni se persisten en bases de datos.
* **Consentimiento Explícito**: El modal exige aceptación inequívoca de consentimiento de procesamiento efímero antes de permitir la captura o subida de imagen.
* **Limpieza de Recursos**: Los `Blob` y `Object URL` en el cliente se revocan inmediatamente mediante `URL.revokeObjectURL()`.
* **Zero Logging de Imágenes**: Los logs del servidor omiten intencionalmente payloads binarios y cadenas Base64.

---

## 5. Barreras de Seguridad & Fail-Closed Invariants

| Regla de Seguridad | Modo `PUBLIC_DEMO` | Modo `PRIVATE_CONNECTED_DEMO` |
|---|---|---|
| **Proveedor Activo** | `DemoVirtualTryOnProvider` obligatorio | `FashnVirtualTryOnProvider` o `Demo` |
| **Llamadas Externas** | Bloqueadas en runtime (`assertSafeVTOMode`) | Permitidas solo con `FASHN_API_KEY` |
| **Exposición de API Keys** | Terminantemente prohibido (0 keys en repo) | Solo en variables de entorno servidor |
| **Sanitización de Errores** | Errores genéricos no revelan stack ni rutas | Mensajes saneados de negocio |

---

## 6. Modos de Falla y Degradación Elegante

Si el proveedor externo no está configurado, responde con timeout o devuelve un error de inferencia:
1. El backend captura la excepción sin interrumpir el servidor Node.js.
2. Si está configurado el fallback automático, conmuta a `DemoVirtualTryOnProvider` para asegurar continuidad de la experiencia.
3. Si ocurre un error irrecuperable, la interfaz ofrece reintentar con un avatar sintético pre-renderizado (Nova, Sora, Mateo).
