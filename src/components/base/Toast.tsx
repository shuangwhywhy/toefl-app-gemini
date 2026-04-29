import React from "react";
import { useToastStore, toast } from "../../store/toast-store";

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-card px-6 py-4 flex items-center justify-between min-w-[320px] animate-slide-in pointer-events-auto border-l-4 ${
            t.type === "success"
              ? "border-l-success"
              : t.type === "error"
                ? "border-l-error"
                : "border-l-primary"
          }`}
        >
          <span className="text-sm font-medium">{t.message}</span>
          <button
            onClick={() => toast.removeToast(t.id)}
            className="ml-4 text-text-muted hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
