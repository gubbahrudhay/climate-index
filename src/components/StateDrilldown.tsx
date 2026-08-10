"use client";

import React, { useState, useCallback, useEffect, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  GeographyShape,
  ZoomableGroup,
} from "react-simple-maps";
import { getDistrictsForState, getStateClimate } from "@/lib/fakeData";
import { getColor } from "@/lib/colorScale";
import { getDistrictGeoUrl } from "@/lib/geoUtils";
import { useClimateStore } from "@/lib/store";
import { DistrictClimate } from "@/types/climate";

interface TooltipState {
  x: number;
  y: number;
  name: string;
  index: number;
  trend: "up" | "down" | "flat";
}

const TREND_ARROWS: Record<string, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

const StateDrilldown = memo(function StateDrilldown() {
  const selectedStateId = useClimateStore((s) => s.selectedStateId);
  const selectDistrict = useClimateStore((s) => s.selectDistrict);
  const goBackToNational = useClimateStore((s) => s.goBackToNational);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get state info
  const stateClimate = selectedStateId
    ? getStateClimate(selectedStateId)
    : null;
  const districts = selectedStateId
    ? getDistrictsForState(selectedStateId)
    : [];

  // Build a lookup by district name (normalized)
  const districtMap = new Map<string, DistrictClimate>();
  districts.forEach((d) => {
    districtMap.set(d.districtName.toLowerCase(), d);
  });

  const geoUrl = selectedStateId
    ? getDistrictGeoUrl(selectedStateId)
    : "";

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
      const data = findDistrictData(geo.properties.district || "");
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        name: geo.properties.district || "",
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
      const data = findDistrictData(geo.properties.district || "");
      if (data) {
        selectDistrict(data.districtId);
      }
    },
    [findDistrictData, selectDistrict]
  );

  if (!selectedStateId || !stateClimate) return null;

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
        className="group absolute left-4 top-4 z-20 flex items-center gap-2 border border-hairline bg-paper px-4 py-2 text-sm font-bold text-ink transition-all hover:bg-hairline"
        id="back-to-india-btn"
      >
        <span className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        Back to India
      </button>

      {/* State title */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-ink">
          {stateClimate.stateName}
        </h2>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span
            className="text-lg font-bold"
            style={{ color: getColor(stateClimate.index) }}
          >
            Climate Index: {stateClimate.index.toFixed(2)}
          </span>
          <span
            className={`text-sm font-bold ${
              stateClimate.trend === "up"
                ? "text-[#7B241C]"
                : "text-muted"
            }`}
          >
            {TREND_ARROWS[stateClimate.trend]}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-muted">
          Click a district to see detailed breakdown
        </p>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 3500,
        }}
        width={800}
        height={700}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const data = findDistrictData(
                  geo.properties.district || ""
                );
                const fillColor = data
                  ? getColor(data.index)
                  : "var(--color-hairline)";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="var(--color-paper)"
                    strokeWidth={0.3}
                    className="cursor-pointer outline-none transition-all duration-200"
                    style={{
                      default: { fill: fillColor, outline: "none" },
                      hover: {
                        fill: fillColor,
                        outline: "none",
                        filter: "brightness(0.95)",
                        stroke: "var(--color-ink)",
                        strokeWidth: 1,
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
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

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
        </div>
      )}
    </div>
  );
});

export default StateDrilldown;
