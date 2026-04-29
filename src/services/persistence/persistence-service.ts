import { db } from "./db";
import {
  UserProfile,
  PracticeItem,
  UserResponse,
  ScoringResult,
} from "../../types/core";

export class PersistenceService {
  private currentProfileId: string | null = null;

  setProfile(profileId: string) {
    this.currentProfileId = profileId;
  }

  // User Profile
  async saveProfile(profile: UserProfile) {
    return db.profiles.put(profile);
  }

  async getProfile(profileId: string) {
    return db.profiles.get(profileId);
  }

  // Session Management (with isolation)
  async getSessionsForProfile(profileId: string) {
    return db.sessions.where("profileId").equals(profileId).toArray();
  }

  async getLatestSession(profileId: string) {
    const sessions = await db.sessions
      .where("profileId")
      .equals(profileId)
      .sortBy("startedAt");
    return sessions.length > 0 ? sessions[sessions.length - 1] : null;
  }

  // Item & Response
  async saveItem(item: PracticeItem) {
    return db.items.put(item);
  }

  async saveResponse(response: UserResponse) {
    if (this.currentProfileId && response.profileId !== this.currentProfileId) {
      throw new Error("Tenant isolation violation: Profile mismatch.");
    }
    return db.responses.put(response);
  }

  async getScoringResult(responseId: string) {
    return db.scoringResults.where("responseId").equals(responseId).first();
  }

  async saveScoringResult(result: ScoringResult) {
    return db.scoringResults.put(result);
  }

  // Snapshot & Recovery
  async saveSnapshot(id: string, data: unknown) {
    return db.snapshots.put({
      id,
      data,
      updatedAt: new Date().toISOString(),
    });
  }

  async getSnapshot(id: string) {
    return db.snapshots.get(id);
  }

  // Data Migration / Versioning
  async clearProfileData(profileId: string) {
    await db.transaction(
      "rw",
      [db.sessions, db.items, db.responses, db.scoringResults],
      async () => {
        await db.sessions.where("profileId").equals(profileId).delete();
        await db.responses.where("profileId").equals(profileId).delete();
      },
    );
  }
}

export const persistenceService = new PersistenceService();
