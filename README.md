# Tentaciones AI Commerce (Project 01)
## Tienda de Moda Inteligente & Probador Virtual 3D/AR

[![Platform: AI Operating Platform](https://img.shields.io/badge/Platform-AI%20Operating%20Platform%20v1.4.0-blue.svg)](https://github.com/johangonzahenri/ai-operating-platform)
[![Application ID: tentaciones-commerce](https://img.shields.io/badge/App%20ID-tentaciones--commerce-indigo.svg)](#)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-green.svg)](#)
[![Zero Runtime Dependencies](https://img.shields.io/badge/Dependencies-0%20Runtime%20Deps-brightgreen.svg)](#)
[![Source: Strictly Private](https://img.shields.io/badge/Source-Strictly%20Private-red.svg)](#)

---

## 1. Visión del Producto

**Tentaciones AI Commerce** es la aplicación satélite insignia de moda, calzado y vestuario del ecosistema **AI Operating Platform**. Proporciona una experiencia de comercio conversacional y visual de alta conversión que integra:

* 🛍️ **Descubrimiento Asistido con IA:** Comprensión de lenguaje natural en español e inglés para interpretar ocasiones de uso, estilos y especificaciones técnicas de prendas.
* 🧊 **Visualización 3D Interactiva con GLB/GLTF Real:** Carga de modelos espaciales binarios y JSON con rotación orbital de 60 FPS, zoom dinámico y auto-giro sin dependencias externas.
* 👓 **Probador Virtual AR & Sizing Paramétrico:** Simulación espacial con perfiles biométricos (`Nova`, `Sora`, `Mateo`) para calcular la talla óptima.
* 🛒 **Bolsa de Compras Inteligente:** Cálculo en tiempo real del beneficio de despacho gratuito (\$30.000 CLP).
* 💳 **Checkout Seguro Demo:** Pasarela de pago simulada (`WEBPAY_DEMO`) con control de existencias antes de mutación y cero riesgo financiero.

---

## 2. Acceso y Demostración Pública

* **Demo Pública Estática:** [https://johangonzahenri.github.io/tentaciones-ai-commerce/](https://johangonzahenri.github.io/tentaciones-ai-commerce/) (o hosting estático Vercel / Netlify)
* **Repositorio de Código Fuente:** **PRIVADO** (`https://github.com/johangonzahenri/tentaciones-ai-commerce.git`)

---

## 3. Experiencia de Demostración Progresiva

```text
CATÁLOGO DE PRODUCTOS
        ↓
BÚSQUEDA ASISTIDA POR IA ("zapatillas de running para maratón")
        ↓
DETALLE DEL PRODUCTO
        ↓
VISUALIZADOR 3D GLTF / GLB REAL
        ↓
PROBADOR VIRTUAL AR (Nova / Sora / Mateo)
        ↓
CALIBRACIÓN BIOMÉTRICA DE TALLA
        ↓
AÑADIR A LA BOLSA
        ↓
CHECKOUT SIMULADO WEBPAY DEMO
```

---

## 4. Inicio Rápido y Desarrollo Local

### Requisitos:
* Node.js $\ge 22.0.0$

### Comandos:
```bash
# 1. Compilar TypeScript
npm run build

# 2. Generar o verificar assets 3D GLB/GLTF
node scripts/generate-3d-assets.mjs

# 3. Ejecutar suite de pruebas
npm test

# 4. Iniciar servidor local
npm start
```

Abrir en el navegador: [http://127.0.0.1:4000](http://127.0.0.1:4000)

---

## 5. Modos de Operación y Seguridad Fail-Closed

1. **`PUBLIC_DEMO` (Predeterminado):** Entorno 100% sintético, sin dependencias externas, sin llamadas a dominios corporativos privados y con rechazo automático de credenciales reales.
2. **`PRIVATE_CONNECTED_DEMO`:** Modo conectado a una instancia de AI Operating Platform mediante gateway autenticado.
3. **`DEVELOPMENT`:** Modo local para desarrollo continuo y pruebas unitarias.

---

## 6. Documentación Canónica (14 Documentos Certificados)

* [`docs/RELEASE_1_3_0.md`](docs/RELEASE_1_3_0.md): Registro de certificación y release v1.3.0.
* [`docs/3D_ARCHITECTURE.md`](docs/3D_ARCHITECTURE.md): Arquitectura matemática del motor de proyección 3D Canvas.
* [`docs/GLTF_ASSET_GUIDE.md`](docs/GLTF_ASSET_GUIDE.md): Especificación de modelos GLB/GLTF, licencias CC0 y presupuestos.
* [`docs/PUBLIC_DEPLOYMENT.md`](docs/PUBLIC_DEPLOYMENT.md): Guía de despliegue estático y Content Security Policy.
* [`docs/DEMO_RELEASE.md`](docs/DEMO_RELEASE.md): Certificación de release v1.2.0 y política de privacidad.
* [`docs/PUBLIC_DEMO.md`](docs/PUBLIC_DEMO.md): Aislamiento y especificación del modo público.
* [`docs/DEMO_SECURITY.md`](docs/DEMO_SECURITY.md): Políticas de seguridad fail-closed y sanitización.
* [`docs/IP_PROTECTION.md`](docs/IP_PROTECTION.md): Límites de propiedad intelectual.
* [`docs/AR_DEMO_GUIDE.md`](docs/AR_DEMO_GUIDE.md): Guía de uso del probador virtual y perfiles.
* [`docs/SHOWCASE_CHECKLIST.md`](docs/SHOWCASE_CHECKLIST.md): Lista de verificación para demos en vivo.
* [`docs/GITHUB_RELEASE.md`](docs/GITHUB_RELEASE.md): Política de repositorio privado.
* [`docs/MULTICLIENT_ARCHITECTURE.md`](docs/MULTICLIENT_ARCHITECTURE.md): Contrato headless multicliente.
* [`docs/DEPLOYMENT_STRATEGY.md`](docs/DEPLOYMENT_STRATEGY.md): Guía de despliegue.
* [`docs/PORTFOLIO_SHOWCASE.md`](docs/PORTFOLIO_SHOWCASE.md): Presentación en portafolio de aplicaciones.

---

## 7. Licencia

Desarrollado bajo licencia **Apache-2.0**.
