// lib/colorScale.ts
// 5-bucket colorblind-safe sequential palette for choropleth maps.

const PALETTE = [
  "#FDF2E9", // very light amber — low index
  "#F5CBA7", // light amber      — moderate
  "#E67E22", // muted orange     — elevated
  "#BA4A00", // burnt orange/red — high
  "#7B241C", // deep muted red   — very high
] as const;

/**
 * Maps a climate index value to a choropleth color.
 * Expected range: roughly -1 to +3, but gracefully clamps.
 *
 * Buckets:
 *   < 0.0  → green
 *   0.0–0.8 → yellow
 *   0.8–1.5 → orange
 *   1.5–2.2 → red
 *   > 2.2  → dark red
 */
export function getColor(indexValue: number): string {
  if (indexValue < 0.0) return PALETTE[0];
  if (indexValue < 0.8) return PALETTE[1];
  if (indexValue < 1.5) return PALETTE[2];
  if (indexValue < 2.2) return PALETTE[3];
  return PALETTE[4];
}

/**
 * Returns the full palette array for use in legends.
 */
export function getPalette(): readonly string[] {
  return PALETTE;
}

/**
 * Returns the bucket thresholds for legend labels.
 */
export function getBucketLabels(): { color: string; label: string }[] {
  return [
    { color: PALETTE[0], label: "< 0.0 (Low)" },
    { color: PALETTE[1], label: "0.0 – 0.8 (Moderate)" },
    { color: PALETTE[2], label: "0.8 – 1.5 (Elevated)" },
    { color: PALETTE[3], label: "1.5 – 2.2 (High)" },
    { color: PALETTE[4], label: "> 2.2 (Very High)" },
  ];
}
