# EspecificaciÃ³n TÃ©cnica â€” Experiencia AR & Probador Virtual 3D

CANONICAL DOCUMENT: docs/AR_EXPERIENCE.md
STATUS: CERTIFIED
VERSION: 1.5.0
APPLICATION: PROJ-01-TENTACIONES
PORTFOLIO: AI Operating Platform

---

## 1. Arquitectura de Realidad Aumentada (AR Try-On)

La experiencia de probador virtual en **Tentaciones AI Commerce** conecta la selecciÃ³n de prendas con modelos tridimensionales y calibraciÃ³n antropomÃ©trica:

```text
[SelecciÃ³n de Producto]
          â”‚
          â–¼ (Lectura de defaultArUrn)
[parseAndValidateUrn (urn:tentaciones:ar:<categoria>:<slug>)]
          â”‚
          â–¼
[SelecciÃ³n de Perfil Demo (Nova / Sora / Mateo)]
          â”‚
          â–¼
[recommendSize (CalibraciÃ³n BiomecÃ¡nica de Tallas)]
          â”‚
          â–¼
[DetecciÃ³n de WebXR en Navegador]
     â”œâ”€â”€â–º WebXR Disponible â”€â”€â–º ProyecciÃ³n Espacial AR
     â””â”€â”€â–º No Disponible   â”€â”€â–º Modo 2D Interactivo de Alta Fidelidad
```

---

## 2. TaxonomÃ­a de Recursos URN

Todo activo compatible con el probador virtual se referencia mediante una cadena URN estÃ¡ndar:

$$\texttt{urn:tentaciones:ar:<categorÃ­a>:<slug\_producto>}$$

Ejemplos:
* `urn:tentaciones:ar:apparel:running-jacket-v2`
* `urn:tentaciones:ar:footwear:pro-carbon-racer`
* `urn:tentaciones:ar:apparel:silk-evening-dress`

---

## 3. Perfiles BiomÃ©tricos de DemostraciÃ³n

Para la versiÃ³n MVP, se utilizan 3 perfiles estandarizados claramente rotulados como **DEMO PREVIEW PROFILES** (cero recolecciÃ³n de datos biomÃ©tricos reales):

1. **`Nova`**: Perfil femenino atlÃ©tico (Estatura de referencia: 1.68m). Calce para vestuario deportivo y vestidos de silueta entallada.
2. **`Sora`**: Perfil unisex slim (Estatura de referencia: 1.75m). Calce recto para poleras oversized y camisas resort.
3. **`Mateo`**: Perfil masculino deportivo (Estatura de referencia: 1.82m). Calce de contextura media-ancha para polerones y chaquetas tÃ©rmicas.
