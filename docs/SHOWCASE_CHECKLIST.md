# TENTACIONES AI COMMERCE — SHOWCASE & LIVE DEMO CHECKLIST

============================================================
CANONICAL DOCUMENT: docs/SHOWCASE_CHECKLIST.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: OPERATIONAL SHOWCASE CHECKLIST
CORRESPONDING CODE CONTRACT: ITentacionesExperienceService / UI Showcase
============================================================

## 1. Verificación Pre-Presentación (Pre-Flight Checks)

Antes de iniciar una demostración en vivo con clientes, inversores o evaluadores técnicos:

- [ ] **Modo Operativo:** Verificar que el banner superior muestre `PUBLIC DEMO` o `MODO DEMO`.
- [ ] **Aislamiento de Secretos:** Confirmar que no existan API keys ni tokens en consola.
- [ ] **Higiene DOM:** Verificar cero excepciones en la consola del navegador (`F12`).
- [ ] **Métricas Verificables:** Confirmar que la barra de métricas muestre datos consistentes del entorno demo (productos, sesiones AR, recomendaciones, órdenes).

---

## 2. Guion de Demostración (Paso a Paso)

| Paso | Acción del Presentador | Respuesta Esperada del Sistema |
| :--- | :--- | :--- |
| **1. Portada & Hero** | Cargar página de inicio | Se presenta la propuesta de valor: *"Compra. Descubre. Pruébate virtualmente."* con CTAs destacados. |
| **2. Búsqueda con IA** | Escribir *"zapatillas de running para maratón"* | Se filtran instantáneamente los productos y aparece la caja de feedback: *"Intención detectada: calzado... Recomendado porque coincide con tu estilo."* |
| **3. Probador AR** | Clic en *"👓 Probar en AR"* en *Zapatillas Pro Carbon Racer* | Se abre el modal AR con silueta animada y URN canónica `urn:tentaciones:ar:footwear:pro-carbon-racer`. |
| **4. Cambio de Perfil** | Alternar entre perfil *Nova* (39) y *Mateo* (42) | La talla recomendada por IA y la justificación cambian dinámicamente. |
| **5. Modo 2D vs WebXR** | Probar botones de modo de visualización | En dispositivos sin WebXR, se activa el modo 2D interactivo con mensaje de estado informativo. |
| **6. Agregar & Carrito** | Clic en *"Añadir al Carrito con Talla Recomendada"* | Se abre la bolsa de compras mostrando el cálculo de umbral de despacho gratis (\$30.000 CLP). |
| **7. Checkout Demo** | Clic en *"Proceder al Checkout (Demo)"* $\rightarrow$ Confirmar | Se genera la orden demo con aviso destacado: *"DEMO CHECKOUT · NO REAL PAYMENT"*. |
| **8. Arquitectura** | Clic en *"Arquitectura"* en el banner superior | Se despliega el drawer explicando la separación de capas polyrepo y protección de IP. |

---

## 3. Matriz de Compatibilidad Multidispositivo

- **Desktop (Chrome/Firefox/Edge/Safari):** 100% soporte para catálogo, búsqueda IA y modo 2D interactivo.
- **Tablets (iPad/Android):** Layout responsive fluido con drawer adaptativo.
- **Smartphones (iOS/Android):** Grid de 1 columna para tarjetas, selector táctil de perfiles y botones de fácil pulsación.
