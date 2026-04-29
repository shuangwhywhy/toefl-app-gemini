import { createStore } from "./create-store";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
}

const store = createStore<ToastState>({
  toasts: [],
});

export const useToastStore = store.useStore;

export const toast = {
  success: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    store.setState((s) => ({
      toasts: [...s.toasts, { id, message, type: "success" }],
    }));
    setTimeout(() => {
      store.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  error: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    store.setState((s) => ({
      toasts: [...s.toasts, { id, message, type: "error" }],
    }));
    setTimeout(() => {
      store.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  info: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    store.setState((s) => ({
      toasts: [...s.toasts, { id, message, type: "info" }],
    }));
    setTimeout(() => {
      store.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  warning: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    store.setState((s) => ({
      toasts: [...s.toasts, { id, message, type: "warning" }],
    }));
    setTimeout(() => {
      store.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id: string) => {
    store.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
};
