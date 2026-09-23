# CANONICAL DOCUMENT: VTO RESULT NORMALIZATION & CONSUMER CONTRACT

STATUS: CERTIFIED
VERSION: 1.6.4
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Frontend Architect & Integration Engineer

---

## 1. PROPÃ“SITO DEL CONTRATO DE RESULTADO

El contrato `VirtualTryOnExecutionResult` normaliza de manera neutral la salida de cualquier motor de inferencia, garantizando que el frontend de Tentaciones reciba un esquema uniforme independientemente de si la ejecuciÃ³n se produjo en el entorno sintÃ©tico de demostraciÃ³n (`demo-synthetic`) o en la nube de FASHN AI (`fashn-pilot`).

---

## 2. ESQUEMA DEL RESULTADO NORMALIZADO

```typescript
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
  disclaimer: {
    es: string;
    en: string;
  };
  error?: {
    code: VTOErrorCode;
    message: string;
    retryable: boolean;
  };
  metadata: {
    attempts: number;
    sourceType: "USER_PHOTO" | "SYNTHETIC_AVATAR";
    sanitizedMimeType: string;
    evaluatedResolution: string;
  };
}
```

---

## 3. VALIDACIÃ“N DE DOMINIOS Y FORMATOS DE SALIDA

Para mitigar riesgos de *Cross-Site Scripting* (XSS) o suplantaciÃ³n de activos, el gateway valida estrictamente que `resultImageUrl`:
1. Sea un esquema seguro `data:image/` (Data URI Base64 efÃ­mero).
2. O provenga de la lista blanca de dominios CDN autorizados:
   - `https://cdn.fashn.ai/`
   - `https://media.fashn.ai/`
3. O sea un recurso local de showcase `/assets/`.

Toda URL que utilice HTTP no seguro o apunte a dominios externos no autorizados es rechazada *fail-closed*.
