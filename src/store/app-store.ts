import { createStore } from "./create-store";

type SyncStatus = "SAVED" | "SYNCING" | "ERROR";

interface AppState {
  syncStatus: SyncStatus;
}

const store = createStore<AppState>({
  syncStatus: "SAVED",
});

export const useAppStore = store.useStore;

export const appActions = {
  setSyncStatus: (status: SyncStatus) => store.setState({ syncStatus: status }),
};
