import { create } from "zustand";

/**
 * Generic, lightweight UI state that many components care about
 * (modals, global loading overlays, theme, etc.). Keep this store small —
 * feature-specific UI state belongs closer to the feature that owns it.
 */

interface UiState {
  theme: "light" | "dark";
  isGlobalLoading: boolean;
  activeModal: string | null;
  setTheme: (theme: "light" | "dark") => void;
  setGlobalLoading: (loading: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: "light",
  isGlobalLoading: false,
  activeModal: null,
  setTheme: (theme) => set({ theme }),
  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
