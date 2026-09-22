import type {
  ARProfile,
  ARStatus,
  FittingRoomResolution,
  ProductCategory,
  SizeRecommendationInput,
  SizeRecommendationResult,
} from "./types.js";

export const DEMO_PREVIEW_PROFILES: readonly { readonly id: ARProfile; readonly label: string; readonly heightCm: number; readonly description: string }[] = [
  { id: "Nova", label: "Nova (Perfil Femenino Atlético)", heightCm: 168, description: "Silueta atlética / runner. Hombros proporcionados, cintura definida." },
  { id: "Sora", label: "Sora (Perfil Unisex Slim)", heightCm: 175, description: "Silueta esbelta / corte recto. Enfoque en caída y proporción de hombros." },
  { id: "Mateo", label: "Mateo (Perfil Masculino Deportivo)", heightCm: 182, description: "Silueta deportiva / contextura media-ancha. Enfoque en calce de pecho y espalda." },
];

export function parseAndValidateUrn(urn: string): { readonly category: ProductCategory; readonly productSlug: string } | null {
  const match = urn.match(/^urn:tentaciones:ar:([a-z0-9_-]+):([a-z0-9_-]+)$/);
  if (!match) return null;
  const rawCat = match[1];
  const slug = match[2];
  if (!rawCat || !slug) return null;

  let category: ProductCategory = "poleras";
  if (rawCat === "apparel" || rawCat === "poleras" || rawCat === "camisas" || rawCat === "polerones" || rawCat === "chaquetas" || rawCat === "vestidos" || rawCat === "pantalones" || rawCat === "faldas" || rawCat === "accesorios" || rawCat === "calzado" || rawCat === "footwear") {
    if (rawCat === "footwear") category = "calzado";
    else if (rawCat === "apparel") category = "poleras";
    else category = rawCat as ProductCategory;
  }

  return { category, productSlug: slug };
}

export function recommendSize(input: SizeRecommendationInput): SizeRecommendationResult {
  const profile = input.profile ?? "Nova";

  if (input.category === "calzado") {
    const footCm = input.footLengthCm ?? 25.5;
    if (footCm <= 24.5) {
      return { recommendedSize: 39, confidence: 0.95, rationale: `Largo de pie ${footCm} cm corresponde a talla 39 EU según tabla biométrica standard.`, alternativeSize: 40 };
    } else if (footCm <= 25.3) {
      return { recommendedSize: 40, confidence: 0.96, rationale: `Largo de pie ${footCm} cm con ajuste deportivo recomendado en talla 40 EU.`, alternativeSize: 41 };
    } else if (footCm <= 26.0) {
      return { recommendedSize: 41, confidence: 0.98, rationale: `Largo de pie ${footCm} cm se adapta óptimamente a horma media talla 41 EU.`, alternativeSize: 42 };
    } else if (footCm <= 27.0) {
      return { recommendedSize: 42, confidence: 0.97, rationale: `Largo de pie ${footCm} cm requiere talla 42 EU para holgura de puntera de 8mm.`, alternativeSize: 43 };
    } else {
      return { recommendedSize: 43, confidence: 0.94, rationale: `Largo de pie ${footCm} cm corresponde a talla 43 EU.`, alternativeSize: 42 };
    }
  }

  if (input.category === "pantalones") {
    const waist = input.waistCm ?? 78;
    if (waist <= 76) return { recommendedSize: 30, confidence: 0.92, rationale: `Contorno de cintura ${waist} cm corresponde a talla 30.`, alternativeSize: 32 };
    if (waist <= 84) return { recommendedSize: 32, confidence: 0.95, rationale: `Contorno de cintura ${waist} cm corresponde a talla 32.`, alternativeSize: 34 };
    return { recommendedSize: 34, confidence: 0.93, rationale: `Contorno de cintura ${waist} cm corresponde a talla 34.`, alternativeSize: 32 };
  }

  // Tops & Dresses: poleras, camisas, polerones, chaquetas, vestidos, faldas
  const chest = input.chestCm ?? (profile === "Mateo" ? 102 : profile === "Nova" ? 88 : 94);
  if (chest <= 88) {
    return { recommendedSize: "S", confidence: 0.93, rationale: `Contorno de torso/pecho ${chest} cm corresponde a talla S para silueta ${profile}.`, alternativeSize: "M" };
  } else if (chest <= 98) {
    return { recommendedSize: "M", confidence: 0.96, rationale: `Contorno de torso/pecho ${chest} cm ofrece calce balanceado en talla M para perfil ${profile}.`, alternativeSize: "L" };
  } else if (chest <= 108) {
    return { recommendedSize: "L", confidence: 0.94, rationale: `Contorno de torso/pecho ${chest} cm requiere talla L para libertad de movimiento.`, alternativeSize: "XL" };
  } else {
    return { recommendedSize: "XL", confidence: 0.91, rationale: `Contorno de torso/pecho ${chest} cm corresponde a talla XL.`, alternativeSize: "L" };
  }
}

export function resolveVirtualFitting(
  assetUrn: string,
  profile: ARProfile = "Nova",
  measurements?: { footLengthCm?: number; chestCm?: number; waistCm?: number; hipsCm?: number }
): FittingRoomResolution {
  const parsed = parseAndValidateUrn(assetUrn);
  if (!parsed) {
    return {
      assetUrn,
      profile,
      arStatus: "AR_ASSET_INVALID",
      previewUrl: "",
      fallbackMode: "STANDARD_2D_VIEW",
    };
  }

  const rec = recommendSize({
    category: parsed.category,
    profile,
    footLengthCm: measurements?.footLengthCm,
    chestCm: measurements?.chestCm,
    waistCm: measurements?.waistCm,
    hipsCm: measurements?.hipsCm,
  });

  const previewUrl = `https://ar.tentaciones.com/view/${encodeURIComponent(assetUrn)}?avatar=${profile}`;

  return {
    assetUrn,
    profile,
    arStatus: "AR_AVAILABLE",
    previewUrl,
    recommendedSize: rec,
    fallbackMode: "NONE",
  };
}
