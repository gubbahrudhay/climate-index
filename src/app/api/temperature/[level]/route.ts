import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { decompress } from "fzstd";
import path from "path";
import indiaCw from "../../../../lib/crosswalk_india.json";
import stateCw from "../../../../lib/crosswalk_state.json";
import districtCw from "../../../../lib/crosswalk_district.json";
import yearsData from "../../../../lib/years.json";

const CROSSWALKS: Record<string, Record<string, number>> = {
  india: indiaCw,
  state: stateCw,
  district: districtCw
};

const BASE_PATH = process.env.ZARR_DATA_DIR || path.join(process.cwd(), 'data', 'temperature', 'spatial');

const META = {
  india: {
    shape: [36, 12, 1],
    chunks: [36, 12, 1]
  },
  state: {
    shape: [36, 12, 36],
    chunks: [36, 12, 36]
  },
  district: {
    shape: [36, 12, 782],
    chunks: [18, 6, 391]
  }
};

// Simple module-level cache for chunk buffers (optional but speeds up same-chunk requests)
const chunkCache = new Map<string, Float64Array>();

function getCacheKey(level: string, arrayName: string, x: number, y: number, z: number) {
  return `${level}:${arrayName}:${x}:${y}:${z}`;
}

async function getZarrSlice(level: 'india' | 'state' | 'district', arrayName: string, r_idx: number): Promise<(number | null)[][]> {
  const meta = META[level];
  const [cy, cm, cr] = meta.chunks;
  const [sy, sm, sr] = meta.shape;

  const result: (number | null)[][] = Array.from({ length: sy }, () => Array(sm).fill(null));

  const z = Math.floor(r_idx / cr);
  const local_z = r_idx % cr;

  const num_chunks_y = Math.ceil(sy / cy);
  const num_chunks_m = Math.ceil(sm / cm);

  for (let x = 0; x < num_chunks_y; x++) {
    for (let y = 0; y < num_chunks_m; y++) {
      const cacheKey = getCacheKey(level, arrayName, x, y, z);
      let chunkData = chunkCache.get(cacheKey) || null;

      if (!chunkData) {
        const chunkPath = path.join(BASE_PATH, `temperature_${level}.zarr`, arrayName, "c", String(x), String(y), String(z));
        try {
          const buf = await fs.readFile(chunkPath);
          const uncompressed = decompress(new Uint8Array(buf));
          const alignedBuf = uncompressed.buffer.slice(uncompressed.byteOffset, uncompressed.byteOffset + uncompressed.byteLength);
          chunkData = new Float64Array(alignedBuf);
          chunkCache.set(cacheKey, chunkData);
        } catch (e: any) {
          if (e.code !== 'ENOENT') throw e;
        }
      }

      for (let i = 0; i < cy; i++) {
        const global_y = x * cy + i;
        if (global_y >= sy) break;

        for (let j = 0; j < cm; j++) {
          const global_m = y * cm + j;
          if (global_m >= sm) break;

          if (chunkData) {
            const idx = i * (cm * cr) + j * cr + local_z;
            let val: number | null = chunkData[idx];
            if (Number.isNaN(val)) val = null;
            result[global_y][global_m] = val;
          }
        }
      }
    }
  }

  return result;
}

function simplify(text: string) {
  let t = text.toLowerCase().replace(/&/g, "and");
  return t.replace(/[^a-z0-9]/g, "");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  const { level } = await params;
  
  if (level !== "india" && level !== "state" && level !== "district") {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  let id = searchParams.get("id");

  if (level !== "india" && !id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }
  
  if (level === "india") {
    id = "india";
  }

  try {
    const cw = CROSSWALKS[level];
    
    // exact match
    let r_idx = cw[id as string];
    if (r_idx === undefined) {
      // simple match
      r_idx = cw[simplify(id as string)];
    }

    if (r_idx === undefined) {
      return NextResponse.json({ error: `Region '${id}' not found in ${level} crosswalk` }, { status: 404 });
    }

    const [t90, t10, t90s, t10s] = await Promise.all([
      getZarrSlice(level, "T90", r_idx),
      getZarrSlice(level, "T10", r_idx),
      getZarrSlice(level, "T90S", r_idx),
      getZarrSlice(level, "T10S", r_idx)
    ]);

    const result = {
      years: yearsData,
      T90: t90,
      T10: t10,
      T90S: t90s,
      T10S: t10s,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Zarr read error:", error);
    return NextResponse.json(
      { error: "Failed to read temperature data", details: String(error) },
      { status: 500 }
    );
  }
}
