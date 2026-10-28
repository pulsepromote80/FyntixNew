import { create } from "zustand";

export interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastState {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage["type"]) => void;
  dismissToast: (id: number) => void;
}

let nextToastId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message, type = "success") =>
    set((state) => ({
      toasts: [...state.toasts, { id: ++nextToastId, message, type }],
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
