import { createStore } from "./create-store";
import { db } from "../services/persistence/db";
import {
  TrainingSession,
  PracticeItem,
  UserResponse,
  ScoringResult,
} from "../types/core";

interface TrainingRuntimeState {
  currentSession: TrainingSession | null;
  currentItem: PracticeItem | null;
  currentResponse: UserResponse | null;
  currentScoring: ScoringResult | null;
  isLoading: boolean;
  error: string | null;
}

export const trainingStore = createStore<TrainingRuntimeState>({
  currentSession: null,
  currentItem: null,
  currentResponse: null,
  currentScoring: null,
  isLoading: false,
  error: null,
});

export const useTrainingRuntime = trainingStore.useStore;

export const trainingActions = {
  setSession: (session: TrainingSession) =>
    trainingStore.setState({ currentSession: session }),
  setItem: (item: PracticeItem) =>
    trainingStore.setState({ currentItem: item }),
  setResponse: (response: UserResponse) =>
    trainingStore.setState({ currentResponse: response }),
  setScoring: (scoring: ScoringResult) =>
    trainingStore.setState({ currentScoring: scoring }),

  startSession: async (session: TrainingSession) => {
    trainingStore.setState({ isLoading: true });
    try {
      await db.sessions.add(session);
      trainingStore.setState({
        currentSession: session,
        currentItem: null,
        currentResponse: null,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      trainingStore.setState({ error: errorMessage });
    } finally {
      trainingStore.setState({ isLoading: false });
    }
  },

  loadItem: async (itemId: string) => {
    trainingStore.setState({ isLoading: true });
    try {
      const item = await db.items.get(itemId);
      if (item) {
        trainingStore.setState({ currentItem: item });
        const response = await db.responses
          .where("itemId")
          .equals(itemId)
          .first();
        if (response) {
          trainingStore.setState({ currentResponse: response });
        }
      } else {
        trainingStore.setState({ error: "Item not found" });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      trainingStore.setState({ error: errorMessage });
    } finally {
      trainingStore.setState({ isLoading: false });
    }
  },

  updateResponse: async (updates: Partial<UserResponse>) => {
    const { currentResponse } = trainingStore.getState();
    if (!currentResponse) return;

    const updatedResponse = { ...currentResponse, ...updates };
    try {
      await db.responses.put(updatedResponse);
      trainingStore.setState({ currentResponse: updatedResponse });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      trainingStore.setState({ error: errorMessage });
    }
  },

  restoreSession: async (sessionId: string) => {
    trainingStore.setState({ isLoading: true });
    try {
      const session = await db.sessions.get(sessionId);
      if (session) {
        trainingStore.setState({ currentSession: session });
        if (session.currentItemId) {
          await trainingActions.loadItem(session.currentItemId);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      trainingStore.setState({ error: errorMessage });
    } finally {
      trainingStore.setState({ isLoading: false });
    }
  },
};
