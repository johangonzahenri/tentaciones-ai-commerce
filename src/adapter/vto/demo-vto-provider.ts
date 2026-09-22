import type {
  IVirtualTryOnProvider,
  TryOnInput,
  ValidatedTryOnInput,
  TryOnValidationResult,
  TryOnJobSubmission,
  TryOnJobStatus,
  TryOnResult,
  TryOnCategory,
} from "../../contracts/vto-contract.js";
import { validateUserImagePayload } from "../../security/vto-guardrails.js";
import { recommendSize } from "../../domain/ar-fitting.js";

interface InternalDemoJob {
  jobId: string;
  requestId: string;
  productId: string;
  productName: string;
  category: TryOnCategory;
  avatarProfile?: "Nova" | "Sora" | "Mateo";
  submittedAt: number;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  recommendedSize?: string;
  fitConfidence?: number;
}

export class DemoVirtualTryOnProvider implements IVirtualTryOnProvider {
  public readonly providerId = "demo-synthetic";
  public readonly isSynthetic = true;
  public readonly supportedCategories: readonly TryOnCategory[] = [
    "tops",
    "dresses",
    "outerwear",
    "pants",
    "skirts",
  ];

  private jobs = new Map<string, InternalDemoJob>();

  public validateInput(input: TryOnInput): TryOnValidationResult {
    return validateUserImagePayload(input);
  }

  public async prepareInput(input: TryOnInput): Promise<ValidatedTryOnInput> {
    const validation = this.validateInput(input);
    if (!validation.valid || !validation.sanitizedInput) {
      throw new Error(`Input validation failed: ${validation.errors.join(", ")}`);
    }
    return validation.sanitizedInput;
  }

  public async startTryOn(input: ValidatedTryOnInput): Promise<TryOnJobSubmission> {
    const jobId = `vto-job-${Math.random().toString(36).substring(2, 10)}`;

    const profile = input.selectedAvatarProfile || "Nova";
    let productCat: "poleras" | "camisas" | "polerones" | "chaquetas" | "vestidos" | "pantalones" | "faldas" | "accesorios" | "calzado" = "poleras";
    if (input.category === "dresses") productCat = "vestidos";
    else if (input.category === "outerwear") productCat = "chaquetas";
    else if (input.category === "pants") productCat = "pantalones";
    else if (input.category === "skirts") productCat = "faldas";
    else if (input.category === "shoes") productCat = "calzado";
    else if (input.category === "accessories") productCat = "accesorios";

    const sizing = recommendSize({
      category: productCat,
      profile,
      footLengthCm: profile === "Mateo" ? 27.0 : 24.5,
    });

    const job: InternalDemoJob = {
      jobId,
      requestId: input.requestId,
      productId: input.productId,
      productName: input.productName,
      category: input.category,
      avatarProfile: input.selectedAvatarProfile,
      submittedAt: Date.now(),
      status: "QUEUED",
      recommendedSize: String(sizing.recommendedSize),
      fitConfidence: Math.round(sizing.confidence * 100),
    };

    this.jobs.set(jobId, job);

    return {
      jobId,
      providerId: this.providerId,
      status: "QUEUED",
      submittedAt: new Date(job.submittedAt).toISOString(),
      estimatedDurationSeconds: 2,
    };
  }

  public async getStatus(jobId: string): Promise<TryOnJobStatus> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`TryOn job '${jobId}' not found`);
    }

    if (job.status === "CANCELLED") {
      return {
        jobId,
        providerId: this.providerId,
        state: "CANCELLED",
        progressPercent: 0,
        stageMessage: {
          es: "Proceso cancelado por el usuario.",
          en: "Process cancelled by user.",
        },
        updatedAt: new Date().toISOString(),
      };
    }

    const elapsedMs = Date.now() - job.submittedAt;

    if (elapsedMs < 600) {
      job.status = "QUEUED";
      return {
        jobId,
        providerId: this.providerId,
        state: "SUBMITTING",
        progressPercent: 20,
        stageMessage: {
          es: "Validando fotografía y preparando prenda en el motor IA...",
          en: "Validating photograph and preparing garment in AI engine...",
        },
        updatedAt: new Date().toISOString(),
      };
    }

    if (elapsedMs < 1500) {
      job.status = "PROCESSING";
      return {
        jobId,
        providerId: this.providerId,
        state: "PROCESSING",
        progressPercent: 65,
        stageMessage: {
          es: "Ajustando proporciones corporales y generando drapeado virtual...",
          en: "Aligning body proportions and generating virtual garment drape...",
        },
        updatedAt: new Date().toISOString(),
      };
    }

    job.status = "COMPLETED";
    return {
      jobId,
      providerId: this.providerId,
      state: "RESULT_READY",
      progressPercent: 100,
      stageMessage: {
        es: "¡Prueba virtual generada con éxito!",
        en: "Virtual try-on generated successfully!",
      },
      updatedAt: new Date().toISOString(),
    };
  }

  public async getResult(jobId: string): Promise<TryOnResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`TryOn job '${jobId}' not found`);
    }

    if (job.status === "CANCELLED") {
      return {
        jobId,
        requestId: job.requestId,
        productId: job.productId,
        productName: job.productName,
        status: "CANCELLED",
        isSyntheticDemo: true,
        providerId: this.providerId,
        category: job.category,
        processingTimeMs: Date.now() - job.submittedAt,
        completedAt: new Date().toISOString(),
        disclaimer: {
          es: "Proceso cancelado.",
          en: "Process cancelled.",
        },
      };
    }

    return {
      jobId,
      requestId: job.requestId,
      productId: job.productId,
      productName: job.productName,
      status: "SUCCESS",
      resultImageUrl: "/assets/images/demo-vto-composite.svg",
      isSyntheticDemo: true,
      providerId: this.providerId,
      category: job.category,
      recommendedSize: job.recommendedSize || "M",
      fitConfidence: job.fitConfidence ?? 0.9,
      processingTimeMs: Math.max(100, Date.now() - job.submittedAt),
      completedAt: new Date().toISOString(),
      disclaimer: {
        es: "Visualización generada por IA (Demostración Sintética). El resultado es una aproximación visual y no garantiza el ajuste físico exacto.",
        en: "AI-generated visualization (Synthetic Demo). The result is a visual approximation and does not guarantee exact physical fit.",
      },
    };
  }

  public async cancel(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "CANCELLED";
    }
  }
}
