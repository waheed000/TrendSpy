import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      selectedCity: 'Lahore',
      selectedCategory: 'All',
      minWinScore: 0,
      user: null,
      alertCount: 3,
      darkMode: true,

      setSelectedCity: (city) => set({ selectedCity: city }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setMinWinScore: (score) => set({ minWinScore: score }),
      setUser: (user) => set({ user }),
      setAlertCount: (count) => set({ alertCount: count }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      logout: () => set({ user: null }),
    }),
    {
      name: 'trendspy-storage',
      partialize: (state) => ({ user: state.user, darkMode: state.darkMode }),
    }
  )
)

export default useStore
