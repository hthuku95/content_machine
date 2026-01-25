import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClippingAccessState {
  hasAccess: boolean;
  lastChecked: number | null;
  setAccess: (hasAccess: boolean) => void;
  shouldCheckAccess: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useClippingAccessStore = create<ClippingAccessState>()(
  persist(
    (set, get) => ({
      hasAccess: false,
      lastChecked: null,

      setAccess: (hasAccess: boolean) => {
        set({
          hasAccess,
          lastChecked: Date.now(),
        });
      },

      shouldCheckAccess: () => {
        const { lastChecked } = get();
        if (!lastChecked) return true;
        return Date.now() - lastChecked > CACHE_DURATION;
      },
    }),
    {
      name: 'clipping-access-storage',
      partialize: (state) => ({
        hasAccess: state.hasAccess,
        lastChecked: state.lastChecked,
      }),
    }
  )
);
