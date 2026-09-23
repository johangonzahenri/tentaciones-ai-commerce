# CANONICAL DOCUMENT: PUBLIC RELEASE TREE & GITHUB PAGES ARTIFACT SPECIFICATION

STATUS: CERTIFIED
VERSION: 1.8.1
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
RELEASE SCOPE: STATIC PUBLIC DEMO ARTIFACT
OWNER: Lead Product Engineer, Release Engineer & Security Architect
DATE: 2026-09-23

---

## 1. Public Release Artifact Boundary

El artefacto candidato para publicaciÃ³n en **GitHub Pages** (o cualquier hosting estÃ¡tico puro como Vercel/Netlify) comprende de manera exacta y exclusiva el contenido del directorio `public/`.

```text
PUBLIC RELEASE ARTIFACT (public/)
â”œâ”€â”€ index.html                                   # Punto de entrada HTML5, SEO, semÃ¡ntica y disclosure
â”œâ”€â”€ app.js                                       # Bundle cliente Vanilla JS (ES Modules)
â”œâ”€â”€ styles.css                                   # Estilos CSS, variables de tema y media queries
â”œâ”€â”€ i18n.js                                      # Diccionario bilingÃ¼e (es-419 / en)
â””â”€â”€ assets/
    â”œâ”€â”€ images/
    â”‚   â”œâ”€â”€ hero-cover.svg                       # Imagen vectorial de cabecera principal
    â”‚   â”œâ”€â”€ demo-vto-composite.svg               # Imagen vectorial compuesta de resultado VTO sintÃ©tico
    â”‚   â”œâ”€â”€ walkthrough-step1.svg                # Diagrama ilustrativo de paso 1
    â”‚   â”œâ”€â”€ walkthrough-step2.svg                # Diagrama ilustrativo de paso 2
    â”‚   â”œâ”€â”€ walkthrough-step3.svg                # Diagrama ilustrativo de paso 3
    â”‚   â”œâ”€â”€ walkthrough-step4.svg                # Diagrama ilustrativo de paso 4
    â”‚   â””â”€â”€ walkthrough-step5.svg                # Diagrama ilustrativo de paso 5
    â””â”€â”€ 3d/
        â”œâ”€â”€ accessories/
        â”‚   â””â”€â”€ reloj-titanio.glb                # Modelo 3D binario GLB 2.0 (Reloj Titanio)
        â”œâ”€â”€ apparel/
        â”‚   â”œâ”€â”€ polera-essential.gltf             # Modelo 3D JSON glTF 2.0 (Polera Essential)
        â”‚   â””â”€â”€ silk-evening-dress.gltf          # Modelo 3D JSON glTF 2.0 (Vestido Seda)
        â””â”€â”€ footwear/
            â””â”€â”€ pro-carbon-racer.glb             # Modelo 3D binario GLB 2.0 (Zapatilla Carbon)
```

---

## 2. Inclusiones y Exclusiones Formales

### A. Archivos que se Publican (Public Assets)
1. `public/index.html`
2. `public/app.js`
3. `public/styles.css`
4. `public/i18n.js`
5. `public/assets/images/*.svg` (7 archivos vectoriales)
6. `public/assets/3d/**/*.glb`, `public/assets/3d/**/*.gltf` (4 modelos tridimensionales)

### B. Archivos que NO se Publican (Excluded from Public Static Bundle)
1. **CÃ³digo Fuente del Servidor / Backend**: `src/` (`server.ts`, `domain/`, `adapter/`, `contracts/`, `engine/`).
2. **Archivos de ConfiguraciÃ³n y Claves**: `.env*`, `.git/`, `.gitignore`.
3. **Suites de Pruebas**: `tests/` (`*.test.ts`).
4. **Scripts de Mantenimiento y AuditorÃ­a**: `scripts/` (`*.mjs`).
5. **Artefactos de CompilaciÃ³n de Servidor**: `dist/` (se ejecuta Ãºnicamente en runtime Node.js privado).
6. **Dependencias y MÃ³dulos**: `node_modules/`, `package-lock.json`.
7. **DocumentaciÃ³n Interna**: `docs/`, `ROADMAP.md`.

---

## 3. Requerimientos de Runtime y Dependencias de Red

| Pregunta Fundamental | Respuesta TÃ©cnica Verificada |
| :--- | :--- |
| **Â¿QuÃ© runtime necesita el Public Demo?** | Navegador web moderno con soporte para ES Modules, HTML5 Canvas 2D/WebGL y WebXR Device API (opcional). Cero plugins ni runtimes en servidor. |
| **Â¿QuÃ© recursos necesita durante la ejecuciÃ³n?** | Ãšnicamente los activos estÃ¡ticos contenidos dentro del mismo bundle (`public/`). |
| **Â¿Tiene dependencia estricta de `/api/*`?** | **NO**. El frontend implementa fallbacks cliente deterministas para catÃ¡logo, bÃºsqueda y cÃ¡lculo de probador sintÃ©tico. Las llamadas `/api/products` y `/api/metrics` fallan silenciosamente y cargan el catÃ¡logo sintÃ©tico embebido. |
| **Â¿Tiene dependencia de Node.js en hosting estÃ¡tico?** | **NO**. Funciona al 100% como Single Page Application estÃ¡tica servida por un CDN o GitHub Pages. |
| **Â¿Tiene dependencia de secretos o variables de entorno?** | **CERO**. No requiere `FASHN_API_KEY`, ni tokens bancarios ni credenciales de terceros. |

---

## 4. AnÃ¡lisis de Rutas Base y Compatibilidad de Subpath

Para soportar el despliegue tanto en raÃ­z de dominio (`https://custom-domain.com/`) como en subrutas de GitHub Pages (`https://<username>.github.io/<repo>/`):
* Todas las importaciones de scripts y hojas de estilo en `public/index.html` utilizan rutas relativas (`styles.css`, `app.js`).
* Las referencias a modelos 3D y walkthrough utilizan resoluciÃ³n uniforme con prefijo relativo normalizado.
