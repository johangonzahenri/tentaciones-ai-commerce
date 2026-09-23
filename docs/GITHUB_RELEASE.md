# TENTACIONES AI COMMERCE â€” GITHUB RELEASE & PRIVATE REPOSITORY STRATEGY

============================================================
CANONICAL DOCUMENT: docs/GITHUB_RELEASE.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: SOURCE CODE & RELEASE POLICY
CORRESPONDING CODE CONTRACT: Polyrepo IP Boundary
============================================================

## 1. Visibilidad y PolÃ­tica de Repositorio

El cÃ³digo fuente de **Tentaciones AI Commerce (`PROJ-01-TENTACIONES`)** debe permanecer estrictamente en un **repositorio PRIVADO en GitHub**:

```text
GitHub
â””â”€â”€ johangonzahenri
    â””â”€â”€ tentaciones-ai-commerce (PRIVATE REPOSITORY)
```

### Principio Fundamental:
> **La existencia de una Demo PÃºblica en ejecuciÃ³n (Showcase) NO equivale a la publicaciÃ³n del cÃ³digo fuente.**
> El cÃ³digo fuente propietario, los contratos de cliente y la integraciÃ³n con la plataforma padre permanecen protegidos bajo acceso privado.

---

## 2. ConfiguraciÃ³n del Repositorio Remoto

- **URL Remota Oficial:** `https://github.com/johangonzahenri/tentaciones-ai-commerce.git`
- **Branch Principal:** `main`
- **Visibilidad:** `PRIVATE`

---

## 3. Pre-Push Security Gate & AuditorÃ­a

Antes de cualquier sincronizaciÃ³n con GitHub, se ejecutan las siguientes verificaciones automÃ¡ticas:

1. **Escaneo de Secretos:** Ausencia total de API keys, tokens de producciÃ³n, contraseÃ±as o credenciales de pago.
2. **Archivos Ignorados (`.gitignore`):** Bloqueo de `.env`, `.env.*`, `node_modules/`, `dist/`, `logs/`, y `*.log`.
3. **Invariante de Pago:** VerificaciÃ³n de que sÃ³lo el mÃ©todo `WEBPAY_DEMO` estÃ¡ habilitado.
4. **Higiene DOM:** VerificaciÃ³n estricta de 0 `.innerHTML`, 0 `.outerHTML`, 0 `eval()`, 0 `document.write()`.
