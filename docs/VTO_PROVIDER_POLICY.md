# CANONICAL DOCUMENT: VTO PROVIDER SELECTION & ROUTING POLICY

STATUS: CERTIFIED
VERSION: 1.6.4
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Security & AI Systems Architect

---

## 1. POLÍTICA DE SELECCIÓN DE PROVEEDORES

El motor de Virtual Try-On opera bajo una matriz determinista de selección de proveedores que impide el uso accidental o no autorizado de servicios de inferencia externos.

```text
+--------------------------+-----------------------+-----------------------------+-----------------------------+
| Modo Operacional         | Preferencia Solicitada| Credencial Server-Side      | Proveedor Seleccionado      |
+--------------------------+-----------------------+-----------------------------+-----------------------------+
| PUBLIC_DEMO              | demo-synthetic        | No Requerida                | DemoVirtualTryOnProvider    |
| PUBLIC_DEMO              | fashn-pilot           | Configurada o Ausente       | DemoVirtualTryOnProvider    |
| PRIVATE_CONNECTED_DEMO   | demo-synthetic        | No Requerida                | DemoVirtualTryOnProvider    |
| PRIVATE_CONNECTED_DEMO   | fashn-pilot           | Configurada (FASHN_API_KEY) | FashnVirtualTryOnProvider   |
| PRIVATE_CONNECTED_DEMO   | fashn-pilot           | Ausente                     | BLOQUEO FAIL-CLOSED         |
+--------------------------+-----------------------+-----------------------------+-----------------------------+
```

---

## 2. REGLA DE AISLAMIENTO PÚBLICO

En el modo `PUBLIC_DEMO` (utilizado para el showcase de portafolio y despliegues estáticos públicos):
- Toda petición se rutea de forma **inmutable** hacia el proveedor sintético local `DemoVirtualTryOnProvider`.
- No se emite ninguna llamada HTTP hacia `api.fashn.ai`.
- Se rechaza la presencia de claves en el cliente para evitar exposición de credenciales comerciales.

---

## 3. ESPECIFICACIÓN DE MODELOS FASHN

Cuando se opera en `PRIVATE_CONNECTED_DEMO` con credenciales activas, el adaptador FASHN gestiona dos perfiles de modelo:

1. **`tryon-max` (Recommended Preview Model):**
   - Esquema de entrada: `inputs: { model_image, product_image, return_base64: true, num_images: 1 }`.
   - Propósito: Máxima resolución y fidelidad de texturas fotorrealistas en micro-estampados.
2. **`tryon-v1.6` (Production-Stable Model):**
   - Esquema de entrada: `inputs: { model_image, garment_image, category, return_base64: true, num_images: 1 }`.
   - Propósito: Alta disponibilidad, menor latencia y estabilidad para alto volumen transaccional.

---

## 4. GOBERNANZA DE CÓMPUTO Y CRÉDITOS

Para todos los pilotos reales, el parámetro `num_images` se fija estrictamente en `1` para evitar sobreconsumo de cuotas de cómputo en la API de inferencia.
