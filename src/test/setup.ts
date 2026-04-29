import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock IndexedDB
import "fake-indexeddb/auto";

// Mock Gemini API
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockImplementation(() => ({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({ success: true }),
        },
      }),
    })),
  })),
}));

// Mock Tauri APIs if needed
vi.mock("@tauri-apps/api", () => ({
  invoke: vi.fn(),
}));
