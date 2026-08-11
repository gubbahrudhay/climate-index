"use client";

import React, { useState, useCallback, useEffect, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  GeographyShape,
  ZoomableGroup,
} from "react-simple-maps";
import { getDistrictsForState, getStateClimate, getDistrictClimate } from "@/lib/fakeData";
import { getColor } from "@/lib/colorScale";
import { INDIA_DISTRICTS_GEO_URL, stateNameToSlug } from "@/lib/geoUtils";
import { STATES_DATA } from "@/lib/stateHierarchy";
import { useClimateStore } from "@/lib/store";
import { DistrictClimate } from "@/types/climate";
import ComponentGauge from "./ComponentGauge";
import TrendSparkline from "./TrendSparkline";

interface TooltipState {
  x: number;
  y: number;
  name: string;
  index: number;
  trend: "up" | "down" | "flat";
}

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


const StateDrilldown = memo(function StateDrilldown() {
  const selectedStateId = useClimateStore((s) => s.selectedStateId);
  const selectedDistrictId = useClimateStore((s) => s.selectedDistrictId);
  const selectDistrict = useClimateStore((s) => s.selectDistrict);
  const goBackToNational = useClimateStore((s) => s.goBackToNational);
  const goBackToState = useClimateStore((s) => s.goBackToState);
  
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get state info
  const stateClimate = selectedStateId
    ? getStateClimate(selectedStateId)
    : null;
  const stateMeta = selectedStateId
    ? STATES_DATA.find(s => s.stateId === selectedStateId)
    : null;
  const districts = selectedStateId
    ? getDistrictsForState(selectedStateId)
    : [];

  const districtData = selectedDistrictId
    ? getDistrictClimate(selectedDistrictId)
    : null;

  // Build a lookup by district name (normalized)
  const districtMap = new Map<string, DistrictClimate>();
  districts.forEach((d) => {
    districtMap.set(d.districtName.toLowerCase(), d);
  });

  const geoUrl = INDIA_DISTRICTS_GEO_URL;

  useEffect(() => {
    setIsLoaded(false);
    // Small delay for animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [selectedStateId]);

  const findDistrictData = useCallback(
    (geoName: string): DistrictClimate | undefined => {
      // Try exact match first
      const exact = districtMap.get(geoName.toLowerCase());
      if (exact) return exact;

      // Try partial match
      for (const [key, value] of districtMap.entries()) {
        if (
          key.includes(geoName.toLowerCase()) ||
          geoName.toLowerCase().includes(key)
        ) {
          return value;
        }
      }
      return undefined;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedStateId]
  );

  const handleMouseEnter = useCallback(
    (
      geo: GeographyShape,
      event: React.MouseEvent
    ) => {
      const data = findDistrictData(geo.properties.DISTRICT || "");
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        name: geo.properties.DISTRICT || "",
        index: data?.index ?? 0,
        trend: data?.trend ?? "flat",
      });
    },
    [findDistrictData]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (tooltip) {
        setTooltip((prev) =>
          prev ? { ...prev, x: event.clientX, y: event.clientY } : null
        );
      }
    },
    [tooltip]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleDistrictClick = useCallback(
    (geo: GeographyShape) => {
      const data = findDistrictData(geo.properties.DISTRICT || "");
      if (data) {
        selectDistrict(data.districtId);
      }
    },
    [findDistrictData, selectDistrict]
  );

  if (!selectedStateId || !stateClimate || !stateMeta) return null;

  return (
    <div
      className={`relative w-full transition-all duration-700 ${
        isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
      id="state-drilldown-container"
    >
      {/* Back button */}
      <button
        onClick={goBackToNational}
        className="group absolute -top-12 left-0 z-20 flex items-center gap-2 border border-hairline bg-paper px-4 py-2 text-sm font-bold text-ink transition-all hover:bg-hairline"
        id="back-to-india-btn"
      >
        <span className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        Back to India
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: The Map */}
        <div className="relative h-[600px] w-full rounded-2xl border border-hairline bg-paper overflow-hidden">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1000,
            }}
            width={600}
            height={600}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup center={stateMeta.center} zoom={stateMeta.zoom}>
              <Geographies geography={geoUrl}>
                {({ geographies }) => {
                  const stateGeos = geographies.filter(
                    (geo) => stateNameToSlug(geo.properties.STATE_UT || "") === selectedStateId
                  );

                  return stateGeos.map((geo) => {
                    const data = findDistrictData(
                      geo.properties.DISTRICT || ""
                    );
                    const fillColor = data
                      ? getColor(data.index)
                      : "var(--color-hairline)";

                    // Highlight selected district
                    const isSelected = selectedDistrictId && data?.districtId === selectedDistrictId;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke={isSelected ? "var(--color-ink)" : "var(--color-paper)"}
                        strokeWidth={isSelected ? 2.5 / stateMeta.zoom : 0.5 / stateMeta.zoom}
                        className="cursor-pointer outline-none transition-all duration-200"
                        style={{
                          default: { fill: fillColor, outline: "none" },
                          hover: {
                            fill: fillColor,
                            outline: "none",
                            filter: "brightness(0.95)",
                            stroke: "var(--color-ink)",
                            strokeWidth: 1.5 / stateMeta.zoom,
                          },
                          pressed: {
                            fill: fillColor,
                            outline: "none",
                            filter: "brightness(0.9)",
                          },
                        }}
                        onMouseEnter={(e: React.SyntheticEvent) =>
                          handleMouseEnter(
                            geo,
                            e as unknown as React.MouseEvent
                          )
                        }
                        onMouseMove={(e: React.SyntheticEvent) =>
                          handleMouseMove(e as unknown as React.MouseEvent)
                        }
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleDistrictClick(geo)}
                      />
                    );
                  });
                }}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Right Column: Data Panel */}
        <div className="flex flex-col border border-hairline bg-paper p-6 h-full min-h-[600px] overflow-y-auto">
          {districtData ? (
            // District Data View
            <>
              <button
                onClick={goBackToState}
                className="mb-6 self-start text-xs font-bold uppercase tracking-wider text-muted hover:text-ink transition-colors flex items-center gap-1"
              >
                <span>←</span> Back to {stateClimate.stateName} Average
              </button>
              
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  District
                </p>
                <h3 className="mt-1 text-3xl font-bold text-ink">
                  {districtData.districtName}
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
                        {districtData.index.toFixed(2)}
                      </span>
                      <span
                        className={`text-2xl font-bold ${
                          districtData.trend === "up"
                            ? "text-[#7B241C]"
                            : "text-muted"
                        }`}
                      >
                        {TREND_ARROWS[districtData.trend]}
                      </span>
                    </div>
                  </div>
                  {districtData.isCoastal && (
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
                    data={districtData.history}
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
                    value={districtData.components.highTemp}
                    icon="🌡️"
                    description="Frequency of extreme high temperature days"
                  />
                  <ComponentGauge
                    label="Low Temperature"
                    value={districtData.components.lowTemp}
                    icon="❄️"
                    description="Frequency of extreme low temperature days"
                  />
                  <ComponentGauge
                    label="Heavy Rainfall"
                    value={districtData.components.heavyRain}
                    icon="🌧️"
                    description="Maximum 5-day rainfall intensity"
                  />
                  <ComponentGauge
                    label="Drought"
                    value={districtData.components.drought}
                    icon="☀️"
                    description="Consecutive dry days"
                  />
                  <ComponentGauge
                    label="High Wind"
                    value={districtData.components.highWind}
                    icon="💨"
                    description="Frequency of extreme high wind events"
                  />
                  {districtData.isCoastal &&
                    districtData.components.seaLevel !== null && (
                      <ComponentGauge
                        label="Coastal Flooding / Sea Level"
                        value={districtData.components.seaLevel}
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
                  {getInterpretation(districtData.districtName, districtData.trend, districtData.components.highTemp, districtData.components.drought, districtData.components.heavyRain)}
                </p>
              </div>
            </>
          ) : (
            // State Data View
            <>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  State / Union Territory
                </p>
                <h3 className="mt-1 text-3xl font-bold text-ink">
                  {stateClimate.stateName}
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
                        {stateClimate.index.toFixed(2)}
                      </span>
                      <span
                        className={`text-2xl font-bold ${
                          stateClimate.trend === "up"
                            ? "text-[#7B241C]"
                            : "text-muted"
                        }`}
                      >
                        {TREND_ARROWS[stateClimate.trend]}
                      </span>
                    </div>
                  </div>
                  {stateMeta.isCoastal && (
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
                    data={stateClimate.history}
                    color="var(--color-ink)"
                    height={120}
                    showAxes
                  />
                </div>
              </div>

              {/* Component breakdown */}
              <div className="mb-8">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">
                  Statewide Averages
                </p>
                <div className="space-y-4">
                  <ComponentGauge
                    label="High Temperature"
                    value={stateClimate.components.highTemp}
                    icon="🌡️"
                    description="Avg frequency of extreme heat across districts"
                  />
                  <ComponentGauge
                    label="Low Temperature"
                    value={stateClimate.components.lowTemp}
                    icon="❄️"
                    description="Avg frequency of extreme cold across districts"
                  />
                  <ComponentGauge
                    label="Heavy Rainfall"
                    value={stateClimate.components.heavyRain}
                    icon="🌧️"
                    description="Avg maximum 5-day rainfall intensity"
                  />
                  <ComponentGauge
                    label="Drought"
                    value={stateClimate.components.drought}
                    icon="☀️"
                    description="Avg consecutive dry days"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-none border border-hairline bg-paper px-4 py-3"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 20,
          }}
        >
          <div className="text-sm font-bold text-ink">
            {tooltip.name}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="text-lg font-bold"
              style={{ color: getColor(tooltip.index) }}
            >
              {tooltip.index.toFixed(2)}
            </span>
            <span
              className={`text-sm font-bold ${
                tooltip.trend === "up"
                  ? "text-[#7B241C]"
                  : "text-muted"
              }`}
            >
              {TREND_ARROWS[tooltip.trend]}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted">Click to view district details</div>
        </div>
      )}
    </div>
  );
});

export default StateDrilldown;
