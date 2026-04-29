import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../services/persistence/db";
import { persistenceService } from "../services/persistence/persistence-service";
import { UserResponse, UserProfile } from "../types/core";

describe("PersistenceService", () => {
  beforeEach(async () => {
    await db.profiles.clear();
    await db.responses.clear();
    persistenceService.setProfile("user1");
  });

  it("should save and retrieve user profiles", async () => {
    const profile = {
      profileId: "user1",
      userId: "yq",
      targetScore: 100,
    } as UserProfile;
    await persistenceService.saveProfile(profile);

    const retrieved = await persistenceService.getProfile("user1");
    expect(retrieved?.userId).toBe("yq");
  });

  it("should enforce tenant isolation for responses", async () => {
    persistenceService.setProfile("user1");
    const response = {
      responseId: "res1",
      profileId: "user2",
      itemId: "item1",
    } as UserResponse;

    await expect(persistenceService.saveResponse(response)).rejects.toThrow(
      /isolation violation/,
    );
  });

  it("should allow saving responses for the current profile", async () => {
    persistenceService.setProfile("user1");
    const response = {
      responseId: "res1",
      profileId: "user1",
      itemId: "item1",
    } as UserResponse;

    await persistenceService.saveResponse(response);
    const saved = await db.responses.get("res1");
    expect(saved?.profileId).toBe("user1");
  });
});
