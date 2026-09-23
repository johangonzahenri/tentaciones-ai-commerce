# TENTACIONES AI COMMERCE â€” AR DEMO & VIRTUAL TRY-ON USER GUIDE

============================================================
CANONICAL DOCUMENT: docs/AR_DEMO_GUIDE.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: PUBLIC DEMO & AR EXPERIENCE GUIDE
CORRESPONDING CODE CONTRACT: ITentacionesExperienceService / resolveFitting
============================================================

## 1. Experiencia Central del Probador Virtual

*Tentaciones AI Commerce* (`PROJ-01-TENTACIONES`) integra un probador virtual interactivo (Virtual Try-On) diseÃ±ado para asistir al cliente en la selecciÃ³n precisa de talla y calce estÃ©tico sin necesidad de contacto fÃ­sico previo con la prenda.

---

## 2. Flujo Completo de la Experiencia (End-to-End)

```text
CATÃLOGO DE MODA
       â†“
DESCUBRIMIENTO ASISTIDO CON IA (BÃºsqueda en Lenguaje Natural)
       â†“
DETALLE DEL PRODUCTO
       â†“
ACTIVAR PROBADOR VIRTUAL ("ðŸ‘“ Probar en AR")
       â†“
SELECCIONAR PERFIL DEMO (Nova / Sora / Mateo)
       â†“
INSPECCIONAR CALIBRACIÃ“N BIOMÃ‰TRICA & TALLA RECOMENDADA
       â†“
AGREGAR AL CARRITO CON TALLA SUGERIDA
       â†“
CHECKOUT DEMO SEGURO (SimulaciÃ³n Webpay)
```

---

## 3. Modos de VisualizaciÃ³n AR: Real WebXR vs SimulaciÃ³n 2D

Para garantizar que ningÃºn usuario experimente fallas en navegadores de escritorio, laptops sin cÃ¡mara WebXR o telÃ©fonos antiguos, el sistema implementa una transiciÃ³n automÃ¡tica y transparente:

| Estado del Dispositivo | Modo Activo | DescripciÃ³n |
| :--- | :--- | :--- |
| **`WEBXR_AVAILABLE`** | *WebXR Espacial Inmersivo* | ProyecciÃ³n 3D interactiva en el espacio fÃ­sico mediante cÃ¡mara WebXR y sensores de profundidad. |
| **`WEBXR_UNAVAILABLE`** | *Demo 2D Interactivo de Alta Fidelidad* | SimulaciÃ³n determinista de ajuste corporal basada en siluetas vectoriales y calibraciÃ³n paramÃ©trica. |
| **`CAMERA_UNAVAILABLE`** | *Fallback Seguro* | Renderizado estÃ¡tico con tabla biomÃ©trica de tallas y confianza calculada. |

---

## 4. Perfiles BiomÃ©tricos de DemostraciÃ³n

Los perfiles utilizados en la demo son **perfiles sintÃ©ticos controlados** para fines de showcase:

1. **Nova:** Silueta atlÃ©tica femenina (1.68m, busto: 88cm, cintura: 66cm, caderas: 94cm).
2. **Sora:** Silueta slim unisex (1.75m, pecho: 92cm, cintura: 74cm, caderas: 90cm).
3. **Mateo:** Silueta deportiva masculina (1.82m, pecho: 104cm, cintura: 82cm, caderas: 98cm).

---

## 5. Esquema CanÃ³nico de URNs AR

Todos los activos tridimensionales y referencias de fitting se resuelven mediante el estÃ¡ndar:
```text
urn:tentaciones:ar:<category>:<product-slug>
```
Ejemplos verificados:
- `urn:tentaciones:ar:apparel:polera-essential`
- `urn:tentaciones:ar:apparel:silk-evening-dress`
- `urn:tentaciones:ar:footwear:pro-carbon-racer`
