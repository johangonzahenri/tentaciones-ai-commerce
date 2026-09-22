# CANONICAL DOCUMENT: VTO EXECUTION GATEWAY ARCHITECTURE

STATUS: CERTIFIED
VERSION: 1.6.4
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal AI Architect & VTO Systems Engineer

---

## 1. PROPÓSITO Y RESUMEN EJECUTIVO

El componente `VTOExecutionGateway` constituye la capa central de orquestación, gobernanza, políticas de reintento, sondeo (*polling*) y normalización de resultados del motor de **Virtual Try-On (VTO)** en Tentaciones AI Commerce.

El gateway actúa como el único punto de contacto entre las interfaces de usuario (Storefront, Modal de Fitting, Carrito) y los adaptadores de inferencia (`DemoVirtualTryOnProvider` y `FashnVirtualTryOnProvider`), aislando por completo al consumidor de los detalles de red, tokens y esquemas propietarios de proveedores externos.

---

## 2. FLUJO ARQUITECTÓNICO

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   TENTACIONES STOREFRONT / UI                          │
│        (Modal VTO, Selección de Avatar, Subida de Foto)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ VirtualTryOnExecutionRequest
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      VTO EXECUTION GATEWAY                             │
│                                                                        │
│  1. IDEMPOTENCY / IN-FLIGHT GATE:                                      │
│     └─ Evita dobles clics o ejecuciones concurrentes duplicadas        │
│                                                                        │
│  2. CONSENT GATE:                                                      │
│     └─ userConsentGranted === true obligatorio para fotos de usuario   │
│                                                                        │
│  3. INPUT READINESS & QUALITY CHECK:                                   │
│     └─ Bloqueo fail-closed si calidad es REJECT                        │
│                                                                        │
│  4. PROVIDER SELECTION POLICY:                                         │
│     ├─ PUBLIC_DEMO → DemoVirtualTryOnProvider (100% aislado)           │
│     └─ PRIVATE_CONNECTED_DEMO → FashnVirtualTryOnProvider (Autenticado)│
│                                                                        │
│  5. BOUNDED POLLING & RETRY ENGINE:                                    │
│     ├─ Polling con retroceso exponencial (Backoff)                     │
│     └─ Timeout determinista y cancelación activa                       │
│                                                                        │
│  6. OUTPUT DOMAIN VALIDATION:                                          │
│     └─ Whitelist estricta: data:image/ o https://(cdn|media).fashn.ai/ │
│                                                                        │
│  7. RESULT NORMALIZATION:                                              │
│     └─ VirtualTryOnExecutionResult con 0 secretos y 0 memory leaks     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      CONSUMER CONTRACT RESULT                          │
│            (Estado, Imagen Validada, Talla Sugerida, Metadatos)        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CONTRATO DE ENTRADA Y SALIDA

```typescript
export interface VirtualTryOnExecutionRequest {
  requestId: string;
  userImage?: PreparedUserImage;
  productImage: PreparedProductImage;
  productCategory: TryOnCategory;
  providerPreference?: "demo-synthetic" | "fashn-pilot";
  modelPreference?: FashnModel;
  userConsentGranted: boolean;
  demoMode: boolean;
  metadata?: {
    clientSessionId?: string;
    avatarProfile?: "Nova" | "Sora" | "Mateo";
    idempotencyKey?: string;
  };
}

export interface VirtualTryOnExecutionResult {
  requestId: string;
  jobId: string;
  providerId: string;
  modelName: string;
  status: "COMPLETED" | "FAILED" | "CANCELLED" | "TIMEOUT";
  resultImageUrl?: string;
  isSyntheticDemo: boolean;
  category: TryOnCategory;
  recommendedSize?: string;
  fitConfidence?: number;
  processingTimeMs: number;
  completedAt: string;
  disclaimer: { es: string; en: string };
  error?: { code: VTOErrorCode; message: string; retryable: boolean };
}
```

---

## 4. INVARIANTES DE SEGURIDAD Y PRIVACIDAD

1. **Aislamiento Fail-Closed en Modo Público:** `PUBLIC_DEMO` enruta siempre a `DemoVirtualTryOnProvider`, ignorando cualquier clave en variables de entorno.
2. **Protección contra Fuga de Secretos:** Todo resultado normalizado pasa por `sanitizeVTOResponse` y `redactVTOSecrets`, eliminando claves de API, tokens Bearer y endpoints privados.
3. **Validación de Dominio de Salida:** Se rechazan URLs no seguras (HTTP plano) o dominios no incluidos en la whitelist autorizada.
