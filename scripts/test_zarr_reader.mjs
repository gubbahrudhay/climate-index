import fs from 'fs/promises';
import { decompress } from 'fzstd';
import path from 'path';

const BASE_PATH = 'C:/IACI-data_transformation/derived/temperature/spatial';

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

export async function getZarrSlice(level, arrayName, r_idx) {
  const meta = META[level];
  const [cy, cm, cr] = meta.chunks;
  const [sy, sm, sr] = meta.shape;

  const result = Array.from({ length: sy }, () => Array(sm).fill(null));

  const z = Math.floor(r_idx / cr);
  const local_z = r_idx % cr;

  const num_chunks_y = Math.ceil(sy / cy);
  const num_chunks_m = Math.ceil(sm / cm);

  for (let x = 0; x < num_chunks_y; x++) {
    for (let y = 0; y < num_chunks_m; y++) {
      const chunkPath = path.join(BASE_PATH, `temperature_${level}.zarr`, arrayName, "c", String(x), String(y), String(z));
      
      let chunkData = null;
      try {
        const buf = await fs.readFile(chunkPath);
        const uncompressed = decompress(new Uint8Array(buf));
        const alignedBuf = uncompressed.buffer.slice(uncompressed.byteOffset, uncompressed.byteOffset + uncompressed.byteLength);
        chunkData = new Float64Array(alignedBuf);
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }

      for (let i = 0; i < cy; i++) {
        const global_y = x * cy + i;
        if (global_y >= sy) break;

        for (let j = 0; j < cm; j++) {
          const global_m = y * cm + j;
          if (global_m >= sm) break;

          if (chunkData) {
            const idx = i * (cm * cr) + j * cr + local_z;
            let val = chunkData[idx];
            if (Number.isNaN(val)) val = null;
            result[global_y][global_m] = val;
          }
        }
      }
    }
  }

  return result;
}

async function test() {
    const t0 = performance.now();
    const data = await getZarrSlice('district', 'T90S', 780);
    const t1 = performance.now();
    console.log(data[0]);
    console.log(`Time: ${(t1 - t0).toFixed(2)} ms`);
}
test();
