import React from "react";
import { useAppStore } from "../../store/app-store";

export const SyncIndicator: React.FC = () => {
  const { syncStatus } = useAppStore();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider transition-all duration-300">
      <div
        className={`w-2 h-2 rounded-full 
        ${syncStatus === "SAVED" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : ""}
        ${syncStatus === "SYNCING" ? "bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" : ""}
        ${syncStatus === "ERROR" ? "bg-rose-500 shadow-[0_0_8px_#ef4444]" : ""}
      `}
      />
      <span
        className={syncStatus === "ERROR" ? "text-rose-400" : "text-text-muted"}
      >
        {syncStatus}
      </span>
    </div>
  );
};
