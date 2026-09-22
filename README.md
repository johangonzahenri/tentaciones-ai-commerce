# Tentaciones AI Commerce (Project 01)
## Tienda de Moda Inteligente & Probador Virtual 3D/AR

[![Platform: AI Operating Platform](https://img.shields.io/badge/Platform-AI%20Operating%20Platform%20v1.4.0-blue.svg)](https://github.com/johangonzahenri/ai-operating-platform)
[![Application ID: tentaciones-commerce](https://img.shields.io/badge/App%20ID-tentaciones--commerce-indigo.svg)](#)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-green.svg)](#)
[![Zero Runtime Dependencies](https://img.shields.io/badge/Dependencies-0%20Runtime%20Deps-brightgreen.svg)](#)

---

## 1. Visión del Producto

**Tentaciones AI Commerce** es la tienda insignia de moda, calzado y vestuario deportivo del ecosistema **AI Operating Platform**. Proporciona una experiencia de compra asistida por Inteligencia Artificial de alta conversión que integra:

* 🛍️ **Descubrimiento Asistido con IA:** Comprensión de lenguaje natural en español para interpretar estilos, ocasiones y requerimientos técnicos de vestuario.
* 👓 **Probador Virtual 3D / AR:** Simulación interactiva de ajuste y compatibilidad espacial (WebXR y modo 2D interactivo).
* 📐 **Calibración Biométrica de Tallas:** Algoritmo paramétrico con perfiles de demostración (`Nova`, `Sora`, `Mateo`) para calcular la talla óptima.
* 🛒 **Bolsa de Compras Inteligente:** Cálculo en tiempo real del beneficio de despacho gratuito (\$30.000 CLP).
* 💳 **Checkout Seguro Demo:** Pasarela de pago simulada (`WEBPAY_DEMO`) con control estricto de existencias y cero riesgo financiero.

---

## 2. Experiencia de Demostración (Demo Flow)

```text
CATÁLOGO DE MODA
       ↓
BÚSQUEDA ASISTIDA POR IA ("zapatillas de running para maratón")
       ↓
FICHA DE PRODUCTO & VARIANTES
       ↓
PROBADOR VIRTUAL AR (Nova / Sora / Mateo)
       ↓
CALIBRACIÓN BIOMÉTRICA DE TALLA
       ↓
AÑADIR A LA BOLSA CON TALLA SUGERIDA
       ↓
CHECKOUT SIMULADO WEBPAY DEMO
```

---

## 3. Arquitectura Desacoplada & Polyrepo

Tentaciones consume servicios expuestos por la plataforma central a través de contratos estrictos de TypeScript:

```text
┌─────────────────────────────────┐
│ Storefront Web / Clientes       │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│ ITentacionesExperienceService   │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│ Platform Client SDK             │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│ Platform REST API Gateway       │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│ AI Operating Platform Core      │
└─────────────────────────────────┘
```

---

## 4. Inicio Rápido y Desarrollo Local

### Requisitos:
* Node.js $\ge 22.0.0$

### Comandos:
```bash
# 1. Compilar TypeScript
npm run build

# 2. Ejecutar suite de pruebas
npm test

# 3. Iniciar servidor local
npm start
```

Abrir en el navegador: [http://127.0.0.1:4000](http://127.0.0.1:4000)

---

## 5. Modos de Operación y Seguridad

1. **`PUBLIC_DEMO` (Predeterminado):** Entorno 100% sintético, sin dependencias externas, sin llamadas a dominios corporativos y fail-closed ante tokens reales de pago.
2. **`PRIVATE_CONNECTED_DEMO`:** Modo conectado a una instancia activa de AI Operating Platform mediante gateway autenticado.
3. **`DEVELOPMENT`:** Modo local para iteración y pruebas de integración.

---

## 6. Documentación Canónica

* [`docs/PUBLIC_DEMO.md`](docs/PUBLIC_DEMO.md): Aislamiento y especificación del modo público.
* [`docs/DEMO_SECURITY.md`](docs/DEMO_SECURITY.md): Políticas de seguridad fail-closed y sanitización.
* [`docs/IP_PROTECTION.md`](docs/IP_PROTECTION.md): Límites de propiedad intelectual.
* [`docs/AR_DEMO_GUIDE.md`](docs/AR_DEMO_GUIDE.md): Guía de uso del probador virtual y perfiles.
* [`docs/SHOWCASE_CHECKLIST.md`](docs/SHOWCASE_CHECKLIST.md): Lista de verificación para demos en vivo.
* [`docs/GITHUB_RELEASE.md`](docs/GITHUB_RELEASE.md): Política de repositorio privado.
* [`docs/MULTICLIENT_ARCHITECTURE.md`](docs/MULTICLIENT_ARCHITECTURE.md): Contrato headless multicliente.
* [`docs/DEPLOYMENT_STRATEGY.md`](docs/DEPLOYMENT_STRATEGY.md): Guía de despliegue.

---

## 7. Licencia

Desarrollado bajo licencia **Apache-2.0**.
