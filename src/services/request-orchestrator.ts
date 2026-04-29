import { v4 as uuidv4 } from "uuid";
import { db } from "./persistence/db";
import { geminiService } from "./llm/gemini-service";
import { RequestRecord } from "../types/core";

export interface RequestOptions {
  requestType: RequestRecord["requestType"];
  profileId: string;
  sessionId?: string;
  itemId?: string;
  priority?: number;
  isBatch?: boolean;
  systemInstruction?: string;
  idempotencyKey?: string;
}

export class RequestOrchestrator {
  private inflightRequests: Map<string, Promise<unknown>> = new Map();

  async request(prompt: string, options: RequestOptions): Promise<unknown> {
    const idempotencyKey =
      options.idempotencyKey || this.generateIdempotencyKey(prompt, options);
    const inflightGroupKey = this.generateInflightGroupKey(prompt, options);

    // 1. Check for inflight request reuse (Synchronous check part)
    const existing = this.inflightRequests.get(inflightGroupKey);
    if (existing) {
      console.log(`Reusing inflight request for key: ${inflightGroupKey}`);
      return existing;
    }

    // 2. Create the request promise and set it IMMEDIATELY to prevent races
    const requestId = uuidv4();
    const requestPromise = (async () => {
      // 3. Create request record (Inside the async closure)
      const record: RequestRecord = {
        requestId,
        requestType: options.requestType,
        profileId: options.profileId,
        sessionId: options.sessionId,
        itemId: options.itemId,
        idempotencyKey,
        status: "pending",
        priority: options.priority || 3,
        isBatch: options.isBatch || false,
        inflightGroupKey,
        retryCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.requests.add(record);
      return this.executeRequest(prompt, record, options);
    })();

    this.inflightRequests.set(inflightGroupKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.inflightRequests.delete(inflightGroupKey);
    }
  }

  private async executeRequest(
    prompt: string,
    record: RequestRecord,
    options: RequestOptions,
  ): Promise<unknown> {
    try {
      let result: unknown;
      if (options.systemInstruction) {
        result = await geminiService.generateWithSystemInstruction(
          options.systemInstruction,
          prompt,
        );
      } else {
        result = await geminiService.generateContent(prompt);
      }

      // Update record on success
      await db.requests.update(record.requestId, {
        status: "succeeded",
        updatedAt: new Date().toISOString(),
      });

      return result;
    } catch (error: unknown) {
      // 3. Handle Retry & 429
      const isRateLimited =
        error instanceof Error && error.message.includes("429");

      if (isRateLimited) {
        await db.requests.update(record.requestId, {
          status: "failed",
          errorType: "rate_limited",
          updatedAt: new Date().toISOString(),
        });
        throw new Error(
          `Rate limit exceeded (429). Please try again manually.`,
          {
            cause: error,
          },
        );
      }

      if (record.retryCount < 1) {
        console.log(`Retrying request ${record.requestId}...`);
        await db.requests.update(record.requestId, {
          status: "retrying",
          retryCount: record.retryCount + 1,
          updatedAt: new Date().toISOString(),
        });
        return this.executeRequest(
          prompt,
          { ...record, retryCount: record.retryCount + 1 },
          options,
        );
      }

      const errorMessage = error instanceof Error ? error.message : "unknown";
      await db.requests.update(record.requestId, {
        status: "failed",
        errorType: errorMessage,
        updatedAt: new Date().toISOString(),
      });
      throw error;
    }
  }

  private generateIdempotencyKey(
    prompt: string,
    options: RequestOptions,
  ): string {
    return `idemp-${options.profileId}-${options.requestType}-${this.hashCode(prompt)}`;
  }

  private generateInflightGroupKey(
    prompt: string,
    options: RequestOptions,
  ): string {
    return `inflight-${options.profileId}-${options.requestType}-${this.hashCode(prompt)}`;
  }

  private hashCode(s: string): string {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      const chr = s.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash.toString();
  }
}

export const requestOrchestrator = new RequestOrchestrator();
