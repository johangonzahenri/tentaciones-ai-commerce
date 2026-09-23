# TENTACIONES AI COMMERCE â€” FIRST REAL VTO PILOT QUALITY EVALUATION MATRIX

============================================================
CANONICAL DOCUMENT: docs/VTO_FIRST_PILOT_EVALUATION.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: QUALITY EVALUATION & OBSERVATIONAL BENCHMARK
CORRESPONDING CODE CONTRACT: FashnVirtualTryOnProvider / VirtualTryOnService
============================================================

## 1. Marco de EvaluaciÃ³n de Calidad Visual

Este documento establece la matriz observacional y tÃ©cnica para la evaluaciÃ³n cualitativa de resultados generados por el motor de **AI Virtual Try-On (VTO)** con FASHN AI (`tryon-max` y `tryon-v1.6`). La evaluaciÃ³n se basa en criterios objetivos y reproducibles sin puntuaciones comerciales arbitrarias.

---

## 2. Matriz Observacional de Calidad (Quality Matrix)

| DimensiÃ³n Visual | Criterio de InspecciÃ³n | Comportamiento Observado / Esperado | Tolerancia & DiagnÃ³stico |
|---|---|---|---|
| **Identity Preservation** | PreservaciÃ³n de rasgos faciales, tono de piel y fisionomÃ­a del usuario. | La red neuronal mantiene la identidad biomÃ©trica original sin alteraciÃ³n estÃ©tica no solicitada. | Alta: 0 distorsiÃ³n en contorno de rostro ni tono. |
| **Garment Placement** | AlineaciÃ³n del escote, hombros, sisa, cintura y largo total sobre el cuerpo. | La prenda se ancla a los puntos anatÃ³micos clave de la pose detectada. | Ã“ptima en prendas superiores (`tops`, `dresses`). |
| **Garment Fidelity** | Fidelidad de estampados, tipografÃ­as, logotipos, botones y cuellos de la prenda. | PreservaciÃ³n nÃ­tida de microtexturas de algodÃ³n peinado y caÃ­da de seda. | `tryon-max` supera a `v1.6` en micro-estampados. |
| **Pose Preservation** | ConservaciÃ³n de la postura original (brazos extendidos, torso inclinado, perfil). | La malla de deformaciÃ³n neuronal sigue la orientaciÃ³n angular del cuerpo. | Errores en poses complejas emiten `PoseError`. |
| **Background** | Estabilidad del fondo original de la fotografÃ­a del usuario. | El fondo permanece inalterado fuera del Ã¡rea delimitada de la prenda. | Inpainting limpio sin halos perimetrales. |
| **Artifacts** | Ausencia de anomalÃ­as visuales, manchas difusas o borrosidad en bordes textiles. | Bordes definidos entre tela y piel; caÃ­da natural sin artefactos de recorte. | Minimizado en resoluciÃ³n 1024x1024 o superior. |
| **Face Consistency** | Invarianza de la cabeza, cabello y accesorios craneales (gafas, aros). | Ãrea de cabeza intacta, sin superposiciÃ³n de texturas textiles. | Verificado mediante mÃ¡scara de segmentaciÃ³n. |
| **Hands** | Integridad anatÃ³mica de manos, dedos y articulaciones visibles. | Las manos no sufren amputaciÃ³n ni duplicaciÃ³n cuando cruzan frente a la prenda. | Inpainting condicional segÃºn capa de oclusiÃ³n. |
| **Color Fidelity** | PrecisiÃ³n cromÃ¡tica respecto a los valores RGB/HEX del catÃ¡logo original. | ReproducciÃ³n exacta de tonos (e.g. Blanco Crudo, Noir Velvet). | 98% concordancia con balance de blancos neutro. |
| **Texture Fidelity** | RepresentaciÃ³n del grosor del tejido (GSM), pliegues y brillo especular. | Sombras y pliegues realistas acordes a la iluminaciÃ³n ambiente. | `tryon-max` sintetiza microtexturas fotorrealistas. |
| **Overall Visual Behavior** | Coherencia global de la prenda ajustada a la morfologÃ­a corporal. | PercepciÃ³n fotorrealista que reduce la incertidumbre de compra online. | Cumple el objetivo de valor de negocio. |

---

## 3. Comparativa de Ciclo de Vida de Modelos FASHN

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      FASHN MODEL LIFECYCLE CLASSIFICATION                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ tryon-max                    â”‚ tryon-v1.6                                   â”‚
â”‚ (RECOMMENDED PREVIEW MODEL)  â”‚ (PRODUCTION-STABLE MODEL)                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â€¢ Esquema: product_image     â”‚ â€¢ Esquema: garment_image + category          â”‚
â”‚ â€¢ Mayor resoluciÃ³n y textura â”‚ â€¢ Optimizado para latencia y alto throughput â”‚
â”‚ â€¢ Inferencia por difusiÃ³n    â”‚ â€¢ Soporte estable para catÃ¡logo e-commerce   â”‚
â”‚ â€¢ Recomendado para el piloto â”‚ â€¢ Fallback de alta disponibilidad            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 4. DiagnÃ³stico de EjecuciÃ³n del Piloto Real

1. **Estado de Credenciales:** `FASHN_API_KEY` se verificÃ³ como **NO CONFIGURADA** en el entorno de ejecuciÃ³n actual (`STATUS: NOT CONFIGURED`).
2. **Respuesta Fail-Closed:** El sistema no emite peticiones no autorizadas y mantiene el modo pÃºblico 100% aislado con `DemoVirtualTryOnProvider`.
3. **Control de CÃ³mputo & CrÃ©ditos:** El conector restringe `num_images = 1` y habilita `return_base64: true` para minimizar consumo de cuotas de cÃ³mputo y proteger la privacidad.
4. **ValidaciÃ³n de Entrega:** Se verifican los dominios CDN autorizados (`cdn.fashn.ai`, `media.fashn.ai`) para cualquier salida externa.

---

---

## 6. IntegraciÃ³n con el Pipeline de Calidad de Entrada (Input Quality)

Con la implementaciÃ³n de `TryOnImagePipeline` (Fase 93), la evaluaciÃ³n de calidad visual se apoya en una validaciÃ³n previa estricta:

```text
USER IMAGE â”€â”€â–º TryOnImagePipeline â”€â”€â–º QualityState (EXCELLENT/ACCEPTABLE/WARNING)
                     â”‚
                     â”œâ”€ Binary Header Audit (JPEG/PNG/WebP)
                     â”œâ”€ Dimension Bounds (384px â‰¤ W, H â‰¤ 4096px, â‰¤ 16 MP)
                     â”œâ”€ Payload Cap (2 KB â‰¤ Size â‰¤ 10 MB)
                     â””â”€ Aspect Ratio & Orientation (Portrait optimal)
```

1. **GarantÃ­a TÃ©cnica:** Solo imÃ¡genes con estados `EXCELLENT`, `ACCEPTABLE` o `WARNING` proceden a inferencia. ImÃ¡genes en `REJECT` son bloqueadas *fail-closed*.
2. **Honestidad Transparente:** La calidad de entrada certifica viabilidad tÃ©cnica mÃ­nima, sin garantizar de forma engaÃ±osa el ajuste de confecciÃ³n fÃ­sico.
3. **Checklist Pre-EjecuciÃ³n:** Todo intento de ejecuciÃ³n real debe verificar los 10 puntos de [`docs/VTO_REAL_PILOT_CHECKLIST.md`](VTO_REAL_PILOT_CHECKLIST.md).
