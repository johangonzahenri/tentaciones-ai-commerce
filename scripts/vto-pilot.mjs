#!/usr/bin/env node
/**
 * VTO Pilot Runner CLI Tool
 * Safe, controlled execution tool supporting CHECK, DRY_RUN, and REAL_RUN modes.
 * Enforces fail-closed security when FASHN_API_KEY is not configured.
 */

import { TryOnImagePipeline } from "../dist/src/domain/vto/vto-image-pipeline.js";
import { DemoVirtualTryOnProvider } from "../dist/src/adapter/vto/demo-vto-provider.js";
import { FashnVirtualTryOnProvider } from "../dist/src/adapter/vto/fashn-vto-provider.js";
import { VTOExecutionGateway } from "../dist/src/domain/vto/vto-execution-gateway.js";

const mode = process.argv[2] ? process.argv[2].toLowerCase() : "check";
const hasApiKey = Boolean(process.env.FASHN_API_KEY && process.env.FASHN_API_KEY.trim());

console.log("============================================================");
console.log("  TENTACIONES AI COMMERCE — VTO PILOT RUNNER CLI");
console.log("============================================================");
console.log(`Command Mode:    ${mode.toUpperCase()}`);
console.log(`FASHN_API_KEY:   ${hasApiKey ? "CONFIGURED (Server-side)" : "NOT CONFIGURED (Missing)"}`);
console.log(`Runtime:         Node.js ${process.version}`);
console.log("------------------------------------------------------------");

async function runCheck() {
  const pipeline = new TryOnImagePipeline();
  const avatarRes = await pipeline.assessUserImage({ isAvatar: true, avatarProfile: "Nova", userConsentGranted: true });
  const productRes = await pipeline.assessProductImage({
    id: "prod-polera-essential",
    slug: "polera-essential",
    name: "Polera Essential",
    category: "tops",
    imageUrl: "/assets/images/polera.png",
  });

  const readiness = pipeline.isReadyForRealVTO({
    preparedUserImage: avatarRes.preparedUserImage,
    preparedProductImage: productRes,
    hasApiKey,
    userConsentGranted: true,
  });

  const report = {
    mode: "CHECK",
    pilotStatus: readiness.status,
    ready: readiness.ready,
    checklist: readiness.checklist,
    reasons: readiness.reasons,
    recommendation: readiness.ready
      ? "Environment ready for real single-inference pilot run."
      : "Configure FASHN_API_KEY in secure server environment before attempting live inference.",
  };

  console.log(JSON.stringify(report, null, 2));
}

async function runDryRun() {
  const pipeline = new TryOnImagePipeline();
  const avatarRes = await pipeline.assessUserImage({ isAvatar: true, avatarProfile: "Sora", userConsentGranted: true });
  const productRes = await pipeline.assessProductImage({
    id: "prod-polera-essential",
    slug: "polera-essential",
    name: "Polera Essential",
    category: "tops",
    imageUrl: "/assets/images/polera.png",
  });

  const demoProvider = new DemoVirtualTryOnProvider();
  const gateway = new VTOExecutionGateway(
    demoProvider,
    { mode: "PUBLIC_DEMO", defaultCurrency: "CLP", freeShippingThresholdCLP: 30000 },
    undefined,
    async () => {}
  );

  const result = await gateway.execute({
    requestId: `pilot-dryrun-${Date.now()}`,
    userImage: avatarRes.preparedUserImage,
    productImage: productRes,
    productCategory: "tops",
    userConsentGranted: true,
    demoMode: true,
    metadata: { avatarProfile: "Sora" },
  });

  const report = {
    mode: "DRY_RUN",
    pilotStatus: "DRY_RUN_COMPLETED",
    inputValidation: {
      userImageQuality: avatarRes.assessment.state,
      productImageQuality: productRes.quality,
    },
    executionResult: {
      requestId: result.requestId,
      status: result.status,
      providerId: result.providerId,
      modelName: result.modelName,
      recommendedSize: result.recommendedSize,
      fitConfidence: result.fitConfidence,
      durationMs: result.processingTimeMs,
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

async function runRealRun() {
  if (!hasApiKey) {
    console.error("❌ ERROR: REAL PILOT EXECUTION BLOCKED (FAIL-CLOSED)");
    console.error("Reason: FASHN_API_KEY is not configured in the environment.");
    console.error("Honesty Invariant: No fake pilot calls or synthetic tokens will be emitted.");
    process.exitCode = 1;
    return;
  }

  const apiKey = process.env.FASHN_API_KEY.trim();
  const pipeline = new TryOnImagePipeline();
  const avatarRes = await pipeline.assessUserImage({ isAvatar: true, avatarProfile: "Nova", userConsentGranted: true });
  const productRes = await pipeline.assessProductImage({
    id: "prod-polera-essential",
    slug: "polera-essential",
    name: "Polera Essential",
    category: "tops",
    imageUrl: "https://tentaciones.cl/assets/images/polera.png",
  });

  const fashnProvider = new FashnVirtualTryOnProvider({ apiKey, modelName: "tryon-max", returnBase64: true });
  const demoProvider = new DemoVirtualTryOnProvider();

  const gateway = new VTOExecutionGateway(
    demoProvider,
    { mode: "PRIVATE_CONNECTED_DEMO", defaultCurrency: "CLP", freeShippingThresholdCLP: 30000 },
    fashnProvider
  );

  console.log("Submitting single real inference to FASHN AI API (tryon-max)...");
  const result = await gateway.execute({
    requestId: `pilot-realrun-${Date.now()}`,
    userImage: avatarRes.preparedUserImage,
    productImage: productRes,
    productCategory: "tops",
    providerPreference: "fashn-pilot",
    userConsentGranted: true,
    demoMode: false,
    metadata: { avatarProfile: "Nova" },
  });

  const safeReport = {
    mode: "REAL_RUN",
    pilotStatus: result.status,
    requestId: result.requestId,
    jobId: result.jobId,
    providerId: result.providerId,
    modelName: result.modelName,
    processingTimeMs: result.processingTimeMs,
    hasResultImage: Boolean(result.resultImageUrl),
    error: result.error,
  };

  console.log(JSON.stringify(safeReport, null, 2));
}

async function main() {
  switch (mode) {
    case "dry-run":
    case "dryrun":
      await runDryRun();
      break;
    case "real-run":
    case "realrun":
      await runRealRun();
      break;
    case "check":
    default:
      await runCheck();
      break;
  }
}

main().catch((err) => {
  console.error("Unhandled CLI error:", err.message);
  process.exitCode = 1;
});
