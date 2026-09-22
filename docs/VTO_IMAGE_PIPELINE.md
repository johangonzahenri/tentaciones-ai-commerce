# CANONICAL DOCUMENT: VTO IMAGE PIPELINE ARCHITECTURE & PREPROCESSING

STATUS: CERTIFIED
VERSION: 1.6.3
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Computer Vision & Image Pipeline Engineer

---

## 1. PROPÓSITO Y RESUMEN EJECUTIVO

El componente `TryOnImagePipeline` constituye la capa de preprocesamiento, validación binaria, normalización y control de calidad visual previa al ingreso de cualquier fotografía o prenda al motor de **AI Virtual Try-On (VTO)**.

Su objetivo fundamental es garantizar que todo tensor o imagen enviada a los modelos neuronales (sean `tryon-max`, `tryon-v1.6` o el motor sintético demo) cumpla de forma determinista con los requisitos de resolución, aspect ratio, codificación e integridad de memoria antes de incurrir en latencia o costo de inferencia.

---

## 2. ARQUITECTURA DEL PIPELINE DE IMAGEN

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT / STOREFRONT                           │
│  [ Upload User Photo ]  OR  [ Select Demo Avatar (Nova, Sora, Mateo) ] │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (Base64 / Blob Stream)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   TRY-ON IMAGE PIPELINE (Domain)                       │
│                                                                        │
│  1. BINARY MAGIC HEADER AUDIT                                          │
│     ├─ Detect exact magic bytes (JPEG 0xFFD8FF, PNG 0x89504E47, WebP) │
│     └─ Block polyglot files, corrupted bytes, and spoofed MIME types   │
│                                                                        │
│  2. RESOLUTION & PAYLOAD BOUNDARIES                                    │
│     ├─ Min: 384x512 px (Landmark resolution threshold)                 │
│     ├─ Max: 4096x4096 px / 16 MP / 10 MB (Decompression bomb defense)  │
│     └─ Byte Floor: 2 KB (Truncated payload filter)                     │
│                                                                        │
│  3. MORPHOLOGY & ORIENTATION ANALYSIS                                  │
│     ├─ Aspect Ratio: Portrait (Optimal) vs Square / Landscape (Warn)   │
│     └─ Framing & Torso Visibility Heuristic                            │
│                                                                        │
│  4. QUALITY STATE TAXONOMY                                             │
│     └─ EXCELLENT | ACCEPTABLE | WARNING | REJECT | UNKNOWN             │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    PREPARED IMAGE CONTRACTS                            │
│           PreparedUserImage  &  PreparedProductImage                   │
│         (Ephemeral Transport Payload — 0 Memory Leaks)                 │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      VIRTUAL TRY-ON ENGINE                             │
│                  VirtualTryOnService Gateway                           │
│                                                                        │
│        ┌───────────────────────────┴───────────────────────────┐       │
│        ▼                                                       ▼       │
│   Demo Provider                                         FASHN Adapter  │
│  (demo-synthetic)                                       (fashn-pilot)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. DIFERENCIACIÓN DE TIPOS DE ENTRADA

El pipeline trata las entradas de manera estrictamente diferenciada:

1. **`USER_IMAGE` (Fotografía de Usuario)**:
   - Requiere consentimiento explícito (`userConsentGranted: true`).
   - Sometida a auditoría completa de cabeceras binarias y análisis de calidad.
   - Procesada de manera 100% efímera en RAM volátil (0 persistencia en disco o BD).
2. **`PRODUCT_IMAGE` (Prenda de Catálogo)**:
   - Evaluada respecto a la matriz de compatibilidad de categoría (`tops`, `outerwear`, `dresses`, `pants`, `skirts`).
   - Requiere URLs validadas en HTTPS o assets locales verificados.
3. **`DEMO_AVATAR` (Preset Sintético)**:
   - Fast-path pre-calibrado con proporciones antropométricas exactas (Nova: 1.68m, Sora: 1.75m, Mateo: 1.82m).
   - Genera estado `EXCELLENT` inmediato garantizando una experiencia de demostración fluida y determinista.

---

## 4. CONTRATO DE PREPARACIÓN DE ENTRADAS

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
  dataUri?: string; // Payload efímero para la solicitud en curso
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

- **Pre-Validation File Cap**: Los payloads mayores a 10 MB son rechazados antes de decodificación o análisis intensivo.
- **Decompression Bomb Protection**: Límite de área fijado en 16 Megapíxeles (4096 x 4096 px) para mitigar vectores de agotamiento de memoria.
- **Header Magic Bytes Check**: Se rechazan archivos cuyo contenido binario no concuerde con firmas estándar (`0xFFD8FF` JPEG, `0x89504E47` PNG, `RIFF...WEBP` WebP).
- **Zero Disk Storage Invariant**: El servidor no cuenta con directorios temporales de subida ni bases de datos de imágenes de usuarios.
