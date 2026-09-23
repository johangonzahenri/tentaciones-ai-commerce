# CANONICAL DOCUMENT: VTO INPUT QUALITY ENGINE & VALIDATION SPECIFICATION

STATUS: CERTIFIED
VERSION: 1.6.3
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Computer Vision & Quality Assurance Engineer

---

## 1. OBJETIVO

Este documento define la taxonomÃ­a de estados de calidad, las reglas de dimensionamiento y la matriz de retroalimentaciÃ³n hacia el usuario para el motor de **Virtual Try-On (VTO)** en Tentaciones AI Commerce.

---

## 2. TAXONOMÃA DE ESTADOS DE CALIDAD

En lugar de un modelo binario simplista (`true/false`), el motor implementa 5 estados rigurosos:

| Estado de Calidad | Criterio TÃ©cnico | Comportamiento del Motor |
| :--- | :--- | :--- |
| **`EXCELLENT`** | FotografÃ­a vertical (aspect ratio $\ge 1.25$), resoluciÃ³n $\ge 768\times 1024$, peso $\ge 50\text{ KB}$, cabecera binaria Ã­ntegra. | Habilitado para generaciÃ³n inmediata con alta fidelidad esperada. |
| **`ACCEPTABLE`** | Cumple lÃ­mites mÃ­nimos ($\ge 384\times 512$), orientaciÃ³n vertical leve o formato compatible. | Habilitado para generaciÃ³n; cumple condiciones tÃ©cnicas mÃ­nimas. |
| **`WARNING`** | FotografÃ­a en formato cuadrado u horizontal ($AR < 1.0$) o posibles recortes de torso. | Habilitado con advertencia explÃ­cita sobre precisiÃ³n visual. |
| **`REJECT`** | Payload corrupto, tamaÃ±o $<2\text{ KB}$ o $>10\text{ MB}$, resoluciÃ³n $<384\times 512$, o violaciÃ³n de tipo binario. | Bloqueado fail-closed. No se envÃ­a al proveedor de IA. |
| **`UNKNOWN`** | Formato no reconocido o fallo de parseo en el flujo de entrada. | Bloqueado hasta nueva carga por parte del usuario. |

---

## 3. ESPECIFICACIÃ“N Y JUSTIFICACIÃ“N DE LÃMITES TÃ‰CNICOS

```text
+----------------------+--------------------+---------------------------------------------------------------+
| ParÃ¡metro            | LÃ­mite Fijado      | JustificaciÃ³n TÃ©cnica                                         |
+----------------------+--------------------+---------------------------------------------------------------+
| MIN_WIDTH            | 384 px             | Umbral mÃ­nimo para detecciÃ³n de keypoints corporales.         |
| MIN_HEIGHT           | 512 px             | MÃ­nimo para asegurar cobertura visual del torso/cuerpo.       |
| MAX_WIDTH            | 4096 px            | LÃ­mite defensivo contra descompresiÃ³n de imÃ¡genes masivas.   |
| MAX_HEIGHT           | 4096 px            | PrevenciÃ³n de deformaciÃ³n extrema de aspect ratio.            |
| MIN_FILE_SIZE_BYTES  | 2 KB (2048 B)      | Previene archivos vacÃ­os, truncados o corruptos.             |
| MAX_FILE_SIZE_BYTES  | 10 MB              | Permite fotos de alta calidad de smartphones protegiendo RAM. |
| MAX_PIXEL_COUNT      | 16 MegapÃ­xeles     | Techo seguro de memoria para tensores de difusiÃ³n.            |
+----------------------+--------------------+---------------------------------------------------------------+
```

---

## 4. MENSAJES Y REGLA DE HONESTIDAD TÃ‰CNICA

Bajo el principio de transparencia con el cliente, el sistema jamÃ¡s promete resultados irreales de calce fÃ­sico:

### Regla de Oro
> La validaciÃ³n tÃ©cnica certifica que **la imagen cumple las condiciones tÃ©cnicas mÃ­nimas para intentar la generaciÃ³n**, pero **NO garantiza el ajuste fÃ­sico de confecciÃ³n**.

### Mensajes BilingÃ¼es hacia el Usuario

```text
[EXCELLENT / ACCEPTABLE]:
- es: "Imagen lista para la prueba virtual. La imagen cumple las condiciones tÃ©cnicas mÃ­nimas para intentar la generaciÃ³n."
- en: "Image ready for virtual try-on. The image meets the minimum technical conditions to attempt generation."

[WARNING]:
- es: "La imagen puede producir un resultado menos preciso. Se recomienda fotografÃ­a vertical y buena iluminaciÃ³n."
- en: "The image may produce a less accurate result. A vertical photograph with good lighting is recommended."

[REJECT]:
- es: "No podemos utilizar esta imagen para la prueba virtual. Prueba con una fotografÃ­a de cuerpo completo y buena iluminaciÃ³n."
- en: "We cannot use this image for virtual try-on. Please try with a full-body photo with good lighting."
```

---

## 5. RECOMENDACIONES VISUALES

Para optimizar la inferencia, la interfaz presenta 5 pautas directas:
1. **Cuerpo visible**: Torso o cuerpo completo segÃºn la prenda elegida.
2. **IluminaciÃ³n uniforme**: Evitar sombras densas o contraluces extremos.
3. **Persona centrada**: Postura frontal y recta.
4. **Fondo simple**: Fondo liso o con bajo contraste de elementos distractores.
5. **Postura natural**: Brazos ligeramente separados sin tapar el torso.
