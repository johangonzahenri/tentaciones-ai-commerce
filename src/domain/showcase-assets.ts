/**
 * Showcase Assets & Media Manifest
 * Domain Registry for Portfolio Presentation and AR Walkthrough
 */

export interface ShowcaseMediaItem {
  id: string;
  title: string;
  category: "hero" | "ar_walkthrough" | "3d_model" | "biometric_fitting" | "diagram";
  description: string;
  path: string;
  format: "png" | "jpg" | "svg" | "glb" | "gltf" | "webm";
  aspectRatio: string;
  license: string;
  caption: {
    es: string;
    en: string;
  };
}

export interface ARWalkthroughStep {
  stepNumber: number;
  id: string;
  title: {
    es: string;
    en: string;
  };
  subtitle: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  technicalDetails: {
    es: string;
    en: string;
  };
  badge: {
    es: string;
    en: string;
  };
  mediaId: string;
}

export interface ProductHonestyEntry {
  featureId: string;
  featureName: {
    es: string;
    en: string;
  };
  status: "IMPLEMENTED" | "SIMULATED" | "FALLBACK_ONLY" | "NOT_IMPLEMENTED" | "BLOCKED" | "PARTIAL" | "NOT_STARTED";
  implementationDetail: {
    es: string;
    en: string;
  };
}

export const SHOWCASE_MEDIA_REGISTRY: readonly ShowcaseMediaItem[] = [
  {
    id: "hero-cover-canvas",
    title: "Tentaciones Hero Identity",
    category: "hero",
    description: "Modern e-commerce hero banner showcasing 3D spatial apparel and WebXR try-on badge",
    path: "/assets/images/hero-cover.svg",
    format: "svg",
    aspectRatio: "16:9",
    license: "CC0-1.0 / Synthetic Portfolio Asset",
    caption: {
      es: "Identidad visual y experiencia inmersiva de Tentaciones AI Commerce",
      en: "Visual identity and immersive experience of Tentaciones AI Commerce",
    },
  },
  {
    id: "ar-step1-product-selection",
    title: "Step 1: Product Selection & 3D Inspection",
    category: "ar_walkthrough",
    description: "User selects item from catalog, triggers real-time 3D canvas with GLTF loading",
    path: "/assets/images/walkthrough-step1.svg",
    format: "svg",
    aspectRatio: "16:9",
    license: "CC0-1.0 / Synthetic Showcase Asset",
    caption: {
      es: "Paso 1: Selección de producto e inspección tridimensional con órbita 360°",
      en: "Step 1: Product selection and 3D inspection with 360° orbital control",
    },
  },
  {
    id: "ar-step2-capability-handshake",
    title: "Step 2: WebXR Capability Handshake",
    category: "ar_walkthrough",
    description: "Device capability check evaluating immersive-ar and hit-test features",
    path: "/assets/images/walkthrough-step2.svg",
    format: "svg",
    aspectRatio: "16:9",
    license: "CC0-1.0 / Synthetic Showcase Asset",
    caption: {
      es: "Paso 2: Handshake de compatibilidad WebXR y solicitud de sesión inmersiva",
      en: "Step 2: WebXR capability handshake and immersive session request",
    },
  },
  {
    id: "ar-step3-hit-test-scanning",
    title: "Step 3: Plane Scanning & Reticle Tracking",
    category: "ar_walkthrough",
    description: "XRHitTestSource raycasting against physical planes to track placement reticle",
    path: "/assets/images/walkthrough-step3.svg",
    format: "svg",
    aspectRatio: "16:9",
    license: "CC0-1.0 / Synthetic Showcase Asset",
    caption: {
      es: "Paso 3: Escaneo de superficie real mediante XRHitTestSource y retícula de anclaje",
      en: "Step 3: Physical surface scanning via XRHitTestSource and anchoring reticle",
    },
  },
  {
    id: "ar-step4-spatial-placement",
    title: "Step 4: Spatial Placement & Occlusion",
    category: "ar_walkthrough",
    description: "User taps to anchor 3D asset in physical world coordinate system",
    path: "/assets/images/walkthrough-step4.svg",
    format: "svg",
    aspectRatio: "16:9",
    license: "CC0-1.0 / Synthetic Showcase Asset",
    caption: {
      es: "Paso 4: Fijación espacial del modelo 3D en coordenadas del mundo real",
      en: "Step 4: Spatial anchoring of 3D model in real-world coordinates",
    },
  },
  {
    id: "ar-step5-interaction-bag",
    title: "Step 5: Spatial Transformations & Checkout Handoff",
    category: "ar_walkthrough",
    description: "Scale and rotation gestures with instant biometric size match and bag addition",
    path: "/assets/images/walkthrough-step5.svg",
    format: "svg",
    aspectRatio: "16:9",
    license: "CC0-1.0 / Synthetic Showcase Asset",
    caption: {
      es: "Paso 5: Ajuste de escala, rotación interactiva y adición directa al carrito",
      en: "Step 5: Scale adjustment, interactive rotation, and direct bag addition",
    },
  },
];

