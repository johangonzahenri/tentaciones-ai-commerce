# CANONICAL DOCUMENT: VTO REAL PILOT EXECUTION CHECKLIST

STATUS: CERTIFIED
VERSION: 1.6.3
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal AI Integration & Product Operations Engineer

---

## 1. PROPÓSITO

Esta lista de verificación certifica todos los prerrequisitos técnicos, éticos, de seguridad y de privacidad antes de autorizar cualquier llamada de red real contra la API de inferencia de FASHN.

---

## 2. PILOT READINESS CHECKLIST

```text
[ ] 1. FASHN_API_KEY Configured:
       - Configurada exclusivamente en el entorno seguro del servidor backend.
       - Zero presencia en bundles de frontend, repositorio Git o archivos estáticos.

[ ] 2. User Privacy Consent:
       - Consentimiento explícito e informado otorgado por el usuario (`userConsentGranted: true`).
       - Comprensión clara de que la fotografía se procesa efímeramente y se destruye al cerrar.

[ ] 3. User Photo Quality & Binary Integrity:
       - Verificado por TryOnImagePipeline con cabecera binaria legítima (JPEG/PNG/WebP).
       - Resolución mínima (≥ 384x512) y dimensiones dentro de los límites seguros (≤ 4096x4096).
       - Estado de calidad evaluado como EXCELLENT, ACCEPTABLE o WARNING (REJECT bloquea fail-closed).

[ ] 4. Product Garment Image & Category:
       - Prenda perteneciente a categoría compatible (tops, dresses, outerwear, pants, skirts).
       - Imagen de producto en alta resolución con encuadre centrado y verificado.

[ ] 5. Provider Availability & Mode Guardrails:
       - Modo operativo establecido en PRIVATE_CONNECTED_DEMO.
       - Enrutador fail-closed activo ante ausencia de conectividad.

[ ] 6. Execution Control (Single Request / Idempotency):
       - Máximo 1 invocación de inferencia por solicitud de usuario.
       - Timeout configurado (30 segundos) con señal de aborto activa.

[ ] 7. Output Validation & Domain Whitelist:
       - Validación estricta de salida: data:image/ o dominios oficiales cdn.fashn.ai / media.fashn.ai.
       - Rechazo fail-closed de cualquier URL no autorizada.

[ ] 8. Ephemeral Memory & Zero Persistence:
       - Buffer RAM destruido inmediatamente tras procesar la respuesta.
       - 0 archivos escritos en filesystem (sin directorios uploads/ ni temporales).
       - 0 registros de imágenes en base de datos.

[ ] 9. Redaction & Zero Secret Logging:
       - Logs sanitizados; ninguna API key, token Bearer o imagen en Base64 es registrada en consola.

[ ] 10. Qualitative Quality Evaluation:
        - Registro de métricas observacionales según VTO_FIRST_PILOT_EVALUATION.md.
```

---

## 3. CHECKLIST AUTOMATION API

El checklist se evalúa programáticamente en runtime mediante la función:

```typescript
const readiness = imagePipeline.isReadyForRealVTO({
  preparedUserImage,
  preparedProductImage,
  hasApiKey: Boolean(process.env.FASHN_API_KEY && process.env.FASHN_API_KEY.trim()),
  userConsentGranted: Boolean(input.userConsentGranted),
});

if (!readiness.ready) {
  // Fail-Closed: Bloqueo seguro con diagnóstico explícito
  console.info(`[VTO GATEWAY] Real pilot execution blocked: ${readiness.reasons.join(" | ")}`);
}
```
