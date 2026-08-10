"use client";

import React, { useRef, memo, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import IndiaMap from "./IndiaMap";
import StateDrilldown from "./StateDrilldown";
import DistrictPanel from "./DistrictPanel";
import { useClimateStore } from "@/lib/store";
import { getBucketLabels } from "@/lib/colorScale";

const IndiaMapAssembling = memo(function IndiaMapAssembling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const drillLevel = useClimateStore((s) => s.drillLevel);
  const buckets = getBucketLabels();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: mapSectionRef,
    offset: ["start start", "end end"],
  });

  // Use an exponential curve so the zoom speed feels constant.
  // v goes 0 -> 1. Math.pow(0.01, v) goes 1 -> 0.01.
  // 100 * 1 = 100 (start scale). 100 * 0.01 = 1 (end scale).
  const scale = useTransform(scrollYProgress, (v) => 100 * Math.pow(0.01, v));
  
  // Disable pointer events on the map until scroll is close to 1 (fully zoomed out)
  const pointerEvents = useTransform(scrollYProgress, (v) => 
    v > 0.95 ? "auto" : "none"
  );

  return (
    <div ref={containerRef}>
      {/* Scroll spacer + animated section */}
      <div
        ref={mapSectionRef}
        className="relative"
        id="map-section"
        style={{ minHeight: "250vh" }}
      >
        {/* Sticky container that holds the map */}
        <div
          className="sticky top-0 flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8"
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
            className="relative mx-auto w-full max-w-2xl origin-center"
            style={{ 
              scale: mounted && drillLevel === "national" ? scale : 1,
              pointerEvents: mounted && drillLevel === "national" ? pointerEvents as any : "auto" 
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

      {/* District detail panel */}
      <DistrictPanel />
    </div>
  );
});

export default IndiaMapAssembling;