export const AR_WALKTHROUGH_STEPS: readonly ARWalkthroughStep[] = [
  {
    stepNumber: 1,
    id: "select-and-inspect",
    title: {
      es: "1. Selección e Inspección 3D",
      en: "1. Selection & 3D Inspection",
    },
    subtitle: {
      es: "Renderizado tridimensional inmediato en el navegador",
      en: "Instant 3D rendering in the web browser",
    },
    description: {
      es: "El usuario explora el catálogo asistido por IA y abre la vista 3D interactiva del producto. El motor carga assets binarios glTF / GLB reales con iluminación PBR optimizada y control orbital 360°.",
      en: "The user explores the AI-assisted catalog and opens the interactive 3D product view. The engine loads real glTF / GLB binary assets with optimized PBR lighting and 360° orbital controls.",
    },
    technicalDetails: {
      es: "Formatos: GLB/glTF 2.0. Render: Canvas WebGL / Procedural fallback. Peso medio: < 2.5 MB.",
      en: "Formats: GLB/glTF 2.0. Render: Canvas WebGL / Procedural fallback. Average size: < 2.5 MB.",
    },
    badge: {
      es: "Inspección 3D",
      en: "3D Inspection",
    },
    mediaId: "ar-step1-product-selection",
  },
  {
    stepNumber: 2,
    id: "webxr-handshake",
    title: {
      es: "2. Handshake y Detección WebXR",
      en: "2. WebXR Handshake & Detection",
    },
    subtitle: {
      es: "Evaluación de hardware y permisos de cámara",
      en: "Hardware evaluation & camera permissions",
    },
    description: {
      es: "Al presionar 'Probar en Realidad Aumentada', el sistema consulta `navigator.xr.isSessionSupported('immersive-ar')` y verifica `hit-test`. Si el dispositivo no tiene soporte AR inmersivo, degrada de forma transparente a visualizador 3D interactivo.",
      en: "Upon clicking 'Try in Augmented Reality', the system queries `navigator.xr.isSessionSupported('immersive-ar')` and verifies `hit-test`. If unsupported, it gracefully degrades to the interactive 3D viewer.",
    },
    technicalDetails: {
      es: "Feature flags: `requiredFeatures: ['hit-test']`, `optionalFeatures: ['dom-overlay', 'light-estimation']`.",
      en: "Feature flags: `requiredFeatures: ['hit-test']`, `optionalFeatures: ['dom-overlay', 'light-estimation']`.",
    },
    badge: {
      es: "Handshake WebXR",
      en: "WebXR Handshake",
    },
    mediaId: "ar-step2-capability-handshake",
  },
  {
    stepNumber: 3,
    id: "hit-test-scanning",
    title: {
      es: "3. Escaneo y Detección de Planos",
      en: "3. Plane Scanning & Hit-Testing",
    },
    subtitle: {
      es: "Cálculo de intersección espacial con superficies reales",
      en: "Spatial raycasting against physical floor and table planes",
    },
    description: {
      es: "La cámara transmite el stream óptico y el runtime WebXR calcula rayos de hit-test (`XRHitTestSource`) contra planos físicos detectados. Una retícula visual proyectada sobre el suelo indica el punto exacto de anclaje.",
      en: "The camera transmits the optical stream and WebXR calculates hit-test rays (`XRHitTestSource`) against detected physical planes. A projected floor reticle indicates the exact anchoring point.",
    },
    technicalDetails: {
      es: "Frecuencia: 60 fps en XRFrame loop. Raycast referenceSpace: 'viewer' transformado a 'local-floor'.",
      en: "Frequency: 60 fps XRFrame loop. Raycast referenceSpace: 'viewer' transformed into 'local-floor'.",
    },
    badge: {
      es: "Hit-Test Óptico",
      en: "Optical Hit-Test",
    },
    mediaId: "ar-step3-hit-test-scanning",
  },
  {
    stepNumber: 4,
    id: "spatial-placement",
    title: {
      es: "4. Anclaje y Fijación Espacial",
      en: "4. Spatial Anchoring & Placement",
    },
    subtitle: {
      es: "Ubicación del modelo en coordenadas de mundo real",
      en: "Model placement into real-world coordinate system",
    },
    description: {
      es: "Al tocar la pantalla (`select` event), la matriz de transformación del hit-test se transfiere al modelo 3D. El objeto queda fijado en el espacio tridimensional real mientras el usuario camina a su alrededor.",
      en: "On tap (`select` event), the hit-test transform matrix transfers to the 3D model. The item becomes anchored in real physical 3D space, allowing 6-DoF user exploration.",
    },
    technicalDetails: {
      es: "Transform: Matriz 4x4 de pose espacial (`XRRigidTransform`). Escala clamped: 0.25x a 2.50x.",
      en: "Transform: 4x4 spatial pose matrix (`XRRigidTransform`). Clamped scale: 0.25x to 2.50x.",
    },
    badge: {
      es: "Anclaje 6-DoF",
      en: "6-DoF Anchor",
    },
    mediaId: "ar-step4-spatial-placement",
  },
  {
    stepNumber: 5,
    id: "transform-and-bag",
    title: {
      es: "5. Interacción y Adición al Carrito",
      en: "5. Interaction & Bag Handoff",
    },
    subtitle: {
      es: "Validación biométrica de talla y compra fluida",
      en: "Biometric size validation & seamless checkout",
    },
    description: {
      es: "El probador muestra la recomendación de talla calculada para el perfil seleccionado (Nova, Sora, Mateo). Con un toque, el usuario transfiere la prenda verificada al carrito demo y continúa con el flujo de compra.",
      en: "The fitting engine displays the calculated size recommendation for the selected profile (Nova, Sora, Mateo). With one tap, the user transfers the verified item to the demo bag and proceeds.",
    },
    technicalDetails: {
      es: "Biometría: Ajuste determinista por categoría. Carrito: Persistencia local reactiva sin cookies de terceros.",
      en: "Biometrics: Category deterministic sizing. Bag: Reactive local persistence without third-party cookies.",
    },
    badge: {
      es: "Checkout Demo",
      en: "Demo Checkout",
    },
    mediaId: "ar-step5-interaction-bag",
  },
];

