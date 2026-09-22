# TENTACIONES AI COMMERCE — PRODUCT & CATEGORY COMPATIBILITY MATRIX (VTO)

============================================================
CANONICAL DOCUMENT: docs/VTO_PRODUCT_COMPATIBILITY.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: CATALOG & PRODUCT SPECIFICATION
CORRESPONDING CODE CONTRACT: vto-capability-resolver.ts / resolveVTOCapability
============================================================

## 1. Alcance de Compatibilidad por Categoría de Producto

El motor de **Virtual Try-On basado en visión artificial e IA generativa** está optimizado específicamente para prendas textiles superiores, inferiores y de cuerpo entero. La siguiente matriz describe la compatibilidad de cada categoría en el catálogo de *Tentaciones*:

| Categoría en Catálogo | Estado VTO (IA) | Mapeo de Categoría TryOn | Modalidad Visual Principal |
|---|---|---|---|
| **Poleras / Camisetas** (`poleras`) | **COMPATIBLE** | `tops` | AI Virtual Try-On + 3D Viewer |
| **Camisas & Blusas** (`camisas`) | **COMPATIBLE** | `tops` | AI Virtual Try-On + 3D Viewer |
| **Polerones & Hoodies** (`polerones`) | **COMPATIBLE** | `tops` | AI Virtual Try-On + 3D Viewer |
| **Chaquetas & Abrigos** (`chaquetas`) | **COMPATIBLE** | `outerwear` | AI Virtual Try-On + 3D Viewer |
| **Vestidos & Enteritos** (`vestidos`) | **COMPATIBLE** | `dresses` | AI Virtual Try-On + 3D Viewer |
| **Pantalones & Jeans** (`pantalones`) | **COMPATIBLE** | `pants` | AI Virtual Try-On + 3D Viewer |
| **Faldas** (`faldas`) | **COMPATIBLE** | `skirts` | AI Virtual Try-On + 3D Viewer |
| **Calzado & Zapatillas** (`calzado`) | *NO APLICABLE A IA 2D* | `unsupported` | **WebXR Spatial AR & 3D Viewer** |
| **Accesorios & Joyería** (`accesorios`) | *NO APLICABLE A IA 2D* | `unsupported` | **3D Viewer Orbitable** |

---

## 2. Pautas de Preparación de Imágenes de Prenda (Garment Asset Prep)

Para maximizar la fidelidad y realismo de la síntesis textil con IA generativa, las imágenes de catálogo deben cumplir con las siguientes especificaciones técnicas:

1. **Tipo de Fotografía**: *Flat lay* (prenda extendida sobre superficie neutra) o *Ghost Mannequin* (maniquí invisible estilizado).
2. **Formato & Transparencia**: PNG con canal alfa transparente o fondo blanco puro (`#FFFFFF`).
3. **Resolución Mínima**: 1024 x 1024 píxeles (óptimo 1536 x 2048 para preservación de microtexturas).
4. **Iluminación**: Difusa y homogénea, sin sombras duras ni destellos especulares artificiales.
5. **Composición**: Prenda centrada con un margen perimetral del 8-10% respecto a los bordes del lienzo.

---

## 3. Comportamiento en la Interfaz (UI Fallback)

* Para productos con categoría compatible (`poleras`, `vestidos`, `chaquetas`, etc.), el catálogo y la ficha de detalle renderizan el botón **`[✨ Probar con IA]`**.
* Para productos no compatibles con síntesis textil 2D (`calzado`, `accesorios`), el botón de VTO se oculta automáticamente, priorizando las opciones **`[👓 AR]`** y **`[🧊 3D]`** para evitar confusión en la experiencia de compra.
