import * as zarr from "@zarrita/core";
import { FileSystemStore } from "@zarrita/storage";
import fs from "fs/promises";
import { decompress } from "fzstd";
import path from "path";

// Add fzstd compressor registry
zarr.registry.set("zstd", () => {
    return {
        decode(chunk) {
            return decompress(new Uint8Array(chunk));
        }
    };
});

async function main() {
    const store = new FileSystemStore("C:/IACI-data_transformation/derived/temperature/spatial/temperature_state.zarr");
    
    // Open the zarr group/array
    try {
        const t90sArray = await zarr.get(store, { path: "T90S" });
        console.log("Shape:", t90sArray.shape);
        
        // Read region array to find r_idx
        const regionsArray = await zarr.get(store, { path: "region_id" });
        const regionsChunk = await zarr.get(regionsArray); // reads entire 1D array
        const regions = Array.from(regionsChunk.data);
        console.log("Regions[0]:", regions[0]);
        
        // find index
        const r_idx = regions.indexOf("IN.KL"); // Kerala
        console.log("Kerala r_idx:", r_idx);
        
        // Slice: store['T90S'][:, :, r_idx]
        const t90sSlice = await zarr.get(t90sArray, [null, null, r_idx]);
        console.log("T90S shape after slice:", t90sSlice.shape);
        // It should be [37, 12] flat data array
        console.log("T90S data length:", t90sSlice.data.length);
        
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
