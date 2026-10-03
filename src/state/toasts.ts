import { create } from 'zustand';

export type ToastTone = 'success' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

/** Short-lived confirmations ("Aplazada…", "−50 XP"). Never saved. */
export const useToasts = create<ToastState>()((set) => {
  let nextId = 1;
  return {
    toasts: [],
    show: (message, tone = 'info') =>
      // One at a time: a new confirmation replaces the previous one.
      set({ toasts: [{ id: nextId++, message, tone }] }),
    dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  };
});

export function showToast(message: string, tone?: ToastTone): void {
  useToasts.getState().show(message, tone);
}
