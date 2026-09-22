# Tentaciones AI Commerce (Project 01)
## E-Commerce Inteligente de Moda & Calzado con Probador Virtual 3D/AR

[![Platform: AI Operating Platform](https://img.shields.io/badge/Platform-AI%20Operating%20Platform%20v1.4.0-blue.svg)](https://github.com/johangonzahenri/ai-operating-platform)
[![Application ID: tentaciones-commerce](https://img.shields.io/badge/App%20ID-tentaciones--commerce-indigo.svg)](#)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-green.svg)](#)
[![Zero Runtime Dependencies](https://img.shields.io/badge/Dependencies-0%20Runtime%20Deps-brightgreen.svg)](#)

---

## 1. Visión General

**Tentaciones AI Commerce** es la primera aplicación satélite standalone derivada del ecosistema **AI Operating Platform**. Constituye una solución integral de comercio electrónico para retail de vestuario, calzado y accesorios, diseñada para maximizar la conversión mediante:

1. **Búsqueda Semántica en Lenguaje Natural**: Comprensión de intención en lenguaje natural (español) para identificar prendas, ocasiones de uso y preferencias estéticas.
2. **Probador Virtual 3D / Realidad Aumentada (AR)**: Integración con WebXR, renderizado de siluetas tridimensionales y resolución determinista de identificadores de recursos `urn:tentaciones:ar:*`.
3. **Calibración Biométrica de Tallas**: Algoritmo que correlaciona medidas corporales con perfiles demo (`Nova`, `Sora`, `Mateo`) para recomendar tallas precisas y reducir devoluciones.
4. **Asistente de Carrito & Checkout Simulado**: Monitoreo dinámico del umbral de despacho gratuito (\$30.000 CLP) y simulación comercial con pasarela `WEBPAY_DEMO`.
5. **Tolerancia a Fallos y Fallback Automático**: Si la plataforma padre no está disponible, la tienda continúa operando sin interrupción conmutando a `LOCAL_FALLBACK`.

---

## 2. Relación Padre → Hijo con AI Operating Platform

```text
========================================================================================
                          AI OPERATING PLATFORM (PARENT / PLATFORM)
                 Motor Central • Persistencia WAL • Gobernanza • API REST
========================================================================================
                                           │
                                           ▼ (/api/v1/*)
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                   TentacionesPlatformAdapter / PlatformClient                        │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                   Tentaciones AI Commerce (Standalone Storefront)                     │
│               Catálogo • Carrito • Probador AR 3D • Checkout Demo                     │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Inicio Rápido

### Requisitos Previos:
* Node.js $\ge 22.0.0$
* Conexión opcional a una instancia de **AI Operating Platform** en `http://127.0.0.1:3000/api/v1` (si la plataforma no está activa, la tienda opera automáticamente en modo `LOCAL_FALLBACK`).

### Instalación y Ejecución:
```bash
# 1. Clonar el repositorio
git clone https://github.com/johangonzahenri/tentaciones-ai-commerce.git
cd tentaciones-ai-commerce

# 2. Compilar TypeScript
npm run build

# 3. Ejecutar suite de pruebas unitarias
npm test

# 4. Iniciar servidor web de la tienda
npm start
```

Abrir en el navegador: [http://127.0.0.1:4000](http://127.0.0.1:4000)

---

## 4. Estructura del Proyecto

```text
tentaciones-ai-commerce/
├── docs/                       # Documentación canónica certificada
│   ├── PUBLIC_DEMO.md          # Especificación y aislamiento del modo Demo Público
│   ├── DEMO_SECURITY.md        # Políticas fail-closed y sanitización de datos
│   ├── IP_PROTECTION.md        # Límites de propiedad intelectual y arquitectura polyrepo
│   ├── MULTICLIENT_ARCHITECTURE.md # Contrato headless multi-cliente (Web/Mobile/Kiosk)
│   ├── PORTFOLIO_SHOWCASE.md   # Guía comercial y métricas de demostración
│   └── DEPLOYMENT_STRATEGY.md  # Topología de despliegue y hardening
├── public/                     # Storefront Web SPA Accesible
│   ├── index.html              # Layout HTML semántico con banner de demo segura
│   ├── styles.css              # Sistema de diseño, métricas y drawer showcase
│   ├── app.js                  # Controlador DOM seguro (0 innerHTML)
│   └── i18n.js                 # Diccionario bilingüe (es-419 / en)
├── src/
│   ├── contracts/              # Contratos de experiencia desacoplados
│   │   ├── experience-contract.ts # ITentacionesExperienceService
│   │   └── operational-mode.ts    # Resolvedor de modos operativos
│   ├── domain/                 # Entidades y lógica de negocio
│   │   ├── types.ts            # Tipos e interfaces de dominio
│   │   ├── catalog-data.ts     # Catálogo sintético de moda y calzado
│   │   └── ar-fitting.ts       # Calibración biométrica y URNs AR
│   ├── security/               # Invariantes de seguridad fail-closed
│   │   └── demo-guardrails.ts  # Gatekeeper, sanitización y redaction
│   ├── adapter/                # Implementaciones del contrato
│   │   ├── demo-adapter.ts     # Adaptador sintético para demo público
│   │   ├── platform-client.ts  # Cliente HTTP REST para Platform API
│   │   ├── tentaciones-platform-adapter.ts # Adaptador conectado con fallback
│   │   └── tentaciones-service-factory.ts  # Fábrica del servicio según modo
│   ├── engine/
│   │   └── commerce-engine.ts  # Motor de búsqueda, carrito y checkout
│   └── server.ts               # Servidor HTTP nativo con cabeceras de seguridad
├── tests/
│   ├── tentaciones.test.ts     # Suite de pruebas automatizadas
│   └── demo-security.test.ts   # Pruebas de seguridad fail-closed y multicliente
├── README.md                   # Presentación del proyecto
├── ARCHITECTURE.md             # Especificación arquitectónica detallada
├── INTEGRATION.md              # Contrato de integración con la plataforma
├── DEVELOPMENT.md              # Guía para desarrolladores y setup
├── ROADMAP.md                  # Hitos de desarrollo
└── .env.example                # Plantilla de variables de entorno
```

---

## 5. Modos de Operación y Seguridad Fail-Closed

1. **`PUBLIC_DEMO` (Por Defecto):** Aislamiento 100% sintético. Cero secretos en bundle, sin llamadas salientes a dominios corporativos internos, y rechazo inmediato de tokens de pago reales.
2. **`PRIVATE_CONNECTED_DEMO`:** Modo conectado de demostración para clientes autorizados mediante gateway seguro a AI Operating Platform.
3. **`DEVELOPMENT`:** Modo local para pruebas de desarrollo e integración.

---

## 6. Licencia

Desarrollado bajo licencia **Apache-2.0**.
