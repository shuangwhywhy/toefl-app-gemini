import { AppShell } from "./components/layout/AppShell";
import { useUserStore } from "./store/user-store";
import { Onboarding } from "./features/onboarding/Onboarding";
import { requestOrchestrator } from "./services/request-orchestrator";
import { promptRegistry } from "./services/prompt-registry";
import { toast } from "./store/toast-store";
import { appActions } from "./store/app-store";

function App() {
  const { profile } = useUserStore();

  const handleGeneratePlan = async () => {
    if (!profile) return;

    appActions.setSyncStatus("SYNCING");
    try {
      const template = promptRegistry.getPrompt("coach_initial_plan");
      const prompt = promptRegistry.render(template, {
        targetScore: profile.targetScore,
        examDate: profile.examDate,
        currentLevel: profile.currentLevel,
        dailyAvailableTime: profile.dailyAvailableTime,
      });

      const plan = await requestOrchestrator.request(prompt, {
        requestType: "coach",
        profileId: profile.profileId,
      });

      console.log("Generated Plan:", plan);
      toast.success("Sprint Plan generated successfully!");
      appActions.setSyncStatus("SAVED");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to generate plan: ${errorMessage}`);
      appActions.setSyncStatus("ERROR");
    }
  };

  if (!profile) {
    return (
      <AppShell>
        <Onboarding />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <section className="glass-card p-8 animate-fade-in">
          <h2 className="text-xl mb-4 text-gradient">
            Welcome back, {profile.userId}!
          </h2>
          <p className="text-text-muted">
            Your target is <strong>{profile.targetScore}</strong> by{" "}
            <strong>{profile.examDate}</strong>.
          </p>
        </section>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <div className="glass-card p-8">
            <h3 className="mb-4">Sprint Stats</h3>
            <ul className="flex flex-col gap-2 text-sm text-text-muted">
              <li className="flex items-center justify-between">
                <span>Daily Commitment</span>
                <span className="text-white font-medium">
                  {profile.dailyAvailableTime}m
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Current Level</span>
                <span className="text-white font-medium">
                  {profile.currentLevel}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Plan Status</span>
                <span className="text-warning font-medium">Not Generated</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-8 flex flex-col justify-center items-center gap-4">
            <p className="text-center text-sm text-text-muted">
              Ready to initialize your strategic roadmap?
            </p>
            <button
              className="btn btn-primary w-full"
              onClick={handleGeneratePlan}
            >
              Generate AI Sprint Plan
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default App;
