# CANONICAL DOCUMENT: VTO EXECUTION GATEWAY ARCHITECTURE

STATUS: CERTIFIED
VERSION: 1.6.4
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal AI Architect & VTO Systems Engineer

---

## 1. PROPÃ“SITO Y RESUMEN EJECUTIVO

El componente `VTOExecutionGateway` constituye la capa central de orquestaciÃ³n, gobernanza, polÃ­ticas de reintento, sondeo (*polling*) y normalizaciÃ³n de resultados del motor de **Virtual Try-On (VTO)** en Tentaciones AI Commerce.

El gateway actÃºa como el Ãºnico punto de contacto entre las interfaces de usuario (Storefront, Modal de Fitting, Carrito) y los adaptadores de inferencia (`DemoVirtualTryOnProvider` y `FashnVirtualTryOnProvider`), aislando por completo al consumidor de los detalles de red, tokens y esquemas propietarios de proveedores externos.

---

## 2. FLUJO ARQUITECTÃ“NICO

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   TENTACIONES STOREFRONT / UI                          â”‚
â”‚        (Modal VTO, SelecciÃ³n de Avatar, Subida de Foto)                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                    â”‚ VirtualTryOnExecutionRequest
                                    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      VTO EXECUTION GATEWAY                             â”‚
â”‚                                                                        â”‚
â”‚  1. IDEMPOTENCY / IN-FLIGHT GATE:                                      â”‚
â”‚     â””â”€ Evita dobles clics o ejecuciones concurrentes duplicadas        â”‚
â”‚                                                                        â”‚
â”‚  2. CONSENT GATE:                                                      â”‚
â”‚     â””â”€ userConsentGranted === true obligatorio para fotos de usuario   â”‚
â”‚                                                                        â”‚
â”‚  3. INPUT READINESS & QUALITY CHECK:                                   â”‚
â”‚     â””â”€ Bloqueo fail-closed si calidad es REJECT                        â”‚
â”‚                                                                        â”‚
â”‚  4. PROVIDER SELECTION POLICY:                                         â”‚
â”‚     â”œâ”€ PUBLIC_DEMO â†’ DemoVirtualTryOnProvider (100% aislado)           â”‚
â”‚     â””â”€ PRIVATE_CONNECTED_DEMO â†’ FashnVirtualTryOnProvider (Autenticado)â”‚
â”‚                                                                        â”‚
â”‚  5. BOUNDED POLLING & RETRY ENGINE:                                    â”‚
â”‚     â”œâ”€ Polling con retroceso exponencial (Backoff)                     â”‚
â”‚     â””â”€ Timeout determinista y cancelaciÃ³n activa                       â”‚
â”‚                                                                        â”‚
â”‚  6. OUTPUT DOMAIN VALIDATION:                                          â”‚
â”‚     â””â”€ Whitelist estricta: data:image/ o https://(cdn|media).fashn.ai/ â”‚
â”‚                                                                        â”‚
â”‚  7. RESULT NORMALIZATION:                                              â”‚
â”‚     â””â”€ VirtualTryOnExecutionResult con 0 secretos y 0 memory leaks     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                    â”‚
                                    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      CONSUMER CONTRACT RESULT                          â”‚
â”‚            (Estado, Imagen Validada, Talla Sugerida, Metadatos)        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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

1. **Aislamiento Fail-Closed en Modo PÃºblico:** `PUBLIC_DEMO` enruta siempre a `DemoVirtualTryOnProvider`, ignorando cualquier clave en variables de entorno.
2. **ProtecciÃ³n contra Fuga de Secretos:** Todo resultado normalizado pasa por `sanitizeVTOResponse` y `redactVTOSecrets`, eliminando claves de API, tokens Bearer y endpoints privados.
3. **ValidaciÃ³n de Dominio de Salida:** Se rechazan URLs no seguras (HTTP plano) o dominios no incluidos en la whitelist autorizada.
