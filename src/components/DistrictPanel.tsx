"use client";

import React, { useEffect, useState, memo } from "react";
import { useClimateStore } from "@/lib/store";
import { getDistrictClimate, getStateClimate } from "@/lib/fakeData";
import { getColor } from "@/lib/colorScale";
import ComponentGauge from "./ComponentGauge";
import TrendSparkline from "./TrendSparkline";

const TREND_TEXT: Record<string, string> = {
  up: "rising",
  down: "declining",
  flat: "stable",
};

const TREND_ARROWS: Record<string, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

function getInterpretation(
  districtName: string,
  trend: string,
  highTemp: number,
  drought: number,
  heavyRain: number
): string {
  const parts: string[] = [];

  if (highTemp > 1.5)
    parts.push("a significant increase in extreme heat days");
  else if (highTemp > 0.5)
    parts.push("a moderate increase in extreme heat days");

  if (drought > 1.5)
    parts.push("extended drought conditions");
  else if (drought > 0.5)
    parts.push("a trend toward drier conditions");

  if (heavyRain > 1.5)
    parts.push("more frequent heavy rainfall events");
  else if (heavyRain > 0.5)
    parts.push("a moderate rise in heavy rainfall");

  if (parts.length === 0) {
    return `${districtName} shows a ${TREND_TEXT[trend]} climate index trend over the last decade, with relatively mild changes across all components.`;
  }

  return `${districtName} has experienced ${parts.join(", and ")}, with an overall ${TREND_TEXT[trend]} trend over the last decade.`;
}

const DistrictPanel = memo(function DistrictPanel() {
  const selectedDistrictId = useClimateStore((s) => s.selectedDistrictId);
  const selectedStateId = useClimateStore((s) => s.selectedStateId);
  const goBackToState = useClimateStore((s) => s.goBackToState);
  const drillLevel = useClimateStore((s) => s.drillLevel);
  const [isOpen, setIsOpen] = useState(false);

  const district = selectedDistrictId
    ? getDistrictClimate(selectedDistrictId)
    : null;
  const state = selectedStateId
    ? getStateClimate(selectedStateId)
    : null;

  useEffect(() => {
    if (drillLevel === "district" && district) {
      // Trigger animation after mount
      requestAnimationFrame(() => setIsOpen(true));
    } else {
      setIsOpen(false);
    }
  }, [drillLevel, district]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(goBackToState, 300); // Wait for animation
  };

  if (!district || drillLevel !== "district") return null;

  const interpretation = getInterpretation(
    district.districtName,
    district.trend,
    district.components.highTemp,
    district.components.drought,
    district.components.heavyRain
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-ink/10 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Panel — desktop: right drawer, mobile: bottom sheet */}
      <div
        className={`fixed z-50 overflow-y-auto bg-paper border-hairline transition-transform duration-300 ease-out
          /* Desktop: right drawer */
          right-0 top-0 h-full w-full max-w-md border-l
          /* Mobile: bottom sheet */
          max-md:inset-x-0 max-md:top-auto max-md:bottom-0 max-md:h-[85vh] max-md:max-w-none max-md:border-t max-md:border-l-0
          ${
            isOpen
              ? "translate-x-0 max-md:translate-x-0 max-md:translate-y-0"
              : "translate-x-full max-md:translate-x-0 max-md:translate-y-full"
          }
        `}
        id="district-panel"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center py-2 md:hidden">
          <div className="h-1 w-10 bg-hairline" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center border border-hairline bg-paper text-muted transition-all hover:bg-hairline hover:text-ink"
          id="district-panel-close"
        >
          ✕
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              {state?.stateName || ""}
            </p>
            <h3 className="mt-1 text-3xl font-bold text-ink">
              {district.districtName}
            </h3>
          </div>

          {/* Main index + trend */}
          <div className="mb-8 border-y border-hairline py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Climate Index
                </p>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-5xl font-bold tabular-nums text-ink">
                    {district.index.toFixed(2)}
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      district.trend === "up"
                        ? "text-[#7B241C]"
                        : "text-muted"
                    }`}
                  >
                    {TREND_ARROWS[district.trend]}
                  </span>
                </div>
              </div>
              {district.isCoastal && (
                <div className="border border-hairline px-3 py-1 text-xs font-bold text-ink">
                  🌊 Coastal
                </div>
              )}
            </div>
          </div>

          {/* Trend sparkline */}
          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
              Historical Trend (1990–2025)
            </p>
            <div className="border border-hairline p-4">
              <TrendSparkline
                data={district.history}
                color="var(--color-ink)"
                height={120}
                showAxes
              />
            </div>
          </div>

          {/* Component breakdown */}
          <div className="mb-8 border-b border-hairline pb-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">
              Component Breakdown
            </p>
            <div className="space-y-4">
              <ComponentGauge
                label="High Temperature"
                value={district.components.highTemp}
                icon="🌡️"
                description="Frequency of extreme high temperature days"
              />
              <ComponentGauge
                label="Low Temperature"
                value={district.components.lowTemp}
                icon="❄️"
                description="Frequency of extreme low temperature days"
              />
              <ComponentGauge
                label="Heavy Rainfall"
                value={district.components.heavyRain}
                icon="🌧️"
                description="Maximum 5-day rainfall intensity"
              />
              <ComponentGauge
                label="Drought"
                value={district.components.drought}
                icon="☀️"
                description="Consecutive dry days"
              />
              <ComponentGauge
                label="High Wind"
                value={district.components.highWind}
                icon="💨"
                description="Frequency of extreme high wind events"
              />
              {district.isCoastal &&
                district.components.seaLevel !== null && (
                  <ComponentGauge
                    label="Coastal Flooding / Sea Level"
                    value={district.components.seaLevel}
                    icon="🌊"
                    description="Sea level rise indicator (coastal districts only)"
                  />
                )}
            </div>
          </div>

          {/* Interpretation */}
          <div className="border border-hairline p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-ink">
              Interpretation
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {interpretation}
            </p>
          </div>
        </div>
      </div>
    </>
  );
});

export default DistrictPanel;
