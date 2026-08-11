// lib/fakeData.ts
// Deterministic fake data generator for the Indian Climate Index.
// Uses mulberry32 PRNG seeded by a string hash so numbers don't change on every reload.

import {
  ComponentScore,
  TimeSeriesPoint,
  DistrictClimate,
  StateClimate,
  NationalClimate,
} from "@/types/climate";

// ---------------------------------------------------------------------------
// PRNG: mulberry32 — fast 32-bit PRNG with good distribution
// ---------------------------------------------------------------------------

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRng(name: string): () => number {
  return mulberry32(hashString(name));
}

// ---------------------------------------------------------------------------
// Helper: generate a value in [min, max] from a 0-1 random
// ---------------------------------------------------------------------------
function rangeVal(rng: () => number, min: number, max: number): number {
  return +(min + rng() * (max - min)).toFixed(2);
}

// ---------------------------------------------------------------------------
// Indian states & their districts (representative subset)
// Using slugified IDs for URL-friendly references
// ---------------------------------------------------------------------------

import { STATES_DATA } from "./stateHierarchy";

// ---------------------------------------------------------------------------
// Generate component scores for a district
// ---------------------------------------------------------------------------

function generateComponentScore(
  rng: () => number,
  isCoastal: boolean
): ComponentScore {
  return {
    highTemp: rangeVal(rng, -1.5, 3.0),
    lowTemp: rangeVal(rng, -2.0, 2.0),
    heavyRain: rangeVal(rng, -1.0, 3.0),
    drought: rangeVal(rng, -1.5, 2.5),
    highWind: rangeVal(rng, -1.0, 2.0),
    seaLevel: isCoastal ? rangeVal(rng, 0.0, 2.5) : null,
  };
}

// ---------------------------------------------------------------------------
// Generate time series with subtle upward trend + noise
// ---------------------------------------------------------------------------

function generateTimeSeries(
  rng: () => number,
  baseIndex: number
): TimeSeriesPoint[] {
  const startYear = 1990;
  const endYear = 2025;
  const points: TimeSeriesPoint[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const progress = (year - startYear) / (endYear - startYear);
    // subtle upward trend: starts ~30% below current, ends at current
    const trendValue = baseIndex * (0.7 + 0.3 * progress);
    // add noise ±0.3
    const noise = (rng() - 0.5) * 0.6;
    points.push({
      year,
      index: +Math.max(-1, trendValue + noise).toFixed(2),
    });
  }

  return points;
}

// ---------------------------------------------------------------------------
// Determine trend from time series
// ---------------------------------------------------------------------------

function determineTrend(history: TimeSeriesPoint[]): "up" | "down" | "flat" {
  if (history.length < 10) return "flat";
  const recent = history.slice(-5).reduce((s, p) => s + p.index, 0) / 5;
  const early = history.slice(0, 5).reduce((s, p) => s + p.index, 0) / 5;
  const diff = recent - early;
  if (diff > 0.3) return "up";
  if (diff < -0.3) return "down";
  return "flat";
}

// ---------------------------------------------------------------------------
// Public API: generate all fake climate data
// ---------------------------------------------------------------------------

let _cachedStates: StateClimate[] | null = null;
let _cachedDistricts: Map<string, DistrictClimate[]> | null = null;
let _cachedAllDistricts: DistrictClimate[] | null = null;

