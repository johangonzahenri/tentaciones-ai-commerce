export type OperationalMode = "PUBLIC_DEMO" | "PRIVATE_CONNECTED_DEMO" | "DEVELOPMENT";

export interface OperationalModeConfig {
  readonly mode: OperationalMode;
  readonly defaultCurrency: "CLP" | "EUR";
  readonly freeShippingThresholdCLP: number;
  readonly platformApiBaseUrl?: string | undefined;
  readonly platformApplicationId?: string | undefined;
  readonly platformTenantId?: string | undefined;
  readonly platformApiKey?: string | undefined;
}

export function resolveOperationalMode(env: Record<string, string | undefined> = process.env): OperationalModeConfig {
  const rawMode = (env.APP_MODE || env.NODE_ENV || "PUBLIC_DEMO").toUpperCase();
  let mode: OperationalMode = "PUBLIC_DEMO";

  if (rawMode === "PRIVATE_CONNECTED" || rawMode === "PRIVATE_CONNECTED_DEMO") {
    mode = "PRIVATE_CONNECTED_DEMO";
  } else if (rawMode === "DEVELOPMENT" || rawMode === "DEV") {
    mode = "DEVELOPMENT";
  } else {
    mode = "PUBLIC_DEMO";
  }

  return {
    mode,
    defaultCurrency: (env.DEFAULT_CURRENCY === "EUR" ? "EUR" : "CLP"),
    freeShippingThresholdCLP: Number(env.FREE_SHIPPING_THRESHOLD_CLP || 30000),
    platformApiBaseUrl: mode !== "PUBLIC_DEMO" ? env.PLATFORM_API_BASE_URL : undefined,
    platformApplicationId: mode !== "PUBLIC_DEMO" ? (env.PLATFORM_APPLICATION_ID || "tentaciones-commerce") : undefined,
    platformTenantId: mode !== "PUBLIC_DEMO" ? (env.PLATFORM_TENANT_ID || "tenant-tentaciones") : undefined,
    platformApiKey: mode !== "PUBLIC_DEMO" ? env.PLATFORM_API_KEY : undefined,
  };
}
