# CANONICAL DOCUMENT: VTO IMAGE PIPELINE ARCHITECTURE & PREPROCESSING

STATUS: CERTIFIED
VERSION: 1.6.3
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Computer Vision & Image Pipeline Engineer

---

## 1. PROPÃ“SITO Y RESUMEN EJECUTIVO

El componente `TryOnImagePipeline` constituye la capa de preprocesamiento, validaciÃ³n binaria, normalizaciÃ³n y control de calidad visual previa al ingreso de cualquier fotografÃ­a o prenda al motor de **AI Virtual Try-On (VTO)**.

Su objetivo fundamental es garantizar que todo tensor o imagen enviada a los modelos neuronales (sean `tryon-max`, `tryon-v1.6` o el motor sintÃ©tico demo) cumpla de forma determinista con los requisitos de resoluciÃ³n, aspect ratio, codificaciÃ³n e integridad de memoria antes de incurrir en latencia o costo de inferencia.

---

## 2. ARQUITECTURA DEL PIPELINE DE IMAGEN

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          CLIENT / STOREFRONT                           â”‚
â”‚  [ Upload User Photo ]  OR  [ Select Demo Avatar (Nova, Sora, Mateo) ] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚ (Base64 / Blob Stream)
                                     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   TRY-ON IMAGE PIPELINE (Domain)                       â”‚
â”‚                                                                        â”‚
â”‚  1. BINARY MAGIC HEADER AUDIT                                          â”‚
â”‚     â”œâ”€ Detect exact magic bytes (JPEG 0xFFD8FF, PNG 0x89504E47, WebP) â”‚
â”‚     â””â”€ Block polyglot files, corrupted bytes, and spoofed MIME types   â”‚
â”‚                                                                        â”‚
â”‚  2. RESOLUTION & PAYLOAD BOUNDARIES                                    â”‚
â”‚     â”œâ”€ Min: 384x512 px (Landmark resolution threshold)                 â”‚
â”‚     â”œâ”€ Max: 4096x4096 px / 16 MP / 10 MB (Decompression bomb defense)  â”‚
â”‚     â””â”€ Byte Floor: 2 KB (Truncated payload filter)                     â”‚
â”‚                                                                        â”‚
â”‚  3. MORPHOLOGY & ORIENTATION ANALYSIS                                  â”‚
â”‚     â”œâ”€ Aspect Ratio: Portrait (Optimal) vs Square / Landscape (Warn)   â”‚
â”‚     â””â”€ Framing & Torso Visibility Heuristic                            â”‚
â”‚                                                                        â”‚
â”‚  4. QUALITY STATE TAXONOMY                                             â”‚
â”‚     â””â”€ EXCELLENT | ACCEPTABLE | WARNING | REJECT | UNKNOWN             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    PREPARED IMAGE CONTRACTS                            â”‚
â”‚           PreparedUserImage  &  PreparedProductImage                   â”‚
â”‚         (Ephemeral Transport Payload â€” 0 Memory Leaks)                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      VIRTUAL TRY-ON ENGINE                             â”‚
â”‚                  VirtualTryOnService Gateway                           â”‚
â”‚                                                                        â”‚
â”‚        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚        â–¼                                                       â–¼       â”‚
â”‚   Demo Provider                                         FASHN Adapter  â”‚
â”‚  (demo-synthetic)                                       (fashn-pilot)  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 3. DIFERENCIACIÃ“N DE TIPOS DE ENTRADA

El pipeline trata las entradas de manera estrictamente diferenciada:

1. **`USER_IMAGE` (FotografÃ­a de Usuario)**:
   - Requiere consentimiento explÃ­cito (`userConsentGranted: true`).
   - Sometida a auditorÃ­a completa de cabeceras binarias y anÃ¡lisis de calidad.
   - Procesada de manera 100% efÃ­mera en RAM volÃ¡til (0 persistencia en disco o BD).
2. **`PRODUCT_IMAGE` (Prenda de CatÃ¡logo)**:
   - Evaluada respecto a la matriz de compatibilidad de categorÃ­a (`tops`, `outerwear`, `dresses`, `pants`, `skirts`).
   - Requiere URLs validadas en HTTPS o assets locales verificados.
3. **`DEMO_AVATAR` (Preset SintÃ©tico)**:
   - Fast-path pre-calibrado con proporciones antropomÃ©tricas exactas (Nova: 1.68m, Sora: 1.75m, Mateo: 1.82m).
   - Genera estado `EXCELLENT` inmediato garantizando una experiencia de demostraciÃ³n fluida y determinista.

---

## 4. CONTRATO DE PREPARACIÃ“N DE ENTRADAS

```typescript
export interface PreparedUserImage {
  inputType: "USER_IMAGE" | "DEMO_AVATAR";
  format: ImageFormat;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: ImageOrientation;
  quality: QualityState;
  qualityAssessment: ImageQualityAssessment;
  validated: boolean;
  validatedAt: string;
  sourceType: "USER_PHOTO" | "SYNTHETIC_AVATAR";
  dataUri?: string; // Payload efÃ­mero para la solicitud en curso
}

export interface PreparedProductImage {
  productId: string;
  productSlug: string;
  category: TryOnCategory;
  format: ImageFormat;
  width: number;
  height: number;
  aspectRatio: number;
  sourceType: "PRODUCT_IMAGE";
  validated: boolean;
  quality: QualityState;
  url: string;
  evaluatedAt: string;
}
```

---

## 5. REGLAS DE SEGURIDAD Y DEFENSA EN PROFUNDIDAD

- **Pre-Validation File Cap**: Los payloads mayores a 10 MB son rechazados antes de decodificaciÃ³n o anÃ¡lisis intensivo.
- **Decompression Bomb Protection**: LÃ­mite de Ã¡rea fijado en 16 MegapÃ­xeles (4096 x 4096 px) para mitigar vectores de agotamiento de memoria.
- **Header Magic Bytes Check**: Se rechazan archivos cuyo contenido binario no concuerde con firmas estÃ¡ndar (`0xFFD8FF` JPEG, `0x89504E47` PNG, `RIFF...WEBP` WebP).
- **Zero Disk Storage Invariant**: El servidor no cuenta con directorios temporales de subida ni bases de datos de imÃ¡genes de usuarios.
