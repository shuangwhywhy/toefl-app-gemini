export interface PromptTemplate {
  template: string;
  version: string;
  taskType: string;
}

export class PromptRegistry {
  private registry: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeDefaultPrompts();
  }

  private initializeDefaultPrompts() {
    // Initial templates for MVP (Batch 1/2)
    this.registerPrompt(
      "coach_initial_plan",
      "1.0",
      `
      You are a professional TOEFL AI Sprint Coach. 
      Based on the user's target score of {{targetScore}}, exam date of {{examDate}}, 
      current level of {{currentLevel}}, and daily available time of {{dailyAvailableTime}} minutes,
      generate a dynamic Sprint Plan.
      
      Output the plan in JSON format matching the SprintPlan schema.
      Focus on maximizing readiness for the 2026 TOEFL format.
    `,
    );

    this.registerPrompt(
      "reading_generation",
      "1.0",
      `
      Generate a TOEFL 2026 style Reading practice item.
      Topic: {{topic}}
      Difficulty: {{difficulty}}
      
      Include text content, options, and the correct answer.
      Output in JSON format matching the PracticeItem schema.
    `,
    );

    this.registerPrompt(
      "writing_scoring",
      "1.0",
      `
      Score the following TOEFL Writing response based on the provided scoring schema.
      Task Type: {{taskType}}
      Prompt: {{prompt}}
      Response: {{response}}
      Scoring Schema: {{scoringSchema}}
      
      Use Evidence-bound Scoring Protocol:
      1. Identify evidence for each dimension.
      2. Deduct points only once per dimension.
      3. Provide weakness_details and strengths.
      4. Suggest nextStep for improvement.
      
      Output in JSON format matching the ScoringResult schema.
    `,
    );
  }

  registerPrompt(taskType: string, version: string, template: string) {
    const key = `${taskType}:${version}`;
    this.registry.set(key, { taskType, version, template });
  }

  getPrompt(taskType: string, version = "latest"): string {
    if (version === "latest") {
      const keys = Array.from(this.registry.keys()).filter((k) =>
        k.startsWith(`${taskType}:`),
      );
      if (keys.length === 0)
        throw new Error(`Prompt for taskType ${taskType} not found.`);
      const latestKey = keys.sort().reverse()[0];
      return this.registry.get(latestKey)!.template;
    }

    const key = `${taskType}:${version}`;
    const prompt = this.registry.get(key);
    if (!prompt) throw new Error(`Prompt for ${key} not found.`);
    return prompt.template;
  }

  render(template: string, variables: Record<string, unknown>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }
    return rendered;
  }
}

export const promptRegistry = new PromptRegistry();
