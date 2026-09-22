# Especificación Técnica — Experiencia AR & Probador Virtual 3D

CANONICAL DOCUMENT: docs/AR_EXPERIENCE.md  
STATUS: CERTIFIED  
VERSION: 1.5.0  
APPLICATION: PROJ-01-TENTACIONES  
PORTFOLIO: AI Operating Platform  

---

## 1. Arquitectura de Realidad Aumentada (AR Try-On)

La experiencia de probador virtual en **Tentaciones AI Commerce** conecta la selección de prendas con modelos tridimensionales y calibración antropométrica:

```text
[Selección de Producto]
          │
          ▼ (Lectura de defaultArUrn)
[parseAndValidateUrn (urn:tentaciones:ar:<categoria>:<slug>)]
          │
          ▼
[Selección de Perfil Demo (Nova / Sora / Mateo)]
          │
          ▼
[recommendSize (Calibración Biomecánica de Tallas)]
          │
          ▼
[Detección de WebXR en Navegador]
     ├──► WebXR Disponible ──► Proyección Espacial AR
     └──► No Disponible   ──► Modo 2D Interactivo de Alta Fidelidad
```

---

## 2. Taxonomía de Recursos URN

Todo activo compatible con el probador virtual se referencia mediante una cadena URN estándar:

$$\texttt{urn:tentaciones:ar:<categoría>:<slug\_producto>}$$

Ejemplos:
* `urn:tentaciones:ar:apparel:running-jacket-v2`
* `urn:tentaciones:ar:footwear:pro-carbon-racer`
* `urn:tentaciones:ar:apparel:silk-evening-dress`

---

## 3. Perfiles Biométricos de Demostración

Para la versión MVP, se utilizan 3 perfiles estandarizados claramente rotulados como **DEMO PREVIEW PROFILES** (cero recolección de datos biométricos reales):

1. **`Nova`**: Perfil femenino atlético (Estatura de referencia: 1.68m). Calce para vestuario deportivo y vestidos de silueta entallada.
2. **`Sora`**: Perfil unisex slim (Estatura de referencia: 1.75m). Calce recto para poleras oversized y camisas resort.
3. **`Mateo`**: Perfil masculino deportivo (Estatura de referencia: 1.82m). Calce de contextura media-ancha para polerones y chaquetas térmicas.
