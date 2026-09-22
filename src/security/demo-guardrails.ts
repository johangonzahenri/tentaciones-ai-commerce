import type { OperationalModeConfig } from "../contracts/operational-mode.js";

export class SecurityViolationError extends Error {
  readonly code: string;
  readonly severity: "HIGH" | "CRITICAL";

  constructor(message: string, code = "SECURITY_VIOLATION", severity: "HIGH" | "CRITICAL" = "CRITICAL") {
    super(message);
    this.name = "SecurityViolationError";
    this.code = code;
    this.severity = severity;
  }
}

export function assertSafeDemoMode(config: OperationalModeConfig): void {
  if (config.mode === "PUBLIC_DEMO") {
    if (config.platformApiKey && config.platformApiKey.trim().length > 0) {
      throw new SecurityViolationError(
        "FAIL-CLOSED: Live API Key detected while running in PUBLIC_DEMO mode. Secrets must never be configured in public demo builds.",
        "DEMO_SECRET_LEAK_PREVENTED"
      );
    }

    if (config.platformApiBaseUrl && config.platformApiBaseUrl.includes("internal.corp")) {
      throw new SecurityViolationError(
        "FAIL-CLOSED: Private enterprise URL detected in PUBLIC_DEMO mode.",
        "DEMO_PRIVATE_URL_PREVENTED"
      );
    }
  }
}

export function assertNoProductionPayments(paymentMethod: string, config: OperationalModeConfig): void {
  if (config.mode === "PUBLIC_DEMO" && paymentMethod !== "WEBPAY_DEMO") {
    throw new SecurityViolationError(
      `FAIL-CLOSED: Payment method '${paymentMethod}' is strictly forbidden in PUBLIC_DEMO mode. Only 'WEBPAY_DEMO' is allowed.`,
      "PRODUCTION_PAYMENT_BLOCKED_IN_DEMO"
    );
  }
}

export function sanitizeErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred.";
  const rawMsg = error instanceof Error ? error.message : String(error);

  // Strip file paths
  let sanitized = rawMsg.replace(/([a-zA-Z]:\\[^\s:]+)|(\/[a-zA-Z0-9_.-]+\/[^\s:]+)/g, "[REDACTED_PATH]");

  // Strip IP addresses and internal ports
  sanitized = sanitized.replace(/(https?:\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?/g, "[REDACTED_ENDPOINT]");

  // Strip tokens and secrets
  sanitized = sanitized.replace(/(sk-[a-zA-Z0-9_-]+)|(bearer\s+[a-zA-Z0-9_.-]+)/gi, "[REDACTED_SECRET]");

  // Strip database filenames
  sanitized = sanitized.replace(/[a-zA-Z0-9_-]+\.(db|sqlite|sqlite3)(-wal|-shm)?/gi, "[REDACTED_DATABASE]");

  return sanitized;
}

export function redactSensitivePayload<T extends Record<string, unknown>>(payload: T): T {
  const sensitiveKeys = new Set(["apikey", "token", "password", "secret", "authorization", "x-api-key", "jwt", "creditcard", "cardnumber"]);
  const copy: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(payload)) {
    if (sensitiveKeys.has(k.toLowerCase())) {
      copy[k] = "[REDACTED_DEMO_PROTECTED]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      copy[k] = redactSensitivePayload(v as Record<string, unknown>);
    } else {
      copy[k] = v;
    }
  }

  return copy as T;
}
