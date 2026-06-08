import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Vehicle } from '@/lib/models/vehicle';

interface VehicleState {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  getVehicle: (id: string) => Vehicle | undefined;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      addVehicle: (vehicle) =>
        set((state) => ({ vehicles: [...state.vehicles, vehicle] })),
      updateVehicle: (id, updates) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
          ),
        })),
      removeVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
        })),
      getVehicle: (id) => get().vehicles.find((v) => v.id === id),
    }),
    { name: 'fh6_vehicles' }
  )
);
