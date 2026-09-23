# CANONICAL DOCUMENT: PUBLIC DEMO DEPLOYMENT GUIDE & COMPATIBILITY AUDIT

STATUS: CERTIFIED
VERSION: 1.8.0
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Lead DevOps & Release Engineer
DATE: 2026-09-23

---

## 1. Modos de Despliegue

El proyecto soporta dos modelos operativos diferenciados:

### A. Despliegue EstÃ¡tico (GitHub Pages / Netlify / Vercel Static)
* **Contenido Servido**: Directorio `public/` (`index.html`, `app.js`, `styles.css`, `assets/`).
* **Capacidades Operativas**:
  * CatÃ¡logo de productos y navegaciÃ³n interactiva.
  * Visualizador 3D Canvas con carga de modelos locales GLB/glTF (`.glb`, `.gltf`).
  * SimulaciÃ³n espacial WebXR (requiere origen seguro HTTPS).
  * Carrito de compras y checkout simulado `WEBPAY_DEMO` en cliente.
* **LimitaciÃ³n en Hosting EstÃ¡tico Puro**: Las rutas `/api/vto/*` (evaluaciÃ³n y generaciÃ³n de probador virtual) requieren un backend Node.js en ejecuciÃ³n a menos que se use un runtime serverless o un mock en memoria en cliente.

### B. Despliegue Full-Stack / Servidor Node.js (Recomendado para Demo Completa)
* **Punto de Entrada**: `node dist/src/server.js` (Puerto 4000 por defecto).
* **Capacidades Completas**:
  * Servidor HTTP estÃ¡tico nativo sin dependencias externas.
  * API REST completa de Virtual Try-On:
    * `POST /api/vto/assess`
    * `POST /api/vto/generate`
    * `GET /api/vto/status/:id`
    * `GET /api/vto/result/:id`
    * `POST /api/vto/cancel/:id`
    * `GET /api/vto/metrics`
  * Modo operativo `PUBLIC_DEMO` aislado de forma fail-closed con `DemoVirtualTryOnProvider`.

---

## 2. Variables de Entorno y ConfiguraciÃ³n

| Variable | Tipo | Requerida en Public Demo | DescripciÃ³n |
|---|---|---|---|
| `PORT` | NÃºmero (Default: 4000) | Opcional | Puerto TCP para el servidor HTTP local. |
| `APP_MODE` | String (`PUBLIC_DEMO`) | Opcional | Fuerza el modo demo pÃºblico con aislamiento estricto. |
| `FASHN_API_KEY` | String | **NO REQUERIDA** | Clave de FASHN AI; si estÃ¡ ausente, el gateway bloquea llamadas externas de forma segura. |

---

## 3. Compatibilidad con GitHub Pages

Para desplegar en GitHub Pages:
1. Publicar el contenido de la carpeta `public/` en la raÃ­z de la rama `gh-pages` o mediante GitHub Actions.
2. Asegurar que las rutas a los activos en `public/index.html` y `public/app.js` usen rutas relativas o absolutas consistentes con el `base path` del repositorio.
3. El probador virtual en GitHub Pages opera mediante la previsualizaciÃ³n y simulaciÃ³n de avatares sintÃ©ticos integrados en el bundle cliente.

---

## 4. Limitaciones Conocidas y Restricciones PÃºblicas

* **Inferencia Externa**: Las llamadas reales a proveedores externos (e.g. FASHN AI) no estÃ¡n habilitadas en despliegues pÃºblicos por razones de seguridad y contenciÃ³n de costes.
* **Transacciones Financieras**: El checkout es una simulaciÃ³n (`WEBPAY_DEMO`) sin pasarela de pagos real conectada.
* **Persistencia**: Los datos del carrito se mantienen Ãºnicamente en memoria durante la sesiÃ³n activa.

---

## 5. Verificaciones Post-Despliegue

```bash
# 1. Verificar carga de index.html
curl -I http://127.0.0.1:4000/

# 2. Verificar cabeceras MIME para modelos 3D
curl -I http://127.0.0.1:4000/assets/3d/footwear/pro-carbon-racer.glb
# Debe retornar Content-Type: model/gltf-binary

# 3. Verificar endpoint de salud / mÃ©tricas VTO
curl http://127.0.0.1:4000/api/vto/metrics
```
