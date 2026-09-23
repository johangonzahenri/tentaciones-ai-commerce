# CANONICAL DOCUMENT: VTO REAL PILOT EXECUTION CHECKLIST

STATUS: CERTIFIED
VERSION: 1.6.3
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal AI Integration & Product Operations Engineer

---

## 1. PROPÃ“SITO

Esta lista de verificaciÃ³n certifica todos los prerrequisitos tÃ©cnicos, Ã©ticos, de seguridad y de privacidad antes de autorizar cualquier llamada de red real contra la API de inferencia de FASHN.

---

## 2. PILOT READINESS CHECKLIST

```text
[ ] 1. FASHN_API_KEY Configured:
       - Configurada exclusivamente en el entorno seguro del servidor backend.
       - Zero presencia en bundles de frontend, repositorio Git o archivos estÃ¡ticos.

[ ] 2. User Privacy Consent:
       - Consentimiento explÃ­cito e informado otorgado por el usuario (`userConsentGranted: true`).
       - ComprensiÃ³n clara de que la fotografÃ­a se procesa efÃ­meramente y se destruye al cerrar.

[ ] 3. User Photo Quality & Binary Integrity:
       - Verificado por TryOnImagePipeline con cabecera binaria legÃ­tima (JPEG/PNG/WebP).
       - ResoluciÃ³n mÃ­nima (â‰¥ 384x512) y dimensiones dentro de los lÃ­mites seguros (â‰¤ 4096x4096).
       - Estado de calidad evaluado como EXCELLENT, ACCEPTABLE o WARNING (REJECT bloquea fail-closed).

[ ] 4. Product Garment Image & Category:
       - Prenda perteneciente a categorÃ­a compatible (tops, dresses, outerwear, pants, skirts).
       - Imagen de producto en alta resoluciÃ³n con encuadre centrado y verificado.

[ ] 5. Provider Availability & Mode Guardrails:
       - Modo operativo establecido en PRIVATE_CONNECTED_DEMO.
       - Enrutador fail-closed activo ante ausencia de conectividad.

[ ] 6. Execution Control (Single Request / Idempotency):
       - MÃ¡ximo 1 invocaciÃ³n de inferencia por solicitud de usuario.
       - Timeout configurado (30 segundos) con seÃ±al de aborto activa.

[ ] 7. Output Validation & Domain Whitelist:
       - ValidaciÃ³n estricta de salida: data:image/ o dominios oficiales cdn.fashn.ai / media.fashn.ai.
       - Rechazo fail-closed de cualquier URL no autorizada.

[ ] 8. Ephemeral Memory & Zero Persistence:
       - Buffer RAM destruido inmediatamente tras procesar la respuesta.
       - 0 archivos escritos en filesystem (sin directorios uploads/ ni temporales).
       - 0 registros de imÃ¡genes en base de datos.

[ ] 9. Redaction & Zero Secret Logging:
       - Logs sanitizados; ninguna API key, token Bearer o imagen en Base64 es registrada en consola.

[ ] 10. Qualitative Quality Evaluation:
        - Registro de mÃ©tricas observacionales segÃºn VTO_FIRST_PILOT_EVALUATION.md.
```

---

## 3. CHECKLIST AUTOMATION API

El checklist se evalÃºa programÃ¡ticamente en runtime mediante la funciÃ³n:

```typescript
const readiness = imagePipeline.isReadyForRealVTO({
  preparedUserImage,
  preparedProductImage,
  hasApiKey: Boolean(process.env.FASHN_API_KEY && process.env.FASHN_API_KEY.trim()),
  userConsentGranted: Boolean(input.userConsentGranted),
});

if (!readiness.ready) {
  // Fail-Closed: Bloqueo seguro con diagnÃ³stico explÃ­cito
  console.info(`[VTO GATEWAY] Real pilot execution blocked: ${readiness.reasons.join(" | ")}`);
}
```
