# Tentaciones AI Commerce — Product Experience & Architecture Specification

**STATUS:** CANONICAL SPECIFICATION  
**VERSION:** 1.8.1  
**PROJECT:** PROJ-01-TENTACIONES (`tentaciones-ai-commerce`)  
**PLATFORM RELATIONSHIP:** Satellite Application 01 to AI Operating Platform  
**DATE:** 2026-09-23  

---

## 1. Visión General del Producto

**Tentaciones AI Commerce** es la aplicación satélite de comercio electrónico inteligente del ecosistema **AI Operating Platform**, especializada en moda, calzado y accesorios técnicos con capacidades de **Probador Virtual de IA (Virtual Try-On / VTO)** y visualización 3D/AR en el navegador.

```text
                     ★ AI OPERATING PLATFORM ★
                              │
                        Platform API / SDK
                              │
                              ▼
                    01 TENTACIONES AI COMMERCE
                              │
               ┌──────────────┼──────────────┐
               │              │              │
            Commerce          AI           AR/VTO
               │              │              │
            Catalog        Discovery       Try-On
            Product     Personalization    Result
               │              │              │
               └──────────────┼──────────────┘
                              │
                       Cart / Checkout
```

---

## 2. Customer Journey Principal

El flujo de usuario (Customer Journey) está estructurado en 8 etapas completamente funcionales y verificadas en navegador:

```text
LANDING ──► CATALOG ──► PRODUCT DETAIL ──► PROFILE SELECTION ──► VTO / AR ──► RESULT ──► CART ──► CHECKOUT ──► SUCCESS
```

1. **Landing & Hero:** Presentación de la marca, propuesta de valor de IA y accesos directos al probador virtual.
2. **Catálogo:** Navegación por 9 categorías de producto con filtros dinámicos y búsqueda en lenguaje natural.
3. **Detalle de Producto:** Vista técnica, especificaciones de material, selección de variantes (talla, color) y stock en tiempo real.
4. **Selección de Perfil Biométrico:** Avatares sintéticos (*Nova*, *Sora*, *Mateo*) con dimensiones antropométricas para recomendación de talla.
5. **Probador Virtual (VTO / AR):** Pipeline de validación de consentimiento, calidad de imagen, aislamiento de modo sintético y estimación de ajuste.
6. **Resultado de Ajuste:** Visualización de confianza biométrica (e.g. 96%), recomendación de talla y renderizado visual.
7. **Carrito de Compras:** Cálculo en vivo de subtotales, umbral de envío gratuito ($30.000 CLP) y mutaciones seguras de ítems.
8. **Checkout Seguro Demo:** Pasarela de pago simulada Webpay Demo con vaciado atómico de carrito y generación de orden.

---

## 3. Catálogo y Datos de Producto

El catálogo canónico (`src/domain/catalog-data.ts`) contiene **9 productos de referencia** con atributos técnicos exhaustivos:

| ID | Nombre del Producto | Categoría | Precio (CLP) | Precio (EUR) | 3D / AR | Formato |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `prod-polera-essential` | Polera Oversized Organic Cotton Essential | Poleras | $22.990 | €24,99 | SÍ | `.gltf` |
| `prod-camisa-lino` | Camisa Resort Lino Italiano Breeze | Camisas | $45.990 | €49,99 | SÍ | `.glb` |
| `prod-poleron-hoodie` | Hoodie Heavyweight French Terry 450 GSM | Polerones | $49.990 | €54,99 | SÍ | `.glb` |
| `prod-chaqueta-running` | Chaqueta StormShield Pro Waterproof Running | Chaquetas | $89.990 | €119,99 | SÍ | `.glb` |
| `prod-vestido-seda` | Vestido Aura Silk Elegant Dinner Gala | Vestidos | $139.990 | €189,99 | SÍ | `.gltf` |
| `prod-pantalones-cargo` | Pantalón Cargo Táctico Modular Techwear | Pantalones | $59.990 | €64,99 | SÍ | `.glb` |
| `prod-falda-plisada` | Falda Midi Plisada Shimmering | Faldas | $39.990 | €44,99 | SÍ | `.glb` |
| `prod-zapatillas-carbon` | Zapatillas Pro Carbon Racer Marathon Shoes | Calzado | $119.990 | €149,99 | SÍ | `.glb` |
| `prod-calcetines-pack` | Calcetines Anti-Ampollas Running Pro (Pack x3) | Accesorios | $19.990 | €24,99 | NO | N/A |

---

## 4. Arquitectura del Probador Virtual (VTO / AR)

### A. Máquina de Estados del VTO
El ciclo de vida del probador virtual implementa los siguientes estados de ejecución deterministas:

```text
[IDLE] ──► [VALIDATING_INPUT] ──► [READY] ──► [EXECUTING] ──► [POLLING] ──► [SUCCESS]
   │               │                                                   │
   └──► [QUALITY_REJECTED]                                            ├──► [FAILED]
   │                                                                   │
   └──► [CONSENT_REQUIRED]                                            └──► [CANCELLED]
```

### B. Modos Operacionales y Aislamiento de Seguridad
* **`PUBLIC_DEMO` / Synthetic Fallback:** Ejecución 100% determinista y offline en el cliente/servidor local utilizando perfiles sintéticos precalibrados. Cero dependencia de claves API de terceros.
* **`PRIVATE_CONNECTED_DEMO`:** Modo conectado que permite invocar el proveedor real (FASHN API) mediante la pasarela segura [`FashnVirtualTryOnProvider`](file:///c:/Users/Johan/OneDrive/Documentos/IA_Work/projects/tentaciones-ai-commerce/src/adapter/vto/fashn-vto-provider.ts) únicamente cuando las credenciales están presentes.
* **Fail-Closed Privacy Invariant:** Si no hay credenciales o consentimiento del usuario (`consent=false`), cualquier intento de invocar proveedores externos falla inmediatamente sin fuga de datos ni reintentos silenciosos.

---

## 5. Matriz de Integración con AI Operating Platform

| Capacidad | Implementación Local | Respaldo Platform Core | Modo Fallback |
| :--- | :--- | :--- | :--- |
| **Catálogo & Precios** | `TentacionesCommerceEngine` | Independiente (Dominio Propio) | Local Siempre |
| **Descubrimiento Semántico** | Extracción local de intención | `PlatformClient.tasks.create()` | Regex / Tokens Local |
| **Recomendaciones de Moda** | Matriz de afinidad por categoría | Agentes de Recomendación Core | Matriz Determinista |
| **Probador Virtual (VTO)** | `DemoVirtualTryOnProvider` | `PlatformClient.operations` | Sintético Offline |
| **Carrito y Checkout** | `CartManager` en memoria/local | Independiente (Transaccional) | Local Seguro |
| **Telemetría y Métricas** | `VTOMetricsCollector` | Audit Trail / Governance Core | Métricas en Memoria |

---

## 6. Seguridad y Cero Exposición de Secretos

1. **Auditoría de Secretos:** 0 API keys, 0 credenciales de pasarelas de pago y 0 tokens JWT en el código fuente ni en el bundle estático `public/`.
2. **Higiene del DOM:** Cero uso de `innerHTML`, `outerHTML` o `eval()` en los controladores de interfaz (`public/app.js`).
3. **Manejo de Imágenes Efímero:** Las fotografías del usuario se procesan mediante `Blob URLs` y se liberan de memoria inmediatamente tras la sesión (`releaseVTOObjectUrl`).
