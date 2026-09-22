# Arquitectura Técnica — Tentaciones AI Commerce

---

## 1. Principios de Diseño

1. **Desacoplamiento Estricto**: Tentaciones es una aplicación consumidora (**Child Application**). No aloja ni duplica el motor central de agentes, la base de datos de eventos ni el gateway de políticas de seguridad.
2. **Defensa en Profundidad & Seguridad DOM**: El código frontend en `public/app.js` aplica una política estricta de **0 innerHTML, 0 outerHTML, 0 eval() y 0 document.write()**, construyendo la interfaz exclusivamente mediante APIs seguras del DOM.
3. **Contrato Multicliente (`ITentacionesExperienceService`)**: Desacopla completamente los clientes de visualización (Web Storefront, Mobile Apps, Kiosks) de la implementación subyacente.
4. **Aislamiento Fail-Closed en Modo Demo**: En `PUBLIC_DEMO`, el sistema opera de forma 100% sintética, rechazando llamadas a URLs internas corporativas, impidiendo fugas de claves o secretos, y bloqueando tokens de pago de producción.

---

## 2. Diagrama de Capas Multicliente

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAPA MULTICLIENTE / SURFACES                       │
│    Storefront Web (SPA)  │  Mobile App (iOS/Android)  │  In-Store Kiosk │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼ (REST /api/*)
┌─────────────────────────────────────────────────────────────────────────┐
│                       CAPA DE SERVIDOR / GATEWAY                        │
│    Node.js Native Server (src/server.ts) • CSP • Sanitized Handlers     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  CONTRATO DE EXPERIENCIA MULTICLIENTE                    │
│      ITentacionesExperienceService (src/contracts/experience-contract.ts)│
└──────────────────┬──────────────────┬───────────────────────────────────┘
                   │                                  │
       (PUBLIC_DEMO)                                   │ (PRIVATE_CONNECTED)
                   ▼                                  ▼
┌─────────────────────────────────────┐ ┌─────────────────────────────────┐
│           DemoAdapter               │ │     ConnectedServiceWrapper     │
│   - Catálogo 100% Sintético         │ │   - TentacionesPlatformAdapter  │
│   - Fitting Biométrico Local        │ │   - PlatformClient REST SDK     │
│   - Métricas Comerciales Demo       │ │   - Conexión con AI Operating   │
│   - Invariantes Fail-Closed         │ │     Platform Core Gateway       │
└─────────────────────────────────────┘ └─────────────────────────────────┘
```

---

## 3. Modelo de Dominio

* **`Product`**: Entidad inmutable con identificador único, slug, nombre, marca, categoría, precios en CLP/EUR, variantes de stock, especificaciones técnicas y URI de Realidad Aumentada (`arAssetUrn`).
* **`CartState`**: Estado del carrito de compras con lista de ítems, subtotal, cálculo de umbral de despacho gratuito y control de existencias antes de mutación.
* **`CustomerOrder`**: Orden de compra confirmada tras simulación de pasarela `WEBPAY_DEMO` con datos de cliente y dirección de entrega.
* **`FittingRoomResolution`**: Resolución de prueba virtual en 3D/AR con asociación de silueta biométrica (`Nova`, `Sora`, `Mateo`), cálculo de talla recomendada y modo de visualización.
