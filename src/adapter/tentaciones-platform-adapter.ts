import crypto from "node:crypto";
import { PlatformClient, PlatformClientError } from "./platform-client.js";
import { TentacionesCommerceEngine } from "../engine/commerce-engine.js";
import type {
  AIProductDiscoveryResult,
  AIRecommendationResult,
  AIComparisonResult,
  AICartAssistanceResult,
  FittingRoomResolution,
  ARProfile,
} from "../domain/types.js";

export interface TentacionesAdapterOptions {
  readonly client?: PlatformClient | undefined;
  readonly localEngine?: TentacionesCommerceEngine | undefined;
  readonly traceIdFactory?: (() => string) | undefined;
}

export class TentacionesPlatformAdapter {
  private readonly client?: PlatformClient | undefined;
  private readonly localEngine: TentacionesCommerceEngine;
  private readonly traceIdFactory: () => string;

  constructor(options?: TentacionesAdapterOptions) {
    this.client = options?.client;
    this.localEngine = options?.localEngine ?? new TentacionesCommerceEngine();
    this.traceIdFactory = options?.traceIdFactory ?? crypto.randomUUID;
  }

  get engine(): TentacionesCommerceEngine {
    return this.localEngine;
  }

  async checkPlatformHealth(): Promise<{ readonly online: boolean; readonly version?: string; readonly error?: string }> {
    if (!this.client) {
      return { online: false, error: "PlatformClient not configured (Running in Standalone Local Engine mode)" };
    }
    try {
      const res = await this.client.checkHealth();
      return { online: true, version: res.version };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Platform unreachable";
      return { online: false, error: msg };
    }
  }

  async discoverProducts(userMessage: string, traceId = this.traceIdFactory()): Promise<AIProductDiscoveryResult> {
    if (!this.client) {
      const local = this.localEngine.searchProductsNaturalLanguage(userMessage);
      return {
        ...local,
        source: "Local AI Engine",
        fallback: "LOCAL_FALLBACK",
        traceId,
      };
    }

    try {
      const task = await this.client.createTask({
        capability: "product.discovery",
        input: { userMessage },
        traceId,
      });

      const execution = await this.client.executeTask(task.taskId);
      const finished = await this.client.getExecution(execution.executionId);

      const rawResult = finished.result as Record<string, unknown> | undefined;
      const intent = rawResult?.intent as { category?: string; tags: string[]; maxPrice?: number } | undefined;

      const local = this.localEngine.searchProductsNaturalLanguage(userMessage);

      return {
        status: "COMPLETED",
        source: "AI Operating Platform",
        query: userMessage,
        intent: intent ?? local.intent,
        matches: local.matches,
        fallback: "NONE",
        traceId: finished.traceId ?? traceId,
      };
    } catch (err) {
      const local = this.localEngine.searchProductsNaturalLanguage(userMessage);
      return {
        ...local,
        source: "Local AI Engine",
        fallback: "LOCAL_FALLBACK",
        traceId,
      };
    }
  }

  async recommendProducts(productId: string, traceId = this.traceIdFactory()): Promise<AIRecommendationResult> {
    if (!this.client) {
      const local = this.localEngine.getRecommendations(productId);
      return {
        ...local,
        source: "Local AI Engine",
        fallback: "LOCAL_FALLBACK",
        traceId,
      };
    }

    try {
      const task = await this.client.createTask({
        capability: "product.recommendation",
        input: { productId },
        traceId,
      });

      const execution = await this.client.executeTask(task.taskId);
      const finished = await this.client.getExecution(execution.executionId);

      const local = this.localEngine.getRecommendations(productId);

      return {
        status: "COMPLETED",
        source: "AI Operating Platform",
        recommendations: local.recommendations,
        fallback: "NONE",
        traceId: finished.traceId ?? traceId,
      };
    } catch (err) {
      const local = this.localEngine.getRecommendations(productId);
      return {
        ...local,
        source: "Local AI Engine",
        fallback: "LOCAL_FALLBACK",
        traceId,
      };
    }
  }

  async compareProducts(productIds: readonly string[], traceId = this.traceIdFactory()): Promise<AIComparisonResult> {
    if (!this.client) {
      const local = this.localEngine.compareProducts(productIds);
      return {
        ...local,
        source: "Local AI Engine",
        fallback: "LOCAL_FALLBACK",
        traceId,
      };
    }

    try {
      const task = await this.client.createTask({
        capability: "product.compare",
        input: { productIds },
        traceId,
      });

      const execution = await this.client.executeTask(task.taskId);
      const finished = await this.client.getExecution(execution.executionId);

      const local = this.localEngine.compareProducts(productIds);

      return {
        status: "COMPLETED",
        source: "AI Operating Platform",
        products: local.products,
        matrix: local.matrix,
        differentiators: local.differentiators,
        fallback: "NONE",
        traceId: finished.traceId ?? traceId,
      };
    } catch (err) {
      const local = this.localEngine.compareProducts(productIds);
      return {
        ...local,
        source: "Local AI Engine",
        fallback: "LOCAL_FALLBACK",
        traceId,
      };
    }
  }

  async assistCart(cartId: string, query: string, traceId = this.traceIdFactory()): Promise<AICartAssistanceResult> {
    if (!this.client) {
      const local = this.localEngine.assistCartQuery(cartId, query);
      return {
        ...local,
        source: "Local AI Engine",
        fallback: "LOCAL_FALLBACK",
        traceId,
      };
    }

    try {
      const task = await this.client.createTask({
        capability: "cart.assistance",
        input: { cartId, query },
        traceId,
      });

      const execution = await this.client.executeTask(task.taskId);
      const finished = await this.client.getExecution(execution.executionId);

      const local = this.localEngine.assistCartQuery(cartId, query);

      return {
        status: "COMPLETED",
        source: "AI Operating Platform",
        query,
        answer: local.answer,
        cart: local.cart,
        suggestedAction: local.suggestedAction,
        fallback: "NONE",
        traceId: finished.traceId ?? traceId,
      };
    } catch (err) {
      const local = this.localEngine.assistCartQuery(cartId, query);
      return {
        ...local,
        source: "Local AI Engine",
        fallback: "LOCAL_FALLBACK",
        traceId,
      };
    }
  }

  resolveFittingRoom(assetUrn: string, profile: ARProfile = "Nova", measurements?: { footLengthCm?: number; chestCm?: number; waistCm?: number }): FittingRoomResolution {
    return this.localEngine.resolveFitting(assetUrn, profile, measurements);
  }
}
