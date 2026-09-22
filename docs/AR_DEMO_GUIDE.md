# TENTACIONES AI COMMERCE — AR DEMO & VIRTUAL TRY-ON USER GUIDE

============================================================
CANONICAL DOCUMENT: docs/AR_DEMO_GUIDE.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: PUBLIC DEMO & AR EXPERIENCE GUIDE
CORRESPONDING CODE CONTRACT: ITentacionesExperienceService / resolveFitting
============================================================

## 1. Experiencia Central del Probador Virtual

*Tentaciones AI Commerce* (`PROJ-01-TENTACIONES`) integra un probador virtual interactivo (Virtual Try-On) diseñado para asistir al cliente en la selección precisa de talla y calce estético sin necesidad de contacto físico previo con la prenda.

---

## 2. Flujo Completo de la Experiencia (End-to-End)

```text
CATÁLOGO DE MODA
       ↓
DESCUBRIMIENTO ASISTIDO CON IA (Búsqueda en Lenguaje Natural)
       ↓
DETALLE DEL PRODUCTO
       ↓
ACTIVAR PROBADOR VIRTUAL ("👓 Probar en AR")
       ↓
SELECCIONAR PERFIL DEMO (Nova / Sora / Mateo)
       ↓
INSPECCIONAR CALIBRACIÓN BIOMÉTRICA & TALLA RECOMENDADA
       ↓
AGREGAR AL CARRITO CON TALLA SUGERIDA
       ↓
CHECKOUT DEMO SEGURO (Simulación Webpay)
```

---

## 3. Modos de Visualización AR: Real WebXR vs Simulación 2D

Para garantizar que ningún usuario experimente fallas en navegadores de escritorio, laptops sin cámara WebXR o teléfonos antiguos, el sistema implementa una transición automática y transparente:

| Estado del Dispositivo | Modo Activo | Descripción |
| :--- | :--- | :--- |
| **`WEBXR_AVAILABLE`** | *WebXR Espacial Inmersivo* | Proyección 3D interactiva en el espacio físico mediante cámara WebXR y sensores de profundidad. |
| **`WEBXR_UNAVAILABLE`** | *Demo 2D Interactivo de Alta Fidelidad* | Simulación determinista de ajuste corporal basada en siluetas vectoriales y calibración paramétrica. |
| **`CAMERA_UNAVAILABLE`** | *Fallback Seguro* | Renderizado estático con tabla biométrica de tallas y confianza calculada. |

---

## 4. Perfiles Biométricos de Demostración

Los perfiles utilizados en la demo son **perfiles sintéticos controlados** para fines de showcase:

1. **Nova:** Silueta atlética femenina (1.68m, busto: 88cm, cintura: 66cm, caderas: 94cm).
2. **Sora:** Silueta slim unisex (1.75m, pecho: 92cm, cintura: 74cm, caderas: 90cm).
3. **Mateo:** Silueta deportiva masculina (1.82m, pecho: 104cm, cintura: 82cm, caderas: 98cm).

---

## 5. Esquema Canónico de URNs AR

Todos los activos tridimensionales y referencias de fitting se resuelven mediante el estándar:
```text
urn:tentaciones:ar:<category>:<product-slug>
```
Ejemplos verificados:
- `urn:tentaciones:ar:apparel:polera-essential`
- `urn:tentaciones:ar:apparel:silk-evening-dress`
- `urn:tentaciones:ar:footwear:pro-carbon-racer`
