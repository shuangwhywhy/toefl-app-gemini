import { describe, it, expect, beforeEach } from "vitest";
import { trainingStore, trainingActions } from "../store/training-runtime";
import { db } from "../services/persistence/db";
import { TrainingSession } from "../types/core";

describe("TrainingRuntime", () => {
  beforeEach(async () => {
    await db.sessions.clear();
    await db.items.clear();
    // Reset store
    trainingStore.setState({
      currentSession: null,
      currentItem: null,
      currentResponse: null,
      isLoading: false,
      error: null,
    });
  });

  it("should start a session and persist it", async () => {
    const session: TrainingSession = {
      sessionId: "sess1",
      profileId: "user1",
      planId: "plan1",
      section: "Reading",
      taskType: "reading_single",
      status: "active",
      startedAt: new Date().toISOString(),
      itemOrder: [],
      sessionGoal: "Test goal",
      aiCoachRationale: "Rationale",
    };

    await trainingActions.startSession(session);

    expect(trainingStore.getState().currentSession?.sessionId).toBe("sess1");
    const persisted = await db.sessions.get("sess1");
    expect(persisted).toBeDefined();
  });

  it("should restore a session from IndexedDB", async () => {
    const session: TrainingSession = {
      sessionId: "sess2",
      profileId: "user1",
      planId: "plan1",
      section: "Reading",
      taskType: "reading_single",
      status: "active",
      startedAt: new Date().toISOString(),
      itemOrder: [],
      sessionGoal: "Restore goal",
      aiCoachRationale: "Rationale",
    };
    await db.sessions.add(session);

    await trainingActions.restoreSession("sess2");

    expect(trainingStore.getState().currentSession?.sessionGoal).toBe(
      "Restore goal",
    );
  });
});
