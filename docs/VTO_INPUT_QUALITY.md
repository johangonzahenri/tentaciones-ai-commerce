# CANONICAL DOCUMENT: VTO INPUT QUALITY ENGINE & VALIDATION SPECIFICATION

STATUS: CERTIFIED
VERSION: 1.6.3
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Computer Vision & Quality Assurance Engineer

---

## 1. OBJETIVO

Este documento define la taxonomía de estados de calidad, las reglas de dimensionamiento y la matriz de retroalimentación hacia el usuario para el motor de **Virtual Try-On (VTO)** en Tentaciones AI Commerce.

---

## 2. TAXONOMÍA DE ESTADOS DE CALIDAD

En lugar de un modelo binario simplista (`true/false`), el motor implementa 5 estados rigurosos:

| Estado de Calidad | Criterio Técnico | Comportamiento del Motor |
| :--- | :--- | :--- |
| **`EXCELLENT`** | Fotografía vertical (aspect ratio $\ge 1.25$), resolución $\ge 768\times 1024$, peso $\ge 50\text{ KB}$, cabecera binaria íntegra. | Habilitado para generación inmediata con alta fidelidad esperada. |
| **`ACCEPTABLE`** | Cumple límites mínimos ($\ge 384\times 512$), orientación vertical leve o formato compatible. | Habilitado para generación; cumple condiciones técnicas mínimas. |
| **`WARNING`** | Fotografía en formato cuadrado u horizontal ($AR < 1.0$) o posibles recortes de torso. | Habilitado con advertencia explícita sobre precisión visual. |
| **`REJECT`** | Payload corrupto, tamaño $<2\text{ KB}$ o $>10\text{ MB}$, resolución $<384\times 512$, o violación de tipo binario. | Bloqueado fail-closed. No se envía al proveedor de IA. |
| **`UNKNOWN`** | Formato no reconocido o fallo de parseo en el flujo de entrada. | Bloqueado hasta nueva carga por parte del usuario. |

---

## 3. ESPECIFICACIÓN Y JUSTIFICACIÓN DE LÍMITES TÉCNICOS

```text
+----------------------+--------------------+---------------------------------------------------------------+
| Parámetro            | Límite Fijado      | Justificación Técnica                                         |
+----------------------+--------------------+---------------------------------------------------------------+
| MIN_WIDTH            | 384 px             | Umbral mínimo para detección de keypoints corporales.         |
| MIN_HEIGHT           | 512 px             | Mínimo para asegurar cobertura visual del torso/cuerpo.       |
| MAX_WIDTH            | 4096 px            | Límite defensivo contra descompresión de imágenes masivas.   |
| MAX_HEIGHT           | 4096 px            | Prevención de deformación extrema de aspect ratio.            |
| MIN_FILE_SIZE_BYTES  | 2 KB (2048 B)      | Previene archivos vacíos, truncados o corruptos.             |
| MAX_FILE_SIZE_BYTES  | 10 MB              | Permite fotos de alta calidad de smartphones protegiendo RAM. |
| MAX_PIXEL_COUNT      | 16 Megapíxeles     | Techo seguro de memoria para tensores de difusión.            |
+----------------------+--------------------+---------------------------------------------------------------+
```

---

## 4. MENSAJES Y REGLA DE HONESTIDAD TÉCNICA

Bajo el principio de transparencia con el cliente, el sistema jamás promete resultados irreales de calce físico:

### Regla de Oro
> La validación técnica certifica que **la imagen cumple las condiciones técnicas mínimas para intentar la generación**, pero **NO garantiza el ajuste físico de confección**.

### Mensajes Bilingües hacia el Usuario

```text
[EXCELLENT / ACCEPTABLE]:
- es: "Imagen lista para la prueba virtual. La imagen cumple las condiciones técnicas mínimas para intentar la generación."
- en: "Image ready for virtual try-on. The image meets the minimum technical conditions to attempt generation."

[WARNING]:
- es: "La imagen puede producir un resultado menos preciso. Se recomienda fotografía vertical y buena iluminación."
- en: "The image may produce a less accurate result. A vertical photograph with good lighting is recommended."

[REJECT]:
- es: "No podemos utilizar esta imagen para la prueba virtual. Prueba con una fotografía de cuerpo completo y buena iluminación."
- en: "We cannot use this image for virtual try-on. Please try with a full-body photo with good lighting."
```

---

## 5. RECOMENDACIONES VISUALES

Para optimizar la inferencia, la interfaz presenta 5 pautas directas:
1. **Cuerpo visible**: Torso o cuerpo completo según la prenda elegida.
2. **Iluminación uniforme**: Evitar sombras densas o contraluces extremos.
3. **Persona centrada**: Postura frontal y recta.
4. **Fondo simple**: Fondo liso o con bajo contraste de elementos distractores.
5. **Postura natural**: Brazos ligeramente separados sin tapar el torso.
