"use client";

import React, { useState, useCallback, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  GeographyShape,
  ZoomableGroup,
} from "react-simple-maps";
import { getStatesClimate } from "@/lib/fakeData";
import { getColor } from "@/lib/colorScale";
import {
  stateNameToSlug,
  INDIA_STATES_GEO_URL,
  INDIA_TOPO_OBJECT_STATES,
} from "@/lib/geoUtils";
import { useClimateStore } from "@/lib/store";
import { StateClimate } from "@/types/climate";

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

const IndiaMap = memo(function IndiaMap() {
  const selectState = useClimateStore((s) => s.selectState);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const statesData = getStatesClimate();
  const stateMap = new Map<string, StateClimate>();
  statesData.forEach((s) => stateMap.set(s.stateId, s));

  const handleMouseEnter = useCallback(
    (
      geo: GeographyShape,
      event: React.MouseEvent
    ) => {
      const slug = stateNameToSlug(geo.properties.STATE || "");
      const data = stateMap.get(slug);
      if (data) {
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          name: geo.properties.STATE || "",
          index: data.index,
          trend: data.trend,
        });
      }
    },
    // stateMap is stable since statesData is deterministic
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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

  const handleClick = useCallback(
    (geo: GeographyShape) => {
      const slug = stateNameToSlug(geo.properties.STATE || "");
      selectState(slug);
    },
    [selectState]
  );

  return (
    <div className="relative w-full" id="india-map-container">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1000,
          center: [82, 22],
        }}
        width={800}
        height={900}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup>
          <Geographies
            geography={INDIA_STATES_GEO_URL}
            parseGeographies={(geos) => {
              // Filter to only state-level geometries
              return geos;
            }}
          >
            {({ geographies }) => {
              // The state map has only states
              const finalGeos = geographies;

              return finalGeos.map((geo) => {
                const slug = stateNameToSlug(geo.properties.STATE);
                const data = stateMap.get(slug);
                const fillColor = data
                  ? getColor(data.index)
                  : "var(--color-hairline)";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="var(--color-paper)"
                    strokeWidth={0.5}
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
                      handleMouseEnter(geo, e as unknown as React.MouseEvent)
                    }
                    onMouseMove={(e: React.SyntheticEvent) =>
                      handleMouseMove(e as unknown as React.MouseEvent)
                    }
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(geo)}
                  />
                );
              });
            }}
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

export default IndiaMap;
