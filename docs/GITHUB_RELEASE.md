# TENTACIONES AI COMMERCE — GITHUB RELEASE & PRIVATE REPOSITORY STRATEGY

============================================================
CANONICAL DOCUMENT: docs/GITHUB_RELEASE.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: SOURCE CODE & RELEASE POLICY
CORRESPONDING CODE CONTRACT: Polyrepo IP Boundary
============================================================

## 1. Visibilidad y Política de Repositorio

El código fuente de **Tentaciones AI Commerce (`PROJ-01-TENTACIONES`)** debe permanecer estrictamente en un **repositorio PRIVADO en GitHub**:

```text
GitHub
└── johangonzahenri
    └── tentaciones-ai-commerce (PRIVATE REPOSITORY)
```

### Principio Fundamental:
> **La existencia de una Demo Pública en ejecución (Showcase) NO equivale a la publicación del código fuente.**
> El código fuente propietario, los contratos de cliente y la integración con la plataforma padre permanecen protegidos bajo acceso privado.

---

## 2. Configuración del Repositorio Remoto

- **URL Remota Oficial:** `https://github.com/johangonzahenri/tentaciones-ai-commerce.git`
- **Branch Principal:** `main`
- **Visibilidad:** `PRIVATE`

---

## 3. Pre-Push Security Gate & Auditoría

Antes de cualquier sincronización con GitHub, se ejecutan las siguientes verificaciones automáticas:

1. **Escaneo de Secretos:** Ausencia total de API keys, tokens de producción, contraseñas o credenciales de pago.
2. **Archivos Ignorados (`.gitignore`):** Bloqueo de `.env`, `.env.*`, `node_modules/`, `dist/`, `logs/`, y `*.log`.
3. **Invariante de Pago:** Verificación de que sólo el método `WEBPAY_DEMO` está habilitado.
4. **Higiene DOM:** Verificación estricta de 0 `.innerHTML`, 0 `.outerHTML`, 0 `eval()`, 0 `document.write()`.
