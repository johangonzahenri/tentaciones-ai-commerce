# Guía de Desarrollo — Tentaciones AI Commerce

---

## 1. Configuración del Entorno de Desarrollo

### Requisitos:
* **Node.js**: Versión $\ge 22.0.0$
* **TypeScript**: Versión $\ge 5.8.0$

### Pasos de Inicio:
```bash
# 1. Configurar variables de entorno desde la plantilla
cp .env.example .env

# 2. Compilar los archivos TypeScript
npm run build

# 3. Ejecutar los tests automatizados
npm test

# 4. Iniciar el servidor local
npm start
```

---

## 2. Convenciones de Código

1. **TypeScript Estricto**: Todo el código en `src/` debe compilar sin `any` implícitos ni advertencias de tipos.
2. **Seguridad Frontend**: No utilizar `.innerHTML`, `.outerHTML`, `eval()` ni `document.write()`. Utilizar `document.createElement`, `textContent` y métodos nativos del DOM.
3. **Internacionalización**: Toda cadena de texto dirigida al usuario debe residir en `public/i18n.js` bajo las claves de idioma correspondientes.
