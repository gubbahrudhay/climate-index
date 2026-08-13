import fs from "fs";
import { decompress } from "fzstd";

function readZarrChunk() {
  try {
    const yearPath = "C:/IACI-data_transformation/derived/temperature/spatial/temperature_india.zarr/year/c/0";
    const yearBuf = fs.readFileSync(yearPath);
    const yearUnc = decompress(new Uint8Array(yearBuf));
    // year is int64 (8 bytes). BigInt64Array
    const years = new BigInt64Array(yearUnc.buffer.slice(yearUnc.byteOffset, yearUnc.byteOffset + yearUnc.byteLength));
    console.log("Years:", Array.from(years));
    
    // Also state
    const stateYearPath = "C:/IACI-data_transformation/derived/temperature/spatial/temperature_state.zarr/year/c/0";
    const stateYearBuf = fs.readFileSync(stateYearPath);
    const stateYearUnc = decompress(new Uint8Array(stateYearBuf));
    const stateYears = new BigInt64Array(stateYearUnc.buffer.slice(stateYearUnc.byteOffset, stateYearUnc.byteOffset + stateYearUnc.byteLength));
    console.log("State Years:", Array.from(stateYears));

    // state region_id is vlen-utf8. Let's not bother. Let's assume region_id order is the same. Wait, no, region_id is string.
  } catch (e) {
    console.error("Error:", e);
  }
}

readZarrChunk();
