import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RestaurantMode = 'normal' | 'kitchen' | 'waiter'

interface RestaurantModeStore {
  mode: RestaurantMode
  setMode: (mode: RestaurantMode) => void
}

export const useRestaurantMode = create<RestaurantModeStore>()(
  persist(
    (set) => ({
      mode: 'normal',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'restaurant-mode-storage' },
  ),
)
