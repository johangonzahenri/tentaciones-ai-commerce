# TENTACIONES AI COMMERCE â€” SHOWCASE & LIVE DEMO CHECKLIST

============================================================
CANONICAL DOCUMENT: docs/SHOWCASE_CHECKLIST.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: OPERATIONAL SHOWCASE CHECKLIST
CORRESPONDING CODE CONTRACT: ITentacionesExperienceService / UI Showcase
============================================================

## 1. VerificaciÃ³n Pre-PresentaciÃ³n (Pre-Flight Checks)

Antes de iniciar una demostraciÃ³n en vivo con clientes, inversores o evaluadores tÃ©cnicos:

- [ ] **Modo Operativo:** Verificar que el banner superior muestre `PUBLIC DEMO` o `MODO DEMO`.
- [ ] **Aislamiento de Secretos:** Confirmar que no existan API keys ni tokens en consola.
- [ ] **Higiene DOM:** Verificar cero excepciones en la consola del navegador (`F12`).
- [ ] **MÃ©tricas Verificables:** Confirmar que la barra de mÃ©tricas muestre datos consistentes del entorno demo (productos, sesiones AR, recomendaciones, Ã³rdenes).

---

## 2. Guion de DemostraciÃ³n (Paso a Paso)

| Paso | AcciÃ³n del Presentador | Respuesta Esperada del Sistema |
| :--- | :--- | :--- |
| **1. Portada & Hero** | Cargar pÃ¡gina de inicio | Se presenta la propuesta de valor: *"Compra. Descubre. PruÃ©bate virtualmente."* con CTAs destacados. |
| **2. BÃºsqueda con IA** | Escribir *"zapatillas de running para maratÃ³n"* | Se filtran instantÃ¡neamente los productos y aparece la caja de feedback: *"IntenciÃ³n detectada: calzado... Recomendado porque coincide con tu estilo."* |
| **3. Probador AR** | Clic en *"ðŸ‘“ Probar en AR"* en *Zapatillas Pro Carbon Racer* | Se abre el modal AR con silueta animada y URN canÃ³nica `urn:tentaciones:ar:footwear:pro-carbon-racer`. |
| **4. Cambio de Perfil** | Alternar entre perfil *Nova* (39) y *Mateo* (42) | La talla recomendada por IA y la justificaciÃ³n cambian dinÃ¡micamente. |
| **5. Modo 2D vs WebXR** | Probar botones de modo de visualizaciÃ³n | En dispositivos sin WebXR, se activa el modo 2D interactivo con mensaje de estado informativo. |
| **6. Agregar & Carrito** | Clic en *"AÃ±adir al Carrito con Talla Recomendada"* | Se abre la bolsa de compras mostrando el cÃ¡lculo de umbral de despacho gratis (\$30.000 CLP). |
| **7. Checkout Demo** | Clic en *"Proceder al Checkout (Demo)"* $\rightarrow$ Confirmar | Se genera la orden demo con aviso destacado: *"DEMO CHECKOUT Â· NO REAL PAYMENT"*. |
| **8. Arquitectura** | Clic en *"Arquitectura"* en el banner superior | Se despliega el drawer explicando la separaciÃ³n de capas polyrepo y protecciÃ³n de IP. |

---

## 3. Matriz de Compatibilidad Multidispositivo

- **Desktop (Chrome/Firefox/Edge/Safari):** 100% soporte para catÃ¡logo, bÃºsqueda IA y modo 2D interactivo.
- **Tablets (iPad/Android):** Layout responsive fluido con drawer adaptativo.
- **Smartphones (iOS/Android):** Grid de 1 columna para tarjetas, selector tÃ¡ctil de perfiles y botones de fÃ¡cil pulsaciÃ³n.
