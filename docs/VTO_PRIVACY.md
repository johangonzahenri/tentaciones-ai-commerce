# TENTACIONES AI COMMERCE — PRIVACY & BIOMETRIC DATA POLICY (VTO PRIVACY)

============================================================
CANONICAL DOCUMENT: docs/VTO_PRIVACY.md
STATUS: CERTIFIED
SECURITY CLASSIFICATION: PRIVACY BY DESIGN & DATA PROTECTION MANUAL
CORRESPONDING CODE CONTRACT: vto-guardrails.ts / validateUserImagePayload
============================================================

## 1. Declaración de Principios de Privacidad

*Tentaciones AI Commerce* ha sido diseñado bajo el principio rector de **Privacy by Design & Default**. El motor de Virtual Try-On reconoce que las fotografías corporales y faciales constituyen datos personales sensibles y biométricos que exigen las máximas garantías de confidencialidad, no persistencia y control soberano por parte del usuario.

---

## 2. Los Cuatro Pilares de Privacidad de Tentaciones

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LOS 4 PILARES DE PRIVACIDAD VTO                       │
├─────────────────────────┬─────────────────────────┬─────────────────────────┤
│ 1. CONSENTIMIENTO       │ 2. PROCESAMIENTO        │ 3. ZERO PERSISTENCIA    │
│    EXPLÍCITO PREVIO     │    100% EFÍMERO         │    & ZERO LOGGING       │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Exigido antes de        │ Imágenes en memoria     │ 0 fotos en disco        │
│ cualquier captura o     │ volátil (Buffer RAM);   │ 0 fotos en logs         │
│ subida de imagen.       │ expiración inmediata.   │ 0 base de datos de user.│
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

---

## 3. Flujo de Consentimiento del Usuario

1. **Pantalla de Consentimiento Obligatorio**: Al pulsar "✨ Probar con IA", el usuario visualiza una pantalla explicativa que detalla:
   - Que la imagen se utilizará únicamente para sintetizar la prenda seleccionada.
   - Que la fotografía no será almacenada, vendida ni utilizada para entrenamiento de modelos base.
   - Que puede optar en cualquier momento por usar los **Avatares Sintéticos Precalibrados** (Nova, Sora, Mateo) sin subir fotos propias.
2. **Rechazo o Cancelación**: Si el usuario no otorga su consentimiento, el modal se cierra y no se habilita ninguna función de captura.

---

## 4. Tratamiento Técnico de las Imágenes

### En el Navegador (Cliente)
* La imagen seleccionada se lee localmente mediante la API estándar `FileReader`.
* Las previsualizaciones en pantalla utilizan `URL.createObjectURL(file)`.
* Al cerrar el modal, cambiar de producto o eliminar la foto, el cliente ejecuta inmediatamente `URL.revokeObjectURL()` para liberar la memoria del navegador.

### En el Servidor (Backend)
* La imagen se recibe como payload Base64 codificado en memoria.
* La función `validateUserImagePayload` valida formato (JPEG/PNG/WebP), tamaño (máx. 5 MB) y dimensiones permitidas.
* La imagen se transfiere temporalmente mediante HTTPS con cifrado TLS 1.3 al endpoint de inferencia.
* **Nunca se escribe la imagen en el sistema de archivos del servidor (`fs.writeFile` prohibido para fotos de usuario).**
* Los logs operativos omiten deliberadamente el cuerpo del payload de la imagen, registrando únicamente métricas anonimizadas (tamaño en bytes, categoría de la prenda, tiempo de inferencia en ms).

---

## 5. Distinción entre la Privacidad de Tentaciones y la Retención del Proveedor

Es fundamental distinguir la política soberana de *Tentaciones AI Commerce* de la política operativa del proveedor externo de inferencia:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│             MATRIZ DE RETENCIÓN: TENTACIONES vs FASHN AI                     │
├──────────────────────────────┬──────────────────────────────────────────────┤
│ TENTACIONES (SISTEMA PROPIO) │ • 0 fotos almacenadas en disco o base datos  │
│                              │ • 0 logs de Base64 o payloads binarios       │
│                              │ • Procesamiento 100% volátil en Buffer RAM   │
│                              │ • Revocación de ObjectURL inmediata en SPA   │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ FASHN AI (PROVEEDOR SAAS)    │ • Salidas estándar CDN: expiran en 3 días    │
│                              │ • Salidas return_base64=true: expiran en     │
│                              │   hasta 60 minutos tras completarse el job   │
│                              │ • Metadatos de la petición en historial API  │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

*Tentaciones no garantiza la ausencia total de retención por parte del proveedor externo*, sino que aplica las configuraciones más restrictivas posibles (`return_base64: true`, `num_images: 1`) para minimizar cualquier persistencia en la infraestructura de FASHN AI.

---

## 6. Cumplimiento Normativo (GDPR & Ley Chilena N° 19.628 / 21.096)

* **Principio de Minimización de Datos**: Solo se solicita la imagen estrictamente necesaria para generar el renderizado.
* **Principio de Limitación de la Finalidad**: La imagen se destruye en el backend inmediatamente tras completar la síntesis o expirar el tiempo de sesión.
* **Derecho de Supresión Inmediata**: Al no existir almacenamiento secundario persistente en Tentaciones, la eliminación es intrínseca al ciclo de vida de la petición HTTP.
