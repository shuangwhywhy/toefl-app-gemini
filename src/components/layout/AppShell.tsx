import React from "react";
import { SyncIndicator } from "../base/SyncIndicator";
import { ToastContainer } from "../base/Toast";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-white">
            T
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            TOEFL <span className="text-primary">AI</span> Coach
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <SyncIndicator />
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-white/20 transition-all">
            YQ
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 animate-fade-in">
        {children}
      </main>

      <ToastContainer />
    </div>
  );
};
