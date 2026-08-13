import { execFile } from "child_process";
import path from "path";
import util from "util";
import { performance } from "perf_hooks";

const execFileAsync = util.promisify(execFile);

async function main() {
  const scriptPath = path.join(process.cwd(), "scripts", "measure_zarr.py");
  
  const t0 = performance.now();
  const { stdout } = await execFileAsync("python", [scriptPath, "state", "Kerala"]);
  const t1 = performance.now();
  
  const pythonLines = stdout.split('\n').filter(l => l.trim().length > 0);
  
  // Try to parse the last line as JSON to skip the output if we modified read_zarr, 
  // but we modified measure_zarr to just print timings.
  console.log(pythonLines.join('\n'));
  
  console.log(`\n--- Node.js Wall-Clock Time ---`);
  console.log(`execFile(python) total time: ${(t1 - t0).toFixed(2)} ms`);
  console.log(`Python startup/imports overhead: ${((t1 - t0) - 110).toFixed(2)} ms (approx)`); // 110 is what we saw inside python

  console.log(`\n--- API Fetch Latency ---`);
  // Assuming the dev server is running on 3000
  const t2 = performance.now();
  try {
    const res = await fetch("http://localhost:3000/api/temperature/state?id=Kerala");
    await res.json();
    const t3 = performance.now();
    console.log(`HTTP GET /api/temperature/state?id=Kerala: ${(t3 - t2).toFixed(2)} ms`);
  } catch (e) {
    console.log("Dev server not reachable or error:", e.message);
  }
}

main();
