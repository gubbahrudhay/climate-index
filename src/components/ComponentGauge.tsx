"use client";

import React, { memo } from "react";

interface ComponentGaugeProps {
  label: string;
  value: number;
  icon: string;
  /** Tooltip description */
  description?: string;
}

/**
 * Maps a standardized anomaly value (-3 to +3) to a gauge width and color.
 */
function getGaugeStyle(value: number): {
  width: string;
  color: string;
  bgColor: string;
} {
  // Normalize value from [-3, 3] to [0, 1]
  const normalized = Math.max(0, Math.min(1, (value + 3) / 6));
  const width = `${Math.max(5, normalized * 100)}%`;

  return { width, color: "var(--color-ink)", bgColor: "var(--color-hairline)" };
}

const ComponentGauge = memo(function ComponentGauge({
  label,
  value,
  icon,
  description,
}: ComponentGaugeProps) {
  const { width, color, bgColor } = getGaugeStyle(value);

  return (
    <div className="group" title={description}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-xs font-bold text-ink">{label}</span>
        </div>
        <span
          className="text-xs font-bold tabular-nums text-ink"
        >
          {value > 0 ? "+" : ""}
          {value.toFixed(2)}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden bg-hairline"
      >
        <div
          className="h-full transition-all duration-700 ease-out bg-ink"
          style={{ width }}
        />
      </div>
    </div>
  );
});

export default ComponentGauge;