export const PRODUCT_HONESTY_MATRIX: readonly ProductHonestyEntry[] = [
  {
    featureId: "3d_viewer",
    featureName: {
      es: "Visualizador 3D Orbitable",
      en: "Orbitable 3D Viewer",
    },
    status: "IMPLEMENTED",
    implementationDetail: {
      es: "Renderizado WebGL nativo en Canvas con iluminación direccional y órbita táctil/ratón.",
      en: "Native Canvas WebGL rendering with directional lighting and touch/mouse orbital control.",
    },
  },
  {
    featureId: "real_glb_gltf",
    featureName: {
      es: "Carga de Modelos Reales GLB / glTF 2.0",
      en: "Real GLB / glTF 2.0 Model Loading",
    },
    status: "IMPLEMENTED",
    implementationDetail: {
      es: "Archivos binarios GLB y JSON glTF 2.0 servidos localmente con validación de magic header.",
      en: "Binary GLB and JSON glTF 2.0 files served locally with magic header verification.",
    },
  },
  {
    featureId: "webxr_hit_test",
    featureName: {
      es: "WebXR Immersive AR & Hit-Testing",
      en: "WebXR Immersive AR & Hit-Testing",
    },
    status: "IMPLEMENTED",
    implementationDetail: {
      es: "Soporte completo para dispositivos compatibles con WebXR (Android Chrome, ARCore). Detección automática de suelo.",
      en: "Full support for WebXR-compatible devices (Android Chrome, ARCore). Automatic floor detection.",
    },
  },
  {
    featureId: "biometric_sizing",
    featureName: {
      es: "Motor de Recomendación de Tallas",
      en: "Biometric Sizing Engine",
    },
    status: "IMPLEMENTED",
    implementationDetail: {
      es: "Algoritmo determinista de ajuste morfológico según categoría y perfiles demo sintéticos.",
      en: "Deterministic morphological sizing algorithm across product categories and synthetic demo profiles.",
    },
  },
  {
    featureId: "body_tracking_mesh",
    featureName: {
      es: "Tracking Corporal Completo en Tiempo Real (Body Tracking)",
      en: "Real-time Full Body Mesh Tracking",
    },
    status: "NOT_IMPLEMENTED",
    implementationDetail: {
      es: "Fuera de alcance en esta fase. No se ejecuta malla esquelética compleja en el cliente.",
      en: "Out of scope for this phase. Complex skeletal mesh fitting is not executed on client.",
    },
  },
  {
    featureId: "cloth_physics_simulation",
    featureName: {
      es: "Simulación Física de Telas (Cloth Deformation)",
      en: "Real-time Cloth Deformation Physics",
    },
    status: "NOT_IMPLEMENTED",
    implementationDetail: {
      es: "Los modelos textiles son estáticos / semi-rígidos para garantizar 60 fps en móviles web estándar.",
      en: "Textile models are static / semi-rigid to ensure solid 60 fps on standard mobile browsers.",
    },
  },
  {
    featureId: "vto_engine",
    featureName: {
      es: "Motor de Virtual Try-On (AI VTO Architecture)",
      en: "Virtual Try-On Engine (AI VTO Architecture)",
    },
    status: "IMPLEMENTED",
    implementationDetail: {
      es: "Abstracción desacoplada de proveedores con guardrails fail-closed y resolución de capacidades por prenda.",
      en: "Decoupled provider abstraction with fail-closed guardrails and apparel capability resolution.",
    },
  },
  {
    featureId: "vto_image_pipeline",
    featureName: {
      es: "Pipeline de Calidad y Normalización de Imagen VTO",
      en: "VTO Image Preparation & Input Quality Pipeline",
    },
    status: "IMPLEMENTED",
    implementationDetail: {
      es: "Auditoría de cabeceras binarias (JPEG/PNG/WebP), límites de resolución (384-4096px), y taxonomía de 5 estados.",
      en: "Binary magic header audit (JPEG/PNG/WebP), resolution limits (384-4096px), and 5-state quality taxonomy.",
    },
  },
  {
    featureId: "fashn_adapter",
    featureName: {
      es: "Adaptador de Inferencia FASHN AI (tryon-max / tryon-v1.6)",
      en: "FASHN AI Inference Adapter (tryon-max / tryon-v1.6)",
    },
    status: "IMPLEMENTED",
    implementationDetail: {
      es: "Conector tipado con soporte de Base64, dominios seguros y clasificación de errores de inferencia.",
      en: "Typed connector with Base64 support, secure domain validation, and inference error classification.",
    },
  },
  {
    featureId: "fashn_real_pilot",
    featureName: {
      es: "Piloto Real de Inferencia FASHN",
      en: "Real FASHN Pilot Execution",
    },
    status: "BLOCKED",
    implementationDetail: {
      es: "Bloqueado de forma honesta y segura por ausencia de FASHN_API_KEY en el entorno de desarrollo.",
      en: "Blocked honestly and safely due to missing FASHN_API_KEY in development environment.",
    },
  },
  {
    featureId: "production_payment_gateways",
    featureName: {
      es: "Pasarelas de Pago Bancario Real (Stripe / Transbank Live)",
      en: "Real Banking Payment Gateways (Stripe / Transbank Live)",
    },
    status: "NOT_IMPLEMENTED",
    implementationDetail: {
      es: "Estrictamente bloqueado por diseño (Fail-Closed). Solo se ejecuta simulador Webpay Demo.",
      en: "Strictly forbidden by design (Fail-Closed). Only simulated Webpay Demo is active.",
    },
  },
];

export function resolveWalkthroughStep(stepNumber: number): ARWalkthroughStep | undefined {
  return AR_WALKTHROUGH_STEPS.find((s) => s.stepNumber === stepNumber);
}

export function resolveShowcaseMedia(mediaId: string): ShowcaseMediaItem | undefined {
  return SHOWCASE_MEDIA_REGISTRY.find((m) => m.id === mediaId);
}
