import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'dark',
      mobileMenuOpen: false,

      // Toggle sidebar
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Set sidebar state
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Toggle theme
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        console.log('uiStore: toggling theme to', newTheme);
        return { theme: newTheme };
      }),

      // Set theme
      setTheme: (theme) => set({ theme }),

      // Toggle mobile menu
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

      // Set mobile menu state
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: 'ui-storage',
    }
  )
);

export default useUIStore;
