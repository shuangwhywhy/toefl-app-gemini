import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const DEFAULT_MODEL = "gemini-3-flash";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    if (!API_KEY) {
      console.warn("VITE_GEMINI_API_KEY is not defined in .env");
    }
    this.genAI = new GoogleGenerativeAI(API_KEY || "");
    this.model = this.genAI.getGenerativeModel({ model: DEFAULT_MODEL });
  }

  async generateContent(prompt: string, jsonResponse = true) {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: jsonResponse ? "application/json" : "text/plain",
        },
      });

      const response = result.response;
      const text = response.text();

      if (jsonResponse) {
        return JSON.parse(text);
      }
      return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async generateWithSystemInstruction(
    systemInstruction: string,
    userPrompt: string,
    jsonResponse = true,
  ) {
    try {
      const modelWithSystem = this.genAI.getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction: systemInstruction,
      });

      const result = await modelWithSystem.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: jsonResponse ? "application/json" : "text/plain",
        },
      });

      const response = result.response;
      const text = response.text();

      if (jsonResponse) {
        return JSON.parse(text);
      }
      return text;
    } catch (error) {
      console.error("Gemini API Error (with system instruction):", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
