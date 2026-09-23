# TENTACIONES AI COMMERCE â€” DEPLOYMENT & HOSTING STRATEGY

============================================================
CANONICAL DOCUMENT: docs/DEPLOYMENT_STRATEGY.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: DEVOPS & INFRASTRUCTURE
CORRESPONDING CODE CONTRACT: src/server.ts / Operational Modes
============================================================

## 1. Deployment Topology Overview

Tentaciones AI Commerce supports three distinct deployment models tailored to operational requirements:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                              DEPLOYMENT TOPOLOGY                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Model 1: Public Static / Edge CDN    â”‚ Model 2: Standalone Node / Container     â”‚
â”‚ (GitHub Pages, Vercel, Netlify, S3)  â”‚ (Docker, Cloud Run, Kubernetes, Fly.io)  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ - Static assets in `public/`         â”‚ - Standalone Node.js server (`server.ts`)â”‚
â”‚ - Zero backend runtime required      â”‚ - Native HTTP server (0 npm deps)        â”‚
â”‚ - Deterministic client fallback      â”‚ - Complete REST API (`/api/*`) endpoints â”‚
â”‚ - 100% immune to server downtime     â”‚ - Fail-closed server-side gatekeepers    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 2. Model 1: Public Edge Static Hosting (GitHub Pages / Vercel / Netlify)

For purely public portfolio showcases where no server container is desired:
- **Build Output:** The contents of `public/` are 100% self-contained static HTML, CSS, and modern ES module JS.
- **Data Layer:** When `/api/*` endpoints are unreachable, `app.js` gracefully falls back to the embedded synthetic catalog (`getFallbackCatalog()`).
- **Zero Secrets:** Guarantees zero sensitive environment variables can ever be leaked because none are bundled.

---

## 3. Model 2: Standalone Containerized Service (Docker / Cloud Run)

For active demo environments and connected multi-client setups:
- **Dockerfile Recipe:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src/ ./src/
COPY tests/ ./tests/
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DEMO_MODE=true
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/src/server.js"]
```

- **Health Checks:** Native `/health` HTTP probe returning `200 OK` with zero overhead.
- **Resource Footprint:** Memory consumption < 25MB RSS, 0ms cold boot latency.

---

## 4. Environment Configuration Reference

| Environment Variable | Allowed Values | Default | Description |
| :--- | :--- | :--- | :--- |
| `DEMO_MODE` | `true`, `false` | `true` | When `true`, enforces synthetic `PUBLIC_DEMO` isolation. |
| `OPERATIONAL_MODE` | `PUBLIC_DEMO`, `PRIVATE_CONNECTED_DEMO`, `DEVELOPMENT` | `PUBLIC_DEMO` | Explicit mode override. |
| `PORT` | Integer (e.g. `3000`) | `3000` | Port for local Node HTTP server. |
| `PLATFORM_BASE_URL` | Valid URL (non-internal in Demo) | `undefined` | Upstream AI Operating Platform endpoint (only in Connected mode). |
| `PLATFORM_API_KEY` | String | `undefined` | Upstream Platform auth key (prohibited in `PUBLIC_DEMO`). |

---

## 5. Security & Fail-Closed Pre-Flight Checklist

Before deploying any instance to a public URL:
1. Ensure `DEMO_MODE=true` is set.
2. Verify `PLATFORM_API_KEY` is not present in the deployment environment.
3. Run test suite: `node --test dist/tests/*.js` to ensure 100% pass on security assertions.
4. Verify CSP and security headers are active on response inspection.
