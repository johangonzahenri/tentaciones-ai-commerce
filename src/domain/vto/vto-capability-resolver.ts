import type { TryOnCategory, ProductVTOCapability } from "../../contracts/vto-contract.js";
import type { Product, ProductCategory } from "../types.js";

export interface VTOCapabilityDescriptor {
  capability: ProductVTOCapability;
  mappedCategory?: TryOnCategory;
  reason: {
    es: string;
    en: string;
  };
}

export function isCategoryVTOCompatible(category: string): boolean {
  const vtoCat = mapCatalogCategoryToVTOCategory(category);
  return vtoCat !== undefined && vtoCat !== "shoes" && vtoCat !== "accessories";
}

export function mapCatalogCategoryToVTOCategory(catalogCategory: string): TryOnCategory | undefined {
  switch (catalogCategory.toLowerCase()) {
    case "poleras":
    case "camisas":
    case "polerones":
    case "tops":
      return "tops";
    case "vestidos":
    case "dresses":
      return "dresses";
    case "chaquetas":
    case "outerwear":
      return "outerwear";
    case "pantalones":
    case "pants":
      return "pants";
    case "faldas":
    case "skirts":
      return "skirts";
    case "calzado":
    case "shoes":
      return "shoes";
    case "accesorios":
    case "accessories":
      return "accessories";
    default:
      return undefined;
  }
}

export function resolveVTOCapability(
  product: Pick<Product, "id" | "category" | "name" | "slug"> | { category: string; id?: string; name?: string; slug?: string },
  providerId: string = "demo-synthetic"
): VTOCapabilityDescriptor {
  const vtoCat = mapCatalogCategoryToVTOCategory(product.category);

  if (!vtoCat) {
    return {
      capability: "UNSUPPORTED",
      reason: {
        es: `La categoría '${product.category}' no es compatible con el motor de prueba virtual por imagen.`,
        en: `Category '${product.category}' is not supported by the image-based virtual try-on engine.`,
      },
    };
  }

  // Provider-specific capability logic
  if (providerId === "fashn-pilot") {
    // FASHN AI specializes in apparel: tops, dresses, outerwear, pants, skirts
    if (vtoCat === "tops" || vtoCat === "dresses" || vtoCat === "outerwear" || vtoCat === "pants" || vtoCat === "skirts") {
      return {
        capability: "SUPPORTED",
        mappedCategory: vtoCat,
        reason: {
          es: "Prenda de vestuario compatible con el modelo de virtual try-on por imagen de FASHN AI.",
          en: "Apparel item supported by FASHN AI image-based virtual try-on model.",
        },
      };
    }

    if (vtoCat === "shoes" || vtoCat === "accessories") {
      return {
        capability: "UNSUPPORTED",
        mappedCategory: vtoCat,
        reason: {
          es: "FASHN AI no admite actualmente drapeado directo para calzado o accesorios de mano.",
          en: "FASHN AI does not currently support direct try-on for footwear or handheld accessories.",
        },
      };
    }
  }

  // Demo synthetic provider supports apparel and simulates standard garment try-on
  if (vtoCat === "tops" || vtoCat === "dresses" || vtoCat === "outerwear" || vtoCat === "pants" || vtoCat === "skirts") {
    return {
      capability: "SUPPORTED",
      mappedCategory: vtoCat,
      reason: {
        es: "Prenda compatible con el motor de Virtual Try-On asistido por IA.",
        en: "Item supported by the AI-assisted Virtual Try-On engine.",
      },
    };
  }

  return {
    capability: "UNSUPPORTED",
    mappedCategory: vtoCat,
    reason: {
      es: `Categoría '${product.category}' disponible en visualizador 3D y probador espacial AR, pero no en prueba por imagen.`,
      en: `Category '${product.category}' is available in 3D viewer and spatial AR, but not for image-based try-on.`,
    },
  };
}
