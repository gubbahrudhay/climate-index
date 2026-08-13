import { performance } from "perf_hooks";

async function main() {
  console.log(`\n--- API Fetch Latency ---`);
  
  // Uncached District
  const t0 = performance.now();
  const res0 = await fetch("http://localhost:3001/api/temperature/district?id=Ernakulam");
  await res0.json();
  const t1 = performance.now();
  console.log(`Uncached District (Ernakulam): ${(t1 - t0).toFixed(2)} ms`);

  // Cached District
  const t2 = performance.now();
  const res1 = await fetch("http://localhost:3001/api/temperature/district?id=Ernakulam");
  await res1.json();
  const t3 = performance.now();
  console.log(`Cached District (Ernakulam): ${(t3 - t2).toFixed(2)} ms`);

  // Uncached State
  const t4 = performance.now();
  const res2 = await fetch("http://localhost:3001/api/temperature/state?id=Kerala");
  await res2.json();
  const t5 = performance.now();
  console.log(`Uncached State (Kerala): ${(t5 - t4).toFixed(2)} ms`);

  // Cached State
  const t6 = performance.now();
  const res3 = await fetch("http://localhost:3001/api/temperature/state?id=Kerala");
  await res3.json();
  const t7 = performance.now();
  console.log(`Cached State (Kerala): ${(t7 - t6).toFixed(2)} ms`);
}

main();
