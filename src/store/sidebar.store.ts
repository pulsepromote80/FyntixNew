import { create } from "zustand";

/**
 * UI-only state for the app shell's sidebar (desktop collapse + mobile
 * open/close). Deliberately separate from `ui.store.ts` since it changes
 * frequently and is consumed by a narrow set of layout components.
 */

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleCollapsed: () =>
    set((state) => ({ isCollapsed: !state.isCollapsed })),
  setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
}));
