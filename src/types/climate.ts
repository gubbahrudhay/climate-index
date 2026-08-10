// types/climate.ts
// Core data types for the Indian Climate Index.
// Structured so real data can replace fake data with zero UI changes.

export interface ComponentScore {
  highTemp: number;      // standardized anomaly, e.g. -3 to +3
  lowTemp: number;
  heavyRain: number;
  drought: number;
  highWind: number;
  seaLevel: number | null; // null for non-coastal districts
}

export interface TimeSeriesPoint {
  year: number;
  index: number;
}

export interface DistrictClimate {
  districtId: string;
  districtName: string;
  stateId: string;
  index: number;             // current composite index
  trend: "up" | "down" | "flat";
  components: ComponentScore;
  history: TimeSeriesPoint[]; // e.g. 1990-2025
  isCoastal: boolean;
}

export interface StateClimate {
  stateId: string;
  stateName: string;
  index: number;              // aggregate of its districts
  trend: "up" | "down" | "flat";
  districts: string[];        // districtIds
}

/** National-level aggregate */
export interface NationalClimate {
  index: number;
  trend: "up" | "down" | "flat";
  yearRange: [number, number]; // e.g. [1990, 2025]
}
