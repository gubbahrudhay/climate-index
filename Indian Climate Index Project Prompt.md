# Project Build Prompt: "Indian Climate Index" — Next.js Web App



## 1. What we're building

An interactive, scroll-driven website called the **Indian Climate Index (ICI)** — inspired in concept by the [Actuaries Climate Index](https://actuariesclimateindex.org/home/) and its [graphs & data view](https://www.actuaries.asn.au/climate-index/graphs-data), but reimagined for India, state-by-state and district-by-district.

Use **placeholder / fake data** for now — the real data source and methodology will be provided later. Build the full data layer so it's trivial to swap fake data for real data later (see Section 6).

## 2. User flow (in order)

1. **Landing / Hero section (first thing visible, no scroll needed)**
   - Immediately explains: "What is the Indian Climate Index?"
   - 1 headline, 2-3 sentence description (fake/placeholder copy is fine, but write it like real explanatory copy — e.g. "The Indian Climate Index tracks the frequency of extreme heat, rainfall, drought, and wind events across India's states and districts, relative to a historical baseline.")
   - Show a big animated national index number (fake, e.g. "1.42") with an up/down trend arrow and a one-line "what does this number mean" caption.
   - A subtle scroll-down affordance ("Scroll to explore the map ↓").

2. **Scroll-triggered India map assembly**
   - As the user scrolls into the next section, the outline of India's states should animate from a "scattered / exploded" state into their correct assembled positions, forming a complete India map (like puzzle pieces flying into place). Use scroll position to drive the animation progress (scrubbed, not autoplay) — i.e., scrolling back up reverses it.
   - Once assembled, states are static and interactive.

3. **State interaction**
   - Each state on the map is colored using a choropleth scale based on its fake climate index value (e.g. green → yellow → red).
   - Hover: tooltip with state name + index value.
   - Click a state: the state visually **expands/zooms in** (smooth camera/zoom transition, not a hard cut) and reveals its **districts** as a sub-map, each district also choropleth-colored by its own fake index value.
   - A "← Back to India" control to zoom back out.

4. **District interaction**
   - Click a district: open a detail panel (side drawer or modal) showing:
     - District name, state name
     - Overall climate index value + trend sparkline (fake time series, e.g. 1990–2025)
     - Breakdown into sub-components (mirroring ACI-style components, renamed for India context), each as a small bar/gauge:
       - High Temperature Frequency
       - Low Temperature Frequency
       - Heavy Rainfall (max 5-day rainfall)
       - Drought (consecutive dry days)
       - High Wind Frequency
       - Coastal Flooding / Sea Level (only shown for coastal districts)
     - A short plain-language interpretation line, e.g. "This district has seen a rising trend in extreme heat days over the last decade."

5. **Footer**: methodology note placeholder ("Data shown is illustrative placeholder data — real methodology and sources to be added"), and links area.

## 3. Tech stack

- **Framework:** Next.js (App Router, latest stable), TypeScript
- **Styling:** Tailwind CSS
- **Animation / scroll-scrubbing:** Framer Motion (`useScroll`, `useTransform`) — or GSAP + ScrollTrigger if Framer Motion can't cleanly do the scroll-scrubbed "pieces assembling" effect
- **Map rendering:** SVG-based map using `react-simple-maps` (D3 under the hood) with a **TopoJSON of Indian states**, and a second TopoJSON of **districts** for the selected state (load per-state district files lazily so the whole country's district data isn't loaded at once)
- **Charts (sparklines, bar/gauge components):** Recharts
- **State management:** React Context or Zustand for "selected state / selected district / drill-down level"
- **Data:** local static JSON fake dataset (Section 6) — structured so it can later be swapped for an API route or database without touching UI components

## 4. Map data sourcing (India)

- India states TopoJSON/GeoJSON: use a public source such as the `india-maps` / `datameet` GitHub repositories, or `react-simple-maps` community India topology. Fetch a set of state boundaries with standard state names matching Census of India naming.
- District boundaries: same DataMeet-style GitHub sources have district-level shapefiles/geojson convertible to topojson (e.g. datameet/maps repo). Convert with `mapshaper` to topojson at build time and store under `/public/geo/states.json` and `/public/geo/districts/<state-slug>.json`.
- Note to the coding tool: if it cannot fetch real geo files (no internet access), stub with a simplified placeholder polygon set for 3-4 states so the interaction pattern can be built and tested, and leave a clear `TODO: replace with real TopoJSON` comment plus a `scripts/fetch-geo-data.md` note on where to get the real files.

## 5. Visual/interaction details

- Choropleth scale: 5 buckets, colorblind-safe sequential palette (e.g. `#2ecc71 → #f1c40f → #e67e22 → #e74c3c → #922b21`).
- Assemble-on-scroll animation: each state SVG path/group starts at a random offset position + slight rotation + 0 opacity, and animates to `x:0, y:0, rotate:0, opacity:1` as scroll progress for that section goes 0→1. Stagger by a small delay per state (e.g. index * 0.02s) so it doesn't feel like everything snaps at once.
- Zoom into a state: animate `viewBox` or use a `scale()+translate()` transform on the SVG group, ~500-700ms ease.
- District panel: slide-in drawer from the right on desktop, bottom sheet on mobile.
- Fully responsive: on mobile, the map should still be pannable/zoomable (pinch or buttons) since districts can be small.

## 6. Fake data structure

Create a typed fake dataset now, matching this shape so real data drops in later with no component changes:

```ts
// types/climate.ts
export interface ComponentScore {
  highTemp: number;      // standardized anomaly, e.g. -3 to +3
  lowTemp: number;
  heavyRain: number;
  drought: number;
  highWind: number;
  seaLevel: number | null; // null for non-coastal districts
}

export interface TimeSeriesPoint {
  year: number;
  index: number;
}

export interface DistrictClimate {
  districtId: string;
  districtName: string;
  stateId: string;
  index: number;             // current composite index
  trend: "up" | "down" | "flat";
  components: ComponentScore;
  history: TimeSeriesPoint[]; // e.g. 1990-2025
  isCoastal: boolean;
}

export interface StateClimate {
  stateId: string;
  stateName: string;
  index: number;              // aggregate of its districts
  trend: "up" | "down" | "flat";
  districts: string[];        // districtIds
}
```

Write a small deterministic fake-data generator (`lib/fakeData.ts`) seeded by state/district name (so numbers don't change on every reload) rather than pure `Math.random()` — use a simple string-hash seed into a PRNG (e.g. `mulberry32`).

## 7. Suggested project structure

```
app/
  page.tsx                -> Hero + scroll map sections
  layout.tsx
components/
  Hero.tsx
  IndiaMapAssembling.tsx  -> scroll-scrubbed assembly + choropleth India map
  StateDrilldown.tsx      -> zoomed state + district choropleth
  DistrictPanel.tsx       -> drawer/modal with breakdown charts
  ComponentGauge.tsx
  TrendSparkline.tsx
lib/
  fakeData.ts
  colorScale.ts
types/
  climate.ts
public/
  geo/
    states.json
    districts/<state-slug>.json
```

## 8. Explicit build order (do this incrementally, don't try to do it all at once)

1. Scaffold Next.js + Tailwind project.
2. Build fake data generator + types.
3. Build static (non-animated) India choropleth map from TopoJSON with hover tooltip.
4. Add click-to-zoom into a state showing its districts.
5. Add district click → detail drawer with fake breakdown + sparkline.
6. Add the Hero section with the explanatory copy + big index number.
7. Add the scroll-scrubbed "assemble" animation as the final polish step.
8. Responsive pass (mobile map interaction).

## 9. What NOT to do

- Don't hardcode real climate figures — it's explicitly fake/placeholder data until real methodology is supplied.
- Don't block the whole app on loading all district files upfront — lazy load per state.
- Don't skip the deterministic-seed requirement for fake data; flickering random numbers on every re-render will make the demo look broken.

---

**Reference for concept/terminology only (not for data or design copying):**
- https://actuariesclimateindex.org/home/
- https://www.actuaries.asn.au/climate-index/graphs-data
