import pandas as pd
import json
import re
import zarr

def simplify(text):
    t = str(text).lower().replace("&", "and")
    return re.sub(r'[^a-z0-9]', '', t)

def convert_cw(level):
    store = zarr.open(f"C:/IACI-data_transformation/derived/temperature/spatial/temperature_{level}.zarr", mode='r')
    regions = list(store['region_id'][:])
    
    # Create mapping from region_id to index
    r_idx_map = {r: i for i, r in enumerate(regions)}

    if level == "india":
        result = {"INDIA": 0, "india": 0}
    else:
        cw_path = f"C:/IACI-data_transformation/derived/temperature/spatial/crosswalks/temperature_{level}_crosswalk.parquet"
        cw = pd.read_parquet(cw_path)
        mapping = cw[['region_id', 'region_name']].drop_duplicates()
        
        result = {}
        for _, row in mapping.iterrows():
            name = row['region_name']
            r_id = row['region_id']
            if r_id not in r_idx_map:
                continue
            idx = r_idx_map[r_id]
            
            simple = simplify(name)
            result[name] = idx
            result[name.upper()] = idx
            result[name.lower()] = idx
            result[simple] = idx
            
    out_path = f"c:/climate-index/src/lib/crosswalk_{level}.json"
    with open(out_path, 'w') as f:
        json.dump(result, f)
    print(f"Exported {level} crosswalk to {out_path}")

if __name__ == '__main__':
    convert_cw("india")
    convert_cw("state")
    convert_cw("district")
    
    # Also dump years
    store = zarr.open("C:/IACI-data_transformation/derived/temperature/spatial/temperature_india.zarr", mode='r')
    years = list(int(y) for y in store['year'][:])
    with open("c:/climate-index/src/lib/years.json", "w") as f:
        json.dump(years, f)
