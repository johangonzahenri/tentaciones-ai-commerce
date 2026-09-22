# Contrato de Integración con AI Operating Platform

---

## 1. Topología de Integración

Tentaciones AI Commerce se integra con **AI Operating Platform** como una aplicación satélite registrada con el identificador `tentaciones-commerce` bajo el tenant `tenant-tentaciones`.

```text
Tentaciones UI
      ↓
Tentaciones Commerce Engine
      ↓
Tentaciones Platform Adapter
      ↓
@ai-platform/client (PlatformClient)
      ↓
Platform HTTP REST API (/api/v1/*)
      ↓
AI Operating Platform Core Engine
```

---

## 2. Cabeceras HTTP Obligatorias

Toda solicitud originada por Tentaciones hacia la plataforma padre incluye:

| Cabecera | Valor / Formato | Propósito |
| :--- | :--- | :--- |
| `X-Application-Id` | `tentaciones-commerce` | Identifica la aplicación consumidora en la plataforma. |
| `X-Tenant-Id` | `tenant-tentaciones` | Garantiza el aislamiento estricto multi-tenant en SQLite WAL. |
| `X-API-Key` | Clave API registrada (Opcional en modo local) | Autenticación Zero-Trust basada en SHA-256. |
| `Content-Type` | `application/json` | Contrato estándar de intercambio de datos. |

---

## 3. Capacidades Consumidas

1. **`product.discovery`**:
   - Endpoint: `POST /api/v1/tasks` con `capability: "product.discovery"`
   - Input: `{ userMessage: string }`
   - Salida esperada: Intención estructurada `{ category, tags, maxPrice }` y matching de catálogo.
2. **`product.recommendation`**:
   - Endpoint: `POST /api/v1/tasks` con `capability: "product.recommendation"`
   - Input: `{ productId: string }`
   - Salida esperada: Lista de recomendaciones correlacionadas por atributos y temporada.
3. **`product.compare`**:
   - Endpoint: `POST /api/v1/tasks` con `capability: "product.compare"`
   - Input: `{ productIds: string[] }`
   - Salida esperada: Matriz técnica comparativa y diferenciadores clave.
4. **`cart.assistance`**:
   - Endpoint: `POST /api/v1/tasks` con `capability: "cart.assistance"`
   - Input: `{ cartId: string, query: string }`
   - Salida esperada: Asistencia conversacional y cálculo de umbral de despacho gratuito.
5. **`ar.fitting_room`**:
   - Endpoint: `POST /api/v1/tasks` con `capability: "ar.fitting_room"`
   - Input: `{ assetUrn: string, profile: "Nova" | "Sora" | "Mateo" }`
   - Salida esperada: URL de preview y resolución de modelo 3D.
