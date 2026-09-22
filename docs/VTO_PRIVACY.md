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

## 5. Cumplimiento Normativo (GDPR & Ley Chilena N° 19.628 / 21.096)

* **Principio de Minimización de Datos**: Solo se solicita la imagen estrictamente necesaria para generar el renderizado.
* **Principio de Limitación de la Finalidad**: La imagen se destruye inmediatamente tras completar la síntesis o expirar el tiempo de sesión.
* **Derecho de Supresión Inmediata**: Al no existir almacenamiento secundario persistente, la eliminación es intrínseca al ciclo de vida de la petición HTTP.
