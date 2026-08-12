"use client";

import React, { useEffect, useState, memo } from "react";
import { getNationalClimate } from "@/lib/fakeData";

const Hero = memo(function Hero() {
  const national = getNationalClimate();
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Animate the index number counting up
    const target = national.index;
    const duration = 2000; // ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedIndex(target * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [national.index]);

  const trendArrow = national.trend === "up" ? "↑" : national.trend === "down" ? "↓" : "→";
  const trendColor =
    national.trend === "up"
      ? "text-[#7B241C]"
      : national.trend === "down"
      ? "text-muted"
      : "text-muted";



  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 bg-paper"
      id="hero-section"
    >
      {/* Content */}
      <div
        className={`relative z-10 w-full max-w-4xl text-center transition-all duration-1000 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />
          <span className="text-xs font-semibold tracking-wider text-muted">
            LIVE CLIMATE DATA • {national.yearRange[0]}–{national.yearRange[1]}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-ink md:text-7xl lg:text-[96px]">
          Indian Climate Index
        </h1>

        {/* Description */}
        <p className="ml-auto mr-0 mb-16 max-w-5xl text-center text-base leading-relaxed text-muted md:text-lg">
          The Indian Climate Index tracks the frequency of extreme heat,
          rainfall, drought, and wind events across India&apos;s states and
          districts, relative to a historical baseline. It provides a single,
          comparable metric to understand how climate patterns are shifting
          across the subcontinent.
        </p>

        {/* Big index number */}
        <div
          className={`mx-auto mb-20 flex flex-col items-center transition-all duration-1000 delay-300 ${
            isVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95"
          }`}
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
            National Index
          </p>
          <div className="relative flex items-center justify-center">
            <span className="text-7xl font-bold tracking-tighter text-ink md:text-[120px]">
              {animatedIndex.toFixed(2)}
            </span>
            <span className={`absolute left-full ml-4 text-4xl font-bold md:text-5xl ${trendColor}`}>
              {trendArrow}
            </span>
          </div>
          <p className="mt-4 max-w-md text-center text-sm font-medium text-muted">
            {national.index > 1.5
              ? "Elevated — climate extremes are increasing across India"
              : national.index > 0.8
              ? "Moderate — some regions show rising climate signals"
              : "Within normal range relative to historical baseline"}
          </p>
        </div>

      </div>

      {/* Scroll affordance */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-1000 delay-700 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        <button
          onClick={() => {
            document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="h-10 px-5 bg-[#112a57] hover:bg-[#0c1f40] text-white rounded-md text-sm font-medium transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
        >
          Explore the map
          <span className="text-white/70">↓</span>
        </button>
      </div>
    </section>
  );
});

export default Hero;
