"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import IndiaMap from "./IndiaMap";
import StateDrilldown from "./StateDrilldown";
import { useClimateStore } from "@/lib/store";
import { getBucketLabels } from "@/lib/colorScale";

const IndiaMapAssembling = memo(function IndiaMapAssembling() {
  const drillLevel = useClimateStore((s) => s.drillLevel);
  const buckets = getBucketLabels();

  return (
    <div>
      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8"
        id="map-section"
      >
          {/* Section header */}
          <div className="mb-8 text-center z-10 relative">
            <h2 className="text-3xl font-bold text-ink md:text-4xl">
              {drillLevel === "national"
                ? "Explore Climate Data Across India"
                : "District-Level Analysis"}
            </h2>
            <p className="mt-3 text-sm font-medium text-muted">
              {drillLevel === "national"
                ? "Click any state to explore its districts"
                : "Click a district for detailed breakdown"}
            </p>
          </div>

          {/* Map container with Framer Motion scale */}
          <motion.div 
            className={`relative mx-auto w-full origin-center transition-[max-width] duration-700 ${
              drillLevel === "national" ? "max-w-2xl" : "max-w-5xl"
            }`}
            style={{ 
              pointerEvents: "auto" 
            }}
          >
            {drillLevel === "national" ? (
              <IndiaMap />
            ) : (
              <StateDrilldown />
            )}
          </motion.div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 z-10 relative">
            {buckets.map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm border border-hairline"
                  style={{ backgroundColor: b.color }}
                />
                <span className="text-xs font-medium text-muted">{b.label}</span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
});

export default IndiaMapAssembling;
