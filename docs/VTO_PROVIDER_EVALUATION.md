# TENTACIONES AI COMMERCE — VIRTUAL TRY-ON PROVIDER EVALUATION & BENCHMARK

============================================================
CANONICAL DOCUMENT: docs/VTO_PROVIDER_EVALUATION.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: TECHNICAL & VENDOR EVALUATION
CORRESPONDING CODE CONTRACT: IVirtualTryOnProvider / FashnVirtualTryOnProvider
============================================================

## 1. Contexto de Selección de Proveedores

El ecosistema de visión computacional y comercio electrónico ofrece distintas soluciones para probadores virtuales. Para estructurar una integración escalable y modular, *Tentaciones AI Commerce* evaluó exhaustivamente tres líderes de la industria en sus respectivos nichos:

1. **FASHN AI**: Especialista en generación de imágenes fotorrealistas de ropa basada en difusión neuronal (*AI Generative Virtual Try-On*).
2. **Perfect Corp (YouCam / AgileFace)**: Especialista en realidad aumentada 3D facial, accesorios y calzado en tiempo real.
3. **Banuba**: Especialista en SDKs WebAR y de visión facial en tiempo real para joyería y maquillaje.

---

## 2. Matriz Comparativa de Proveedores

| Criterio de Evaluación | FASHN AI | Perfect Corp | Banuba SDK |
|---|---|---|---|
| **Especialidad Principal** | Indumentaria & Ropa (Tops, Bottoms, Dresses) | Belleza, Joyería, Calzado AR | Belleza, Filtros Faciales, Sombreros |
| **Tipo de Tecnología** | Generativa / Difusión Neuronal (Image-to-Image) | WebGL / WebXR Tracking 3D | WebGL Face Mesh Tracking |
| **Calidad Textil & Caída** | Excelente (Fotorealismo con sombras y pliegues) | Regular en ropa suelta; Alta en calzado rígido | Regular en ropa; Alta en rostro/cabeza |
| **Tiempo de Respuesta (Latencia)** | 5 a 15 segundos (Procesamiento por difusión) | 16 a 33 ms (60 fps en cliente) | 16 a 33 ms (60 fps en cliente) |
| **Entrada Requerida** | Foto 2D del usuario + Foto de la prenda | Stream de cámara WebRTC + Modelo 3D | Stream de cámara WebRTC + Asset 3D |
| **Requisitos de GPU Cliente** | Nulo (Inferencia 100% en la nube del proveedor) | Medio/Alto (Shader execution en WebGL) | Medio (Shader execution en WebGL) |
| **Modelo de Precios** | Pago por generación / API Credits (~$0.04 - $0.08 / run) | Licencia SaaS Enterprise anual + setup fee | Licencia SDK anual por dominio/MAU |
| **Facilidad de Integración REST** | Muy Alta (Endpoints HTTP asíncronos JSON estándar) | Media/Baja (SDK propietario complejo) | Media (SDK WebAssembly propietario) |
| **Idoneidad para Catálogo Textil** | **ÓPTIMA (95% compatibilidad con prendas de moda)** | Secundaria para indumentaria | No recomendada para prendas de cuerpo |
| **Soporte de Avatares Sintéticos** | Nativo (Inferencia sobre modelos de estudio) | Requiere mallado 3D previo | Requiere avatar 3D rigged |

---

## 3. Justificación de FASHN AI como Proveedor Piloto

Se seleccionó **FASHN AI** como el primer conector real para *Tentaciones AI Commerce* por las siguientes razones de arquitectura y producto:

1. **Foco en Indumentaria Textil Real**: A diferencia de los motores de mallado rígido que distorsionan vestidos y poleras, la red neuronal de difusión de FASHN preserva estampados, texturas de algodón/seda y costuras complejas adaptándose a la pose del usuario.
2. **API Asíncrona Limpia y Predecible**: La secuencia `/v1/run` -> `/v1/status/{id}` permite desacoplar la carga de trabajo en el servidor con sondeo reactivo no bloqueante.
3. **Compatibilidad con Avatares Sintéticos y Fotos Reales**: Permite una experiencia dual donde el usuario puede probarse la ropa tanto en modelos prediseñados (Nova, Sora, Mateo) como en su propia fotografía.
4. **Independencia de Dispositivo**: Al ejecutarse en la nube del proveedor, los usuarios con smartphones de gama baja disfrutan de la misma calidad visual que aquellos con dispositivos de última generación.

---

## 4. Hoja de Ruta para Integración de Otros Proveedores

La interfaz modular `IVirtualTryOnProvider` permite sumar proveedores adicionales en fases futuras sin alterar el frontend ni el core de la tienda:

* **Fase Futura — Footwear AR VTO (Perfect Corp o WebXR nativo)**: Para calzado (`calzado`), donde el tracking de pies en tiempo real por WebXR o SDK especializado aporta mayor valor que una imagen estática.
* **Fase Futura — Accessories & Eyewear (Banuba / FaceMesh)**: Para gafas de sol y sombreros (`accesorios`), donde la latencia de 60 fps en cámara en vivo es indispensable.
