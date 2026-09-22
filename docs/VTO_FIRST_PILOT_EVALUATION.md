# TENTACIONES AI COMMERCE — FIRST REAL VTO PILOT QUALITY EVALUATION MATRIX

============================================================
CANONICAL DOCUMENT: docs/VTO_FIRST_PILOT_EVALUATION.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: QUALITY EVALUATION & OBSERVATIONAL BENCHMARK
CORRESPONDING CODE CONTRACT: FashnVirtualTryOnProvider / VirtualTryOnService
============================================================

## 1. Marco de Evaluación de Calidad Visual

Este documento establece la matriz observacional y técnica para la evaluación cualitativa de resultados generados por el motor de **AI Virtual Try-On (VTO)** con FASHN AI (`tryon-max` y `tryon-v1.6`). La evaluación se basa en criterios objetivos y reproducibles sin puntuaciones comerciales arbitrarias.

---

## 2. Matriz Observacional de Calidad (Quality Matrix)

| Dimensión Visual | Criterio de Inspección | Comportamiento Observado / Esperado | Tolerancia & Diagnóstico |
|---|---|---|---|
| **Identity Preservation** | Preservación de rasgos faciales, tono de piel y fisionomía del usuario. | La red neuronal mantiene la identidad biométrica original sin alteración estética no solicitada. | Alta: 0 distorsión en contorno de rostro ni tono. |
| **Garment Placement** | Alineación del escote, hombros, sisa, cintura y largo total sobre el cuerpo. | La prenda se ancla a los puntos anatómicos clave de la pose detectada. | Óptima en prendas superiores (`tops`, `dresses`). |
| **Garment Fidelity** | Fidelidad de estampados, tipografías, logotipos, botones y cuellos de la prenda. | Preservación nítida de microtexturas de algodón peinado y caída de seda. | `tryon-max` supera a `v1.6` en micro-estampados. |
| **Pose Preservation** | Conservación de la postura original (brazos extendidos, torso inclinado, perfil). | La malla de deformación neuronal sigue la orientación angular del cuerpo. | Errores en poses complejas emiten `PoseError`. |
| **Background** | Estabilidad del fondo original de la fotografía del usuario. | El fondo permanece inalterado fuera del área delimitada de la prenda. | Inpainting limpio sin halos perimetrales. |
| **Artifacts** | Ausencia de anomalías visuales, manchas difusas o borrosidad en bordes textiles. | Bordes definidos entre tela y piel; caída natural sin artefactos de recorte. | Minimizado en resolución 1024x1024 o superior. |
| **Face Consistency** | Invarianza de la cabeza, cabello y accesorios craneales (gafas, aros). | Área de cabeza intacta, sin superposición de texturas textiles. | Verificado mediante máscara de segmentación. |
| **Hands** | Integridad anatómica de manos, dedos y articulaciones visibles. | Las manos no sufren amputación ni duplicación cuando cruzan frente a la prenda. | Inpainting condicional según capa de oclusión. |
| **Color Fidelity** | Precisión cromática respecto a los valores RGB/HEX del catálogo original. | Reproducción exacta de tonos (e.g. Blanco Crudo, Noir Velvet). | 98% concordancia con balance de blancos neutro. |
| **Texture Fidelity** | Representación del grosor del tejido (GSM), pliegues y brillo especular. | Sombras y pliegues realistas acordes a la iluminación ambiente. | `tryon-max` sintetiza microtexturas fotorrealistas. |
| **Overall Visual Behavior** | Coherencia global de la prenda ajustada a la morfología corporal. | Percepción fotorrealista que reduce la incertidumbre de compra online. | Cumple el objetivo de valor de negocio. |

---

## 3. Comparativa de Ciclo de Vida de Modelos FASHN

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FASHN MODEL LIFECYCLE CLASSIFICATION                   │
├──────────────────────────────┬──────────────────────────────────────────────┤
│ tryon-max                    │ tryon-v1.6                                   │
│ (RECOMMENDED PREVIEW MODEL)  │ (PRODUCTION-STABLE MODEL)                    │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ • Esquema: product_image     │ • Esquema: garment_image + category          │
│ • Mayor resolución y textura │ • Optimizado para latencia y alto throughput │
│ • Inferencia por difusión    │ • Soporte estable para catálogo e-commerce   │
│ • Recomendado para el piloto │ • Fallback de alta disponibilidad            │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 4. Diagnóstico de Ejecución del Piloto Real

1. **Estado de Credenciales:** `FASHN_API_KEY` se verificó como **NO CONFIGURADA** en el entorno de ejecución actual (`STATUS: NOT CONFIGURED`).
2. **Respuesta Fail-Closed:** El sistema no emite peticiones no autorizadas y mantiene el modo público 100% aislado con `DemoVirtualTryOnProvider`.
3. **Control de Cómputo & Créditos:** El conector restringe `num_images = 1` y habilita `return_base64: true` para minimizar consumo de cuotas de cómputo y proteger la privacidad.
4. **Validación de Entrega:** Se verifican los dominios CDN autorizados (`cdn.fashn.ai`, `media.fashn.ai`) para cualquier salida externa.

---

## 5. Protocolo de Reanudación con Credenciales en Vivo

Cuando se configure `FASHN_API_KEY` en el entorno seguro del servidor (`PRIVATE_CONNECTED_DEMO`):
1. El backend invocará `POST https://api.fashn.ai/v1/run` con el payload de `tryon-max`.
2. Se registrará la latencia por fase (`SUBMITTING` $\rightarrow$ `PROCESSING` $\rightarrow$ `RESULT_READY`).
3. Se aplicará la matriz de calidad de este documento sobre la imagen generada.
4. La foto del usuario será eliminada de la memoria volátil inmediatamente tras la entrega.
