import { TaskType } from "../../types/core";

export interface ScoringSchema {
  version: string;
  dimensions: ScoringDimension[];
}

export interface ScoringDimension {
  name: string;
  maxPoints: number;
  description: string;
}

export class RuleSetService {
  async getRuleSet(taskType: TaskType, version = "1.0") {
    return {
      taskType,
      version: version,
      timing: 120, // seconds
      rules: ["Rule 1", "Rule 2"],
    };
  }

  async getScoringSchema(
    taskType: TaskType,
    version = "1.0",
  ): Promise<ScoringSchema> {
    const schemas: Record<string, ScoringSchema> = {
      writing_build_sentence: {
        version: version,
        dimensions: [
          {
            name: "Grammar",
            maxPoints: 5,
            description: "Grammatical accuracy",
          },
          {
            name: "Vocabulary",
            maxPoints: 5,
            description: "Appropriate word choice",
          },
        ],
      },
      reading_single: {
        version: version,
        dimensions: [
          {
            name: "Accuracy",
            maxPoints: 1,
            description: "Correct option selected",
          },
        ],
      },
    };

    return schemas[taskType] || { version: "0.1", dimensions: [] };
  }
}

export const ruleSetService = new RuleSetService();
