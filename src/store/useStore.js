import { create } from 'zustand'

const useStore = create((set) => ({
  // ── Auth slice ──────────────────────────────────────────────
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  logout: () => set({ user: null, profile: null }),

  // ── Language slice ──────────────────────────────────────────
  lang: localStorage.getItem('i18nextLng') || 'es',
  setLang: (lang) => set({ lang }),

  // ── UI slice ────────────────────────────────────────────────
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

export default useStore
