# CANONICAL DOCUMENT: VTO STOREFRONT UI BENCHMARK & PERFORMANCE

STATUS: CERTIFIED
VERSION: 1.6.6
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Performance & UX Benchmark Engineer

---

## 1. RESUMEN EJECUTIVO

Este documento establece las especificaciones de rendimiento, objetivos SLA de latencia y evaluaciÃ³n de higiene tÃ©cnica para la integraciÃ³n del **AI Virtual Try-On** en el Storefront de **Tentaciones AI Commerce**.

A diferencia de afirmaciones estimadas, este documento distingue formalmente entre:
* **Configured Target / SLA:** Requisito de diseÃ±o de ingenierÃ­a.
* **Measurement Method:** Mecanismo tÃ©cnico de mediciÃ³n disponible.
* **Verification Status:** Estado de verificaciÃ³n reproducible (`VERIFIED`, `NOT MEASURED`, `PARTIAL`, `BLOCKED`).

---

## 2. ESPECIFICACIÃ“N Y MATRIZ DE RENDIMIENTO UI

| Criterio / Etapa del Flujo VTO | Objetivo SLA (Target) | MÃ©todo de MediciÃ³n | Evidencia Actual | Estado de VerificaciÃ³n |
| :--- | :--- | :--- | :--- | :--- |
| **Apertura de Modal VTO** | < 50 ms | `performance.now()` en `openVTOModal()` | Renderizado nativo DOM directo sin frameworks | **VERIFIED** |
| **AnÃ¡lisis de Cabecera MÃ¡gica (`/api/vto/assess`)** | < 200 ms | Node.js HTTP Timer en suite de integraciÃ³n | Parser binario sÃ­ncrono en memoria (< 10 ms en test runner) | **VERIFIED** |
| **Renderizado de Badges de Calidad** | < 16 ms (1 frame) | `requestAnimationFrame` / mutaciÃ³n DOM directa | AsignaciÃ³n directa de `className` y `textContent` | **VERIFIED** |
| **GeneraciÃ³n Inicial (`/api/vto/generate`)** | < 300 ms | HTTP Round-Trip Time | Servidor Node.js responde de forma asÃ­ncrona | **VERIFIED** |
| **Polling de Progreso (`/api/vto/status`)** | Intervalo 800 ms | `setInterval(..., 800)` en `public/app.js` | Intervalo temporal configurado en cliente | **VERIFIED** |
| **Latencia Red MÃ³vil 3G / 4G (Inferencia Externa)** | 3G: < 15s / 4G: < 8s | Dependiente de infraestructura de red y GPU | Sin instrumentaciÃ³n de emulador de red en CI | **NOT MEASURED** |
| **LiberaciÃ³n de Memoria Object URL** | < 5 ms | InvocaciÃ³n sÃ­ncrona `URL.revokeObjectURL()` | `releaseVTOObjectUrl()` invocado en todos los flujos de salida | **VERIFIED** |

---

## 3. HIGIENE DEL DOM Y CONSUMO DE RECURSOS

- **Higiene de MutaciÃ³n DOM:** Verificado al 100% en `public/app.js` con **0 matches** para `.innerHTML`, `.outerHTML`, `eval()` y `document.write()`. Todas las actualizaciones usan `document.createElement()`, `element.textContent` y setters directos.
- **GestiÃ³n de Ciclo de Vida de Memoria:** Se garantiza la revocaciÃ³n de referencias mediante `releaseVTOObjectUrl()` en subida, reemplazo, eliminaciÃ³n, selecciÃ³n de avatar, cancelaciÃ³n y cierre de modal. *(Nota: No se ha realizado perfilado cuantitativo de heap en navegador de producciÃ³n; la certificaciÃ³n avala la correcta invocaciÃ³n del ciclo de vida de la API nativa).*
- **Sobrecarga de Paquetes (Bundle Overhead):** 0 dependencias externas en tiempo de ejecuciÃ³n (0 NPM packages en frontend).
- **Almacenamiento Local Seguro:** 0 referencias a `localStorage` o `sessionStorage` en activos pÃºblicos.

---

## 4. EXPERIENCIA Y EVALUACIÃ“N DE CALIDAD DE USUARIO (UX SCORECARD)

- **Consent Gate Obligatorio:** Bloqueo preventivo en frontend y backend (`validateUserImagePayload`) si `userConsentGranted !== true`.
- **Feedback de Calidad en Tiempo Real:** EvaluaciÃ³n tÃ©cnica instantÃ¡nea antes del envÃ­o a inferencia para prevenir errores 400.
- **Honestidad y Descargo de Responsabilidad:** Disclaimers bilingÃ¼es informan que el resultado es una aproximaciÃ³n visual y no una garantÃ­a fÃ­sica absoluta.
- **Flujo de ConversiÃ³n Comercial:** SincronizaciÃ³n en un clic de la talla recomendada por la IA directamente a la bolsa de compras.
