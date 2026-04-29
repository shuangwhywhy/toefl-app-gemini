import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestOrchestrator } from "../services/request-orchestrator";
import { db } from "../services/persistence/db";
import { geminiService } from "../services/llm/gemini-service";

vi.mock("../services/llm/gemini-service", () => ({
  geminiService: {
    generateContent: vi.fn(),
    generateWithSystemInstruction: vi.fn(),
  },
}));

describe("RequestOrchestrator", () => {
  beforeEach(async () => {
    await db.requests.clear();
    vi.clearAllMocks();
  });

  it("should reuse inflight requests for identical prompts", async () => {
    const prompt = "Test prompt";
    const options = { requestType: "scoring" as const, profileId: "user1" };

    const resultObj = { score: 5 };
    vi.mocked(geminiService.generateContent).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(resultObj), 100)),
    );

    const promise1 = requestOrchestrator.request(prompt, options);
    const promise2 = requestOrchestrator.request(prompt, options);

    const [res1, res2] = await Promise.all([promise1, promise2]);

    expect(res1).toBe(resultObj); // Should be exact same object
    expect(res2).toBe(resultObj);
    expect(geminiService.generateContent).toHaveBeenCalledTimes(1);
  });

  it("should handle rate limits (429) without auto-retry", async () => {
    const prompt = "Test prompt";
    const options = { requestType: "scoring" as const, profileId: "user1" };

    vi.mocked(geminiService.generateContent).mockRejectedValue(
      new Error("429"),
    );

    await expect(requestOrchestrator.request(prompt, options)).rejects.toThrow(
      /Rate limit/,
    );

    const records = await db.requests.toArray();
    expect(records[0].status).toBe("failed");
    expect(records[0].errorType).toBe("rate_limited");
    expect(records[0].retryCount).toBe(0);
  });

  it("should retry once for non-429 errors", async () => {
    const prompt = "Test prompt";
    const options = { requestType: "scoring" as const, profileId: "user1" };

    vi.mocked(geminiService.generateContent)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ score: 4 });

    const result = await requestOrchestrator.request(prompt, options);

    expect((result as { score: number }).score).toBe(4);
    expect(geminiService.generateContent).toHaveBeenCalledTimes(2);

    const records = await db.requests.toArray();
    expect(records[0].status).toBe("succeeded");
    expect(records[0].retryCount).toBe(1);
  });
});
