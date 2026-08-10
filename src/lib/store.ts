// lib/store.ts
// Zustand store for drill-down navigation state

import { create } from "zustand";

export type DrillLevel = "national" | "state" | "district";

interface ClimateStore {
  drillLevel: DrillLevel;
  selectedStateId: string | null;
  selectedDistrictId: string | null;

  // Actions
  selectState: (stateId: string) => void;
  selectDistrict: (districtId: string) => void;
  goBackToNational: () => void;
  goBackToState: () => void;
}

export const useClimateStore = create<ClimateStore>((set) => ({
  drillLevel: "national",
  selectedStateId: null,
  selectedDistrictId: null,

  selectState: (stateId: string) =>
    set({
      drillLevel: "state",
      selectedStateId: stateId,
      selectedDistrictId: null,
    }),

  selectDistrict: (districtId: string) =>
    set((state) => ({
      drillLevel: "district",
      selectedDistrictId: districtId,
      selectedStateId: state.selectedStateId,
    })),

  goBackToNational: () =>
    set({
      drillLevel: "national",
      selectedStateId: null,
      selectedDistrictId: null,
    }),

  goBackToState: () =>
    set((state) => ({
      drillLevel: "state",
      selectedDistrictId: null,
      selectedStateId: state.selectedStateId,
    })),
}));
