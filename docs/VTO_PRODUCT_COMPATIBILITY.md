# TENTACIONES AI COMMERCE â€” PRODUCT & CATEGORY COMPATIBILITY MATRIX (VTO)

============================================================
CANONICAL DOCUMENT: docs/VTO_PRODUCT_COMPATIBILITY.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: CATALOG & PRODUCT SPECIFICATION
CORRESPONDING CODE CONTRACT: vto-capability-resolver.ts / resolveVTOCapability
============================================================

## 1. Alcance de Compatibilidad por CategorÃ­a de Producto

El motor de **Virtual Try-On basado en visiÃ³n artificial e IA generativa** estÃ¡ optimizado especÃ­ficamente para prendas textiles superiores, inferiores y de cuerpo entero. La siguiente matriz describe la compatibilidad de cada categorÃ­a en el catÃ¡logo de *Tentaciones*:

| CategorÃ­a en CatÃ¡logo | Estado VTO (IA) | Mapeo de CategorÃ­a TryOn | Modalidad Visual Principal |
|---|---|---|---|
| **Poleras / Camisetas** (`poleras`) | **COMPATIBLE** | `tops` | AI Virtual Try-On + 3D Viewer |
| **Camisas & Blusas** (`camisas`) | **COMPATIBLE** | `tops` | AI Virtual Try-On + 3D Viewer |
| **Polerones & Hoodies** (`polerones`) | **COMPATIBLE** | `tops` | AI Virtual Try-On + 3D Viewer |
| **Chaquetas & Abrigos** (`chaquetas`) | **COMPATIBLE** | `outerwear` | AI Virtual Try-On + 3D Viewer |
| **Vestidos & Enteritos** (`vestidos`) | **COMPATIBLE** | `dresses` | AI Virtual Try-On + 3D Viewer |
| **Pantalones & Jeans** (`pantalones`) | **COMPATIBLE** | `pants` | AI Virtual Try-On + 3D Viewer |
| **Faldas** (`faldas`) | **COMPATIBLE** | `skirts` | AI Virtual Try-On + 3D Viewer |
| **Calzado & Zapatillas** (`calzado`) | *NO APLICABLE A IA 2D* | `unsupported` | **WebXR Spatial AR & 3D Viewer** |
| **Accesorios & JoyerÃ­a** (`accesorios`) | *NO APLICABLE A IA 2D* | `unsupported` | **3D Viewer Orbitable** |

---

## 2. Pautas de PreparaciÃ³n de ImÃ¡genes de Prenda (Garment Asset Prep)

Para maximizar la fidelidad y realismo de la sÃ­ntesis textil con IA generativa, las imÃ¡genes de catÃ¡logo deben cumplir con las siguientes especificaciones tÃ©cnicas:

1. **Tipo de FotografÃ­a**: *Flat lay* (prenda extendida sobre superficie neutra) o *Ghost Mannequin* (maniquÃ­ invisible estilizado).
2. **Formato & Transparencia**: PNG con canal alfa transparente o fondo blanco puro (`#FFFFFF`).
3. **ResoluciÃ³n MÃ­nima**: 1024 x 1024 pÃ­xeles (Ã³ptimo 1536 x 2048 para preservaciÃ³n de microtexturas).
4. **IluminaciÃ³n**: Difusa y homogÃ©nea, sin sombras duras ni destellos especulares artificiales.
5. **ComposiciÃ³n**: Prenda centrada con un margen perimetral del 8-10% respecto a los bordes del lienzo.

---

## 3. Comportamiento en la Interfaz (UI Fallback)

* Para productos con categorÃ­a compatible (`poleras`, `vestidos`, `chaquetas`, etc.), el catÃ¡logo y la ficha de detalle renderizan el botÃ³n **`[âœ¨ Probar con IA]`**.
* Para productos no compatibles con sÃ­ntesis textil 2D (`calzado`, `accesorios`), el botÃ³n de VTO se oculta automÃ¡ticamente, priorizando las opciones **`[ðŸ‘“ AR]`** y **`[ðŸ§Š 3D]`** para evitar confusiÃ³n en la experiencia de compra.
