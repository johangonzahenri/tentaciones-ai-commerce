import http from "node:http";
import https from "node:https";

export interface PlatformClientOptions {
  readonly baseUrl: string;
  readonly applicationId: string;
  readonly tenantId: string;
  readonly apiKey?: string | undefined;
  readonly timeoutMs?: number | undefined;
}

export class PlatformClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly traceId?: string | undefined;

  constructor(message: string, code: string, status = 500, traceId?: string) {
    super(message);
    this.name = "PlatformClientError";
    this.code = code;
    this.status = status;
    this.traceId = traceId;
  }
}

export interface PlatformTaskResponse {
  readonly taskId: string;
  readonly status: string;
  readonly agentId: string;
  readonly traceId?: string;
  readonly result?: unknown;
}

export interface PlatformExecutionResponse {
  readonly executionId: string;
  readonly taskId: string;
  readonly status: string;
  readonly traceId?: string;
  readonly result?: unknown;
  readonly error?: { readonly code: string; readonly message: string };
}

export class PlatformClient {
  private readonly baseUrl: URL;
  private readonly applicationId: string;
  private readonly tenantId: string;
  private readonly apiKey?: string | undefined;
  private readonly timeoutMs: number;

  constructor(options: PlatformClientOptions) {
    this.baseUrl = new URL(options.baseUrl);
    this.applicationId = options.applicationId;
    this.tenantId = options.tenantId;
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? 5000;
  }

  async checkHealth(): Promise<{ readonly status: string; readonly version?: string }> {
    return this.request<{ readonly status: string; readonly version?: string }>("GET", "/health/live");
  }

  async createTask(params: {
    readonly agentId?: string;
    readonly input: Record<string, unknown>;
    readonly capability?: string;
    readonly traceId?: string;
  }): Promise<PlatformTaskResponse> {
    const payload = {
      agentId: params.agentId ?? "foundation-agent",
      input: {
        ...params.input,
        capability: params.capability,
      },
      traceId: params.traceId,
      metadata: {
        application: this.applicationId,
        applicationId: this.applicationId,
        callerTenantId: this.tenantId,
        capability: params.capability,
      },
    };

    return this.request<PlatformTaskResponse>("POST", "/tasks", payload);
  }

  async executeTask(taskId: string): Promise<PlatformExecutionResponse> {
    return this.request<PlatformExecutionResponse>("POST", `/tasks/${encodeURIComponent(taskId)}/execute`);
  }

  async getExecution(executionId: string): Promise<PlatformExecutionResponse> {
    return this.request<PlatformExecutionResponse>("GET", `/executions/${encodeURIComponent(executionId)}`);
  }

  private request<T>(method: string, pathname: string, body?: unknown): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const url = new URL(pathname.startsWith("/") ? pathname.slice(1) : pathname, this.baseUrl.href.endsWith("/") ? this.baseUrl.href : `${this.baseUrl.href}/`);
      const isHttps = url.protocol === "https:";
      const transport = isHttps ? https : http;

      const headers: Record<string, string> = {
        "Accept": "application/json",
        "X-Application-Id": this.applicationId,
        "X-Tenant-Id": this.tenantId,
      };

      if (this.apiKey) {
        headers["X-API-Key"] = this.apiKey;
      }

      let payloadString: string | undefined = undefined;
      if (body) {
        payloadString = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
        headers["Content-Length"] = Buffer.byteLength(payloadString).toString();
      }

      const req = transport.request(url, { method, headers, timeout: this.timeoutMs }, (res) => {
        let rawData = "";
        res.setEncoding("utf8");

        res.on("data", (chunk) => {
          rawData += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            const status = res.statusCode ?? 500;

            if (status >= 200 && status < 300) {
              resolve((parsed.data ?? parsed) as T);
            } else {
              const errCode = parsed.error?.code ?? `HTTP_${status}`;
              const errMsg = parsed.error?.message ?? `Request failed with status ${status}`;
              const traceId = parsed.traceId ?? (res.headers["x-trace-id"] as string | undefined);
              reject(new PlatformClientError(errMsg, errCode, status, traceId));
            }
          } catch {
            reject(new PlatformClientError("Malformed JSON response from platform", "MALFORMED_RESPONSE", res.statusCode ?? 500));
          }
        });
      });

      req.on("error", (err) => {
        reject(new PlatformClientError(err.message, "NETWORK_ERROR", 503));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new PlatformClientError("Platform request timed out", "TIMEOUT", 504));
      });

      if (payloadString) {
        req.write(payloadString);
      }
      req.end();
    });
  }
}
