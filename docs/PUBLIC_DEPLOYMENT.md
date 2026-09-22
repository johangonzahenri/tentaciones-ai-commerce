# Public Demo Deployment & Hosting Architecture
## AI Operating Platform Portfolio — PROJ-01-TENTACIONES

============================================================
CANONICAL DOCUMENT: docs/PUBLIC_DEPLOYMENT.md
STATUS: CERTIFIED
PROJECT: PROJ-01-TENTACIONES
RELEASE: v1.2.0 (Phase 86)
TARGET PLATFORMS: GitHub Pages / Vercel / Netlify / Cloudflare Pages / Static S3
RUNTIME SECURITY: 0 Secrets, Fail-Closed, Content Security Policy Ready
============================================================

## 1. Zero-Secret Static Architecture

Tentaciones AI Commerce in `PUBLIC_DEMO` mode is completely standalone, client-rendered, and static. It requires zero active backend secrets, no database credentials, and zero private network connectivity.

### Directory Structure of Distributable Artifact:
```text
dist-public/ (or public/)
├── index.html       # Single-Page Storefront Entrypoint
├── styles.css       # Complete UI/AR/3D Stylesheet
├── app.js           # Core Commerce, 3D Engine & AR Adapter
├── i18n.js          # Bilingual Dictionary (es-419 / en)
└── assets/
    ├── 3d/          # 3D Spatial Meshes & Previews
    └── images/      # Product Imagery
```

---

## 2. Deployment Targets & Step-by-Step Instructions

### A. GitHub Pages Deployment (Recommended for Repository Showcases)
1. Build TypeScript:
   ```bash
   npm run build
   ```
2. Enable GitHub Pages in repository settings:
   * **Source**: Deploy from branch `main` or `/public` folder / `gh-pages` branch.
3. Access at: `https://<org-or-user>.github.io/tentaciones-ai-commerce/`

### B. Vercel / Netlify Deployment
1. Set Root Directory: `projects/tentaciones-ai-commerce`
2. Build Command: `npm run build`
3. Output Directory: `public`
4. Set Environment Variables:
   * `APP_MODE=PUBLIC_DEMO`
   * `DEFAULT_CURRENCY=CLP`

---

## 3. Recommended HTTP Security Headers

When serving through an edge proxy or web server (Cloudflare, Nginx, Caddy), apply the following headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), xr-spatial-tracking=(self), geolocation=()
```
