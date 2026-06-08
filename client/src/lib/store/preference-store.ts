import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreference } from '@/lib/models/preference';
import { DEFAULT_USER_PREFERENCE } from '@/lib/models/preference';

interface PreferenceState {
  preference: UserPreference;
  updatePreference: (updates: Partial<UserPreference>) => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      preference: DEFAULT_USER_PREFERENCE,
      updatePreference: (updates) =>
        set((state) => ({
          preference: { ...state.preference, ...updates },
        })),
    }),
    { name: 'fh6_preference' }
  )
);
