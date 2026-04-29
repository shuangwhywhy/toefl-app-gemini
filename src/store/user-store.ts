import { createStore } from "./create-store";
import { UserProfile } from "../types/core";
import { persistenceService } from "../services/persistence/persistence-service";

interface UserState {
  profile: UserProfile | null;
}

const store = createStore<UserState>({
  profile: null,
});

export const useUserStore = store.useStore;

export const userActions = {
  setProfile: (profile: UserProfile) => store.setState({ profile }),
  loadProfile: async (profileId: string) => {
    const profile = await persistenceService.getProfile(profileId);
    if (profile) {
      store.setState({ profile });
      persistenceService.setProfile(profileId);
    }
  },
};