function ensureGenerated() {
  if (_cachedStates) return;

  const states: StateClimate[] = [];
  const districtsByState = new Map<string, DistrictClimate[]>();
  const allDistricts: DistrictClimate[] = [];

  for (const stateInfo of STATES_DATA) {
    const stateDistricts: DistrictClimate[] = [];

    for (const d of stateInfo.districts) {
      const rng = seededRng(d.districtId);
      const index = rangeVal(rng, -0.5, 3.0);
      const components = generateComponentScore(rng, d.isCoastal);
      const history = generateTimeSeries(seededRng(d.districtId + "-ts"), index);
      const trend = determineTrend(history);

      const district: DistrictClimate = {
        districtId: d.districtId,
        districtName: d.districtName,
        stateId: stateInfo.stateId,
        index,
        trend,
        components,
        history,
        isCoastal: d.isCoastal,
      };

      stateDistricts.push(district);
      allDistricts.push(district);
    }

    districtsByState.set(stateInfo.stateId, stateDistricts);

    // Aggregate state index from district averages
    const avgIndex =
      stateDistricts.reduce((sum, d) => sum + d.index, 0) /
      stateDistricts.length;
    const stateHistory = generateTimeSeries(
      seededRng(stateInfo.stateId + "-state-ts"),
      avgIndex
    );
    
    // Average components
    const stateComponents = {
      highTemp: +(stateDistricts.reduce((s, d) => s + d.components.highTemp, 0) / stateDistricts.length).toFixed(2),
      lowTemp: +(stateDistricts.reduce((s, d) => s + d.components.lowTemp, 0) / stateDistricts.length).toFixed(2),
      heavyRain: +(stateDistricts.reduce((s, d) => s + d.components.heavyRain, 0) / stateDistricts.length).toFixed(2),
      drought: +(stateDistricts.reduce((s, d) => s + d.components.drought, 0) / stateDistricts.length).toFixed(2),
      highWind: +(stateDistricts.reduce((s, d) => s + d.components.highWind, 0) / stateDistricts.length).toFixed(2),
      seaLevel: stateInfo.isCoastal ? +(stateDistricts.filter(d => d.components.seaLevel !== null).reduce((s, d) => s + (d.components.seaLevel || 0), 0) / Math.max(1, stateDistricts.filter(d => d.components.seaLevel !== null).length)).toFixed(2) : null,
    };

    states.push({
      stateId: stateInfo.stateId,
      stateName: stateInfo.stateName,
      index: +avgIndex.toFixed(2),
      trend: determineTrend(stateHistory),
      history: stateHistory,
      components: stateComponents,
      districts: stateDistricts.map((d) => d.districtId),
    });
  }

  _cachedStates = states;
  _cachedDistricts = districtsByState;
  _cachedAllDistricts = allDistricts;
}

/** Get all state-level climate data */
export function getStatesClimate(): StateClimate[] {
  ensureGenerated();
  return _cachedStates!;
}

/** Get districts for a specific state */
export function getDistrictsForState(stateId: string): DistrictClimate[] {
  ensureGenerated();
  return _cachedDistricts!.get(stateId) || [];
}

/** Get a single district by ID */
export function getDistrictClimate(
  districtId: string
): DistrictClimate | undefined {
  ensureGenerated();
  return _cachedAllDistricts!.find((d) => d.districtId === districtId);
}

/** Get a single state by ID */
export function getStateClimate(stateId: string): StateClimate | undefined {
  ensureGenerated();
  return _cachedStates!.find((s) => s.stateId === stateId);
}

/** Get national aggregate */
export function getNationalClimate(): NationalClimate {
  ensureGenerated();
  const states = _cachedStates!;
  const avgIndex =
    states.reduce((sum, s) => sum + s.index, 0) / states.length;

  // Count trends
  const upCount = states.filter((s) => s.trend === "up").length;
  const downCount = states.filter((s) => s.trend === "down").length;

  let trend: "up" | "down" | "flat" = "flat";
  if (upCount > downCount + 5) trend = "up";
  else if (downCount > upCount + 5) trend = "down";

  return {
    index: +avgIndex.toFixed(2),
    trend,
    yearRange: [1990, 2025],
  };
}

/** Get the list of all state IDs and names (for map labeling) */
export function getStatesList(): { stateId: string; stateName: string }[] {
  return STATES_DATA.map((s) => ({
    stateId: s.stateId,
    stateName: s.stateName,
  }));
}
