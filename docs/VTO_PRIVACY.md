# TENTACIONES AI COMMERCE â€” PRIVACY & BIOMETRIC DATA POLICY (VTO PRIVACY)

============================================================
CANONICAL DOCUMENT: docs/VTO_PRIVACY.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: PRIVACY BY DESIGN & DATA PROTECTION MANUAL
CORRESPONDING CODE CONTRACT: vto-guardrails.ts / validateUserImagePayload
============================================================

## 1. DeclaraciÃ³n de Principios de Privacidad

*Tentaciones AI Commerce* ha sido diseÃ±ado bajo el principio rector de **Privacy by Design & Default**. El motor de Virtual Try-On reconoce que las fotografÃ­as corporales y faciales constituyen datos personales sensibles y biomÃ©tricos que exigen las mÃ¡ximas garantÃ­as de confidencialidad, no persistencia y control soberano por parte del usuario.

---

## 2. Los Cuatro Pilares de Privacidad de Tentaciones

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                       LOS 4 PILARES DE PRIVACIDAD VTO                       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ 1. CONSENTIMIENTO       â”‚ 2. PROCESAMIENTO        â”‚ 3. ZERO PERSISTENCIA    â”‚
â”‚    EXPLÃCITO PREVIO     â”‚    100% EFÃMERO         â”‚    & ZERO LOGGING       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Exigido antes de        â”‚ ImÃ¡genes en memoria     â”‚ 0 fotos en disco        â”‚
â”‚ cualquier captura o     â”‚ volÃ¡til (Buffer RAM);   â”‚ 0 fotos en logs         â”‚
â”‚ subida de imagen.       â”‚ expiraciÃ³n inmediata.   â”‚ 0 base de datos de user.â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 3. Flujo de Consentimiento del Usuario

1. **Pantalla de Consentimiento Obligatorio**: Al pulsar "âœ¨ Probar con IA", el usuario visualiza una pantalla explicativa que detalla:
   - Que la imagen se utilizarÃ¡ Ãºnicamente para sintetizar la prenda seleccionada.
   - Que la fotografÃ­a no serÃ¡ almacenada, vendida ni utilizada para entrenamiento de modelos base.
   - Que puede optar en cualquier momento por usar los **Avatares SintÃ©ticos Precalibrados** (Nova, Sora, Mateo) sin subir fotos propias.
2. **Rechazo o CancelaciÃ³n**: Si el usuario no otorga su consentimiento, el modal se cierra y no se habilita ninguna funciÃ³n de captura.

---

## 4. Tratamiento TÃ©cnico de las ImÃ¡genes

### En el Navegador (Cliente)
* La imagen seleccionada se lee localmente mediante la API estÃ¡ndar `FileReader`.
* Las previsualizaciones en pantalla utilizan `URL.createObjectURL(file)`.
* Al cerrar el modal, cambiar de producto o eliminar la foto, el cliente ejecuta inmediatamente `URL.revokeObjectURL()` para liberar la memoria del navegador.

### En el Servidor (Backend)
* La imagen se recibe como payload Base64 codificado en memoria.
* La funciÃ³n `validateUserImagePayload` valida formato (JPEG/PNG/WebP), tamaÃ±o (mÃ¡x. 5 MB) y dimensiones permitidas.
* La imagen se transfiere temporalmente mediante HTTPS con cifrado TLS 1.3 al endpoint de inferencia.
* **Nunca se escribe la imagen en el sistema de archivos del servidor (`fs.writeFile` prohibido para fotos de usuario).**
* Los logs operativos omiten deliberadamente el cuerpo del payload de la imagen, registrando Ãºnicamente mÃ©tricas anonimizadas (tamaÃ±o en bytes, categorÃ­a de la prenda, tiempo de inferencia en ms).

---

## 5. DistinciÃ³n entre la Privacidad de Tentaciones y la RetenciÃ³n del Proveedor

Es fundamental distinguir la polÃ­tica soberana de *Tentaciones AI Commerce* de la polÃ­tica operativa del proveedor externo de inferencia:

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚             MATRIZ DE RETENCIÃ“N: TENTACIONES vs FASHN AI                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ TENTACIONES (SISTEMA PROPIO) â”‚ â€¢ 0 fotos almacenadas en disco o base datos  â”‚
â”‚                              â”‚ â€¢ 0 logs de Base64 o payloads binarios       â”‚
â”‚                              â”‚ â€¢ Procesamiento 100% volÃ¡til en Buffer RAM   â”‚
â”‚                              â”‚ â€¢ RevocaciÃ³n de ObjectURL inmediata en SPA   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ FASHN AI (PROVEEDOR SAAS)    â”‚ â€¢ Salidas estÃ¡ndar CDN: expiran en 3 dÃ­as    â”‚
â”‚                              â”‚ â€¢ Salidas return_base64=true: expiran en     â”‚
â”‚                              â”‚   hasta 60 minutos tras completarse el job   â”‚
â”‚                              â”‚ â€¢ Metadatos de la peticiÃ³n en historial API  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

*Tentaciones no garantiza la ausencia total de retenciÃ³n por parte del proveedor externo*, sino que aplica las configuraciones mÃ¡s restrictivas posibles (`return_base64: true`, `num_images: 1`) para minimizar cualquier persistencia en la infraestructura de FASHN AI.

---

## 6. Cumplimiento Normativo (GDPR & Ley Chilena NÂ° 19.628 / 21.096)

* **Principio de MinimizaciÃ³n de Datos**: Solo se solicita la imagen estrictamente necesaria para generar el renderizado.
* **Principio de LimitaciÃ³n de la Finalidad**: La imagen se destruye en el backend inmediatamente tras completar la sÃ­ntesis o expirar el tiempo de sesiÃ³n.
* **Derecho de SupresiÃ³n Inmediata**: Al no existir almacenamiento secundario persistente en Tentaciones, la eliminaciÃ³n es intrÃ­nseca al ciclo de vida de la peticiÃ³n HTTP.
