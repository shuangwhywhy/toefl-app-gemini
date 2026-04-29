import { describe, it, expect, beforeEach } from "vitest";
import { promptRegistry } from "../services/prompt-registry";

describe("PromptRegistry", () => {
  beforeEach(() => {
    // Registry is pre-populated in constructor
  });

  it("should retrieve the latest version of a prompt", () => {
    promptRegistry.registerPrompt("test_task", "1.0", "Template 1.0");
    promptRegistry.registerPrompt("test_task", "2.0", "Template 2.0");

    const template = promptRegistry.getPrompt("test_task");
    expect(template).toBe("Template 2.0");
  });

  it("should retrieve a specific version of a prompt", () => {
    promptRegistry.registerPrompt("test_task_v", "1.0", "Template 1.0");
    promptRegistry.registerPrompt("test_task_v", "2.0", "Template 2.0");

    const template = promptRegistry.getPrompt("test_task_v", "1.0");
    expect(template).toBe("Template 1.0");
  });

  it("should render templates with variables", () => {
    const template = "Hello {{name}}! Score: {{score}}";
    const rendered = promptRegistry.render(template, { name: "YQ", score: 28 });
    expect(rendered).toBe("Hello YQ! Score: 28");
  });

  it("should throw error for non-existent prompts", () => {
    expect(() => promptRegistry.getPrompt("non_existent")).toThrow();
  });
});
