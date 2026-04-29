import Dexie, { type Table } from "dexie";
import {
  UserProfile,
  SprintPlan,
  TrainingSession,
  PracticeItem,
  UserResponse,
  ScoringResult,
  RequestRecord,
  DeviceState,
} from "../../types/core";

export class AppDatabase extends Dexie {
  profiles!: Table<UserProfile>;
  plans!: Table<SprintPlan>;
  sessions!: Table<TrainingSession>;
  items!: Table<PracticeItem>;
  responses!: Table<UserResponse>;
  scoringResults!: Table<ScoringResult>;
  requests!: Table<RequestRecord>;
  deviceStates!: Table<DeviceState>;
  snapshots!: Table<{ id: string; data: unknown; updatedAt: string }>;

  constructor() {
    super("TOEFLCoachDB");
    this.version(1).stores({
      profiles: "profileId, userId, tenantId",
      plans: "planId, profileId",
      sessions: "sessionId, profileId, planId, status",
      items: "itemId, sessionId, taskType, isPreloaded",
      responses: "responseId, itemId, sessionId, profileId, status",
      scoringResults: "scoringId, responseId, itemId",
      requests: "requestId, profileId, sessionId, idempotencyKey, status",
      deviceStates: "profileId, deviceId",
      snapshots: "id",
    });
  }
}

export const db = new AppDatabase();
