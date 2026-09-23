# TENTACIONES AI COMMERCE â€” VIRTUAL TRY-ON PROVIDER EVALUATION & BENCHMARK

============================================================
CANONICAL DOCUMENT: docs/VTO_PROVIDER_EVALUATION.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: TECHNICAL & VENDOR EVALUATION
CORRESPONDING CODE CONTRACT: IVirtualTryOnProvider / FashnVirtualTryOnProvider
============================================================

## 1. Contexto de SelecciÃ³n de Proveedores

El ecosistema de visiÃ³n computacional y comercio electrÃ³nico ofrece distintas soluciones para probadores virtuales. Para estructurar una integraciÃ³n escalable y modular, *Tentaciones AI Commerce* evaluÃ³ exhaustivamente tres lÃ­deres de la industria en sus respectivos nichos:

1. **FASHN AI**: Especialista en generaciÃ³n de imÃ¡genes fotorrealistas de ropa basada en difusiÃ³n neuronal (*AI Generative Virtual Try-On*).
2. **Perfect Corp (YouCam / AgileFace)**: Especialista en realidad aumentada 3D facial, accesorios y calzado en tiempo real.
3. **Banuba**: Especialista en SDKs WebAR y de visiÃ³n facial en tiempo real para joyerÃ­a y maquillaje.

---

## 2. Matriz Comparativa de Proveedores

| Criterio de EvaluaciÃ³n | FASHN AI | Perfect Corp | Banuba SDK |
|---|---|---|---|
| **Especialidad Principal** | Indumentaria & Ropa (Tops, Bottoms, Dresses) | Belleza, JoyerÃ­a, Calzado AR | Belleza, Filtros Faciales, Sombreros |
| **Tipo de TecnologÃ­a** | Generativa / DifusiÃ³n Neuronal (Image-to-Image) | WebGL / WebXR Tracking 3D | WebGL Face Mesh Tracking |
| **Calidad Textil & CaÃ­da** | Excelente (Fotorealismo con sombras y pliegues) | Regular en ropa suelta; Alta en calzado rÃ­gido | Regular en ropa; Alta en rostro/cabeza |
| **Tiempo de Respuesta (Latencia)** | 5 a 15 segundos (Procesamiento por difusiÃ³n) | 16 a 33 ms (60 fps en cliente) | 16 a 33 ms (60 fps en cliente) |
| **Entrada Requerida** | Foto 2D del usuario + Foto de la prenda | Stream de cÃ¡mara WebRTC + Modelo 3D | Stream de cÃ¡mara WebRTC + Asset 3D |
| **Requisitos de GPU Cliente** | Nulo (Inferencia 100% en la nube del proveedor) | Medio/Alto (Shader execution en WebGL) | Medio (Shader execution en WebGL) |
| **Modelo de Precios** | Pago por generaciÃ³n / API Credits (~$0.04 - $0.08 / run) | Licencia SaaS Enterprise anual + setup fee | Licencia SDK anual por dominio/MAU |
| **Facilidad de IntegraciÃ³n REST** | Muy Alta (Endpoints HTTP asÃ­ncronos JSON estÃ¡ndar) | Media/Baja (SDK propietario complejo) | Media (SDK WebAssembly propietario) |
| **Idoneidad para CatÃ¡logo Textil** | **Ã“PTIMA (95% compatibilidad con prendas de moda)** | Secundaria para indumentaria | No recomendada para prendas de cuerpo |
| **Soporte de Avatares SintÃ©ticos** | Nativo (Inferencia sobre modelos de estudio) | Requiere mallado 3D previo | Requiere avatar 3D rigged |

---

## 3. JustificaciÃ³n de FASHN AI como Proveedor Piloto & Ciclo de Vida de Modelos

Se seleccionÃ³ **FASHN AI** como el primer conector real para *Tentaciones AI Commerce* por las siguientes razones de arquitectura y producto:

1. **Foco en Indumentaria Textil Real**: A diferencia de los motores de mallado rÃ­gido que distorsionan vestidos y poleras, la red neuronal de difusiÃ³n de FASHN preserva estampados, texturas de algodÃ³n/seda y costuras complejas adaptÃ¡ndose a la pose del usuario.
2. **API AsÃ­ncrona Limpia y Predecible**: La secuencia `/v1/run` -> `/v1/status/{id}` permite desacoplar la carga de trabajo en el servidor con sondeo reactivo no bloqueante.
3. **Compatibilidad con Avatares SintÃ©ticos y Fotos Reales**: Permite una experiencia dual donde el usuario puede probarse la ropa tanto en modelos prediseÃ±ados (Nova, Sora, Mateo) como en su propia fotografÃ­a.
4. **Independencia de Dispositivo**: Al ejecutarse en la nube del proveedor, los usuarios con smartphones de gama baja disfrutan de la misma calidad visual que aquellos con dispositivos de Ãºltima generaciÃ³n.

### ClasificaciÃ³n de Ciclo de Vida de Modelos Oficiales FASHN:
* **`tryon-max` (Recommended Preview Model)**: Modelo de Ãºltima generaciÃ³n recomendado para evaluaciÃ³n de alta fidelidad visual y microtexturas; se encuentra en fase de ciclo de vida *Preview*. Utiliza el esquema `product_image` + `model_image`.
* **`tryon-v1.6` (Production-Stable Model)**: Modelo consolidado y estable (*Stable*) optimizado para alto volumen de peticiones y latencia reducida en e-commerce. Utiliza el esquema `garment_image` + `model_image` + `category`.

---

## 4. Hoja de Ruta para IntegraciÃ³n de Otros Proveedores

La interfaz modular `IVirtualTryOnProvider` permite sumar proveedores adicionales en fases futuras sin alterar el frontend ni el core de la tienda:

* **Fase Futura â€” Footwear AR VTO (Perfect Corp o WebXR nativo)**: Para calzado (`calzado`), donde el tracking de pies en tiempo real por WebXR o SDK especializado aporta mayor valor que una imagen estÃ¡tica.
* **Fase Futura â€” Accessories & Eyewear (Banuba / FaceMesh)**: Para gafas de sol y sombreros (`accesorios`), donde la latencia de 60 fps en cÃ¡mara en vivo es indispensable.
