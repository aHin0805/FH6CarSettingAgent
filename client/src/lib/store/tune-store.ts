import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TuneSetup, TuneRevision, PerformanceTest } from '@/lib/models/tuning';

interface TuneState {
  tunes: TuneSetup[];
  revisions: TuneRevision[];
  tests: PerformanceTest[];
  addTune: (tune: TuneSetup) => void;
  updateTune: (id: string, tune: Partial<TuneSetup>) => void;
  removeTune: (id: string) => void;
  getTune: (id: string) => TuneSetup | undefined;
  getTunesByVehicle: (vehicleId: string) => TuneSetup[];
  addRevision: (revision: TuneRevision) => void;
  addTest: (test: PerformanceTest) => void;
}

export const useTuneStore = create<TuneState>()(
  persist(
    (set, get) => ({
      tunes: [],
      revisions: [],
      tests: [],
      addTune: (tune) =>
        set((state) => ({ tunes: [...state.tunes, tune] })),
      updateTune: (id, updates) =>
        set((state) => ({
          tunes: state.tunes.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),
      removeTune: (id) =>
        set((state) => ({
          tunes: state.tunes.filter((t) => t.id !== id),
          revisions: state.revisions.filter((r) => r.tuneId !== id),
          tests: state.tests.filter((t) => t.tuneId !== id),
        })),
      getTune: (id) => get().tunes.find((t) => t.id === id),
      getTunesByVehicle: (vehicleId) =>
        get().tunes.filter((t) => t.vehicleId === vehicleId),
      addRevision: (revision) =>
        set((state) => ({ revisions: [...state.revisions, revision] })),
      addTest: (test) =>
        set((state) => ({ tests: [...state.tests, test] })),
    }),
    { name: 'fh6_tunes' }
  )
);
