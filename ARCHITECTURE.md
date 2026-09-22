# Arquitectura Técnica — Tentaciones AI Commerce

---

## 1. Principios de Diseño

1. **Desacoplamiento Estricto**: Tentaciones es una aplicación consumidora (**Child Application**). No aloja ni duplica el motor central de agentes, la base de datos de eventos ni el gateway de políticas de seguridad.
2. **Defensa en Profundidad & Seguridad DOM**: El código frontend en `public/app.js` aplica una política estricta de **0 innerHTML, 0 outerHTML, 0 eval() y 0 document.write()**, construyendo la interfaz exclusivamente mediante APIs seguras del DOM.
3. **Resiliencia & Dual-State Operation**: Toda capacidad de IA (`product.discovery`, `product.recommendation`, `product.compare`, `cart.assistance`, `ar.fitting_room`) cuenta con una ruta primaria vía `PlatformClient` y una ruta secundaria determinista en `TentacionesCommerceEngine` (`LOCAL_FALLBACK`).

---

## 2. Diagrama de Capas

```text
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN                    │
│      Storefront SPA (HTML5 / Vanilla JS / CSS Variables)    │
│            Catálogo • Modal AR • Drawer Carrito             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ (Fetch / REST)
┌─────────────────────────────────────────────────────────────┐
│                       CAPA DE SERVIDOR                       │
│    Node.js Native Server (src/server.ts • 0 Runtime Deps)    │
│        Enrutador de API • Servidor de Estáticos • CSP        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE ADAPTADOR                       │
│               TentacionesPlatformAdapter                     │
│    Conmutación Automática (Platform API <-> Local Engine)   │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
    (ONLINE)    ▼                             ▼    (OFFLINE / FALLBACK)
┌───────────────────────────────┐ ┌───────────────────────────┐
│   PlatformClient REST SDK     │ │ TentacionesCommerceEngine │
│   Llamadas a /api/v1/tasks    │ │ Motor en memoria local    │
└───────────────────────────────┘ └───────────────────────────┘
```

---

## 3. Modelo de Dominio

* **`Product`**: Entidad inmutable con identificador único, slug, nombre, marca, categoría, precios en CLP/EUR, variantes de stock, especificaciones técnicas y URI de Realidad Aumentada (`arAssetUrn`).
* **`CartState`**: Estado del carrito de compras con lista de ítems, subtotal, cálculo de umbral de despacho gratuito y control de existencias antes de mutación.
* **`CustomerOrder`**: Orden de compra confirmada tras simulación de pasarela `WEBPAY_DEMO` con datos de cliente y dirección de entrega.
* **`FittingRoomResolution`**: Resolución de prueba virtual en 3D/AR con asociación de silueta biométrica (`Nova`, `Sora`, `Mateo`), cálculo de talla recomendada y modo de visualización.
