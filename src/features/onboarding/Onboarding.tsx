import React, { useState } from "react";
import { UserProfile } from "../../types/core";
import { persistenceService } from "../../services/persistence/persistence-service";
import { userActions } from "../../store/user-store";
import { v4 as uuidv4 } from "uuid";
import { toast } from "../../store/toast-store";

export const Onboarding: React.FC = () => {
  // const { profile } = useUserStore();
  const [formData, setFormData] = useState({
    targetScore: 100,
    examDate: "",
    currentLevel: "Intermediate",
    dailyAvailableTime: 60,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      profileId: uuidv4(),
      userId: "yq", // default for now
      tenantId: "default",
      targetScore: formData.targetScore,
      examDate: formData.examDate,
      currentLevel: formData.currentLevel,
      dailyAvailableTime: formData.dailyAvailableTime,
      languagePreference: "Chinese",
      devicePreference: "Mac",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await persistenceService.saveProfile(profile);
      userActions.setProfile(profile);
      persistenceService.setProfile(profile.profileId);
      toast.success("Welcome! Your profile has been created.");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to save profile.");
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="glass-card p-8">
        <h2 className="text-xl mb-6 text-gradient">
          Create Your Sprint Profile
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-muted">
              Target Score (0-120)
            </label>
            <input
              type="number"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              value={formData.targetScore}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetScore: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-muted">
              Exam Date
            </label>
            <input
              type="date"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              value={formData.examDate}
              onChange={(e) =>
                setFormData({ ...formData, examDate: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-muted">
              Current Level
            </label>
            <select
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              value={formData.currentLevel}
              onChange={(e) =>
                setFormData({ ...formData, currentLevel: e.target.value })
              }
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-muted">
              Daily Time (Minutes)
            </label>
            <input
              type="number"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              value={formData.dailyAvailableTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dailyAvailableTime: parseInt(e.target.value),
                })
              }
            />
          </div>
          <button type="submit" className="btn btn-primary mt-4">
            Initialize AI Coach
          </button>
        </form>
      </div>
    </div>
  );
};
