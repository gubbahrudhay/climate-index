import fs from "fs/promises";
import { decompress } from "fzstd";
import path from "path";

const BASE_PATH = "C:/IACI-data_transformation/derived/temperature/spatial";

export async function readZarrChunk(level, arrayName, cx, cy, cz) {
    const chunkPath = path.join(BASE_PATH, `temperature_${level}.zarr`, arrayName, "c", String(cx), String(cy), String(cz));
    try {
        const buf = await fs.readFile(chunkPath);
        const uncompressed = decompress(new Uint8Array(buf));
        const alignedBuf = uncompressed.buffer.slice(uncompressed.byteOffset, uncompressed.byteOffset + uncompressed.byteLength);
        return new Float64Array(alignedBuf);
    } catch (e) {
        if (e.code === 'ENOENT') {
            return null;
        }
        throw e;
    }
}

async function test() {
    // Kerala r_idx is 16
    const r_idx = 16;
    const data = await readZarrChunk("state", "T90S", 0, 0, 0);
    // state chunk shape is [36, 12, 36]
    // index = year * (12 * 36) + month * (36) + r_idx
    // Let's print year 0, month 0 for kerala
    console.log("Kerala Y0 M0:", data[0 * 12 * 36 + 0 * 36 + r_idx]);
}
test();
