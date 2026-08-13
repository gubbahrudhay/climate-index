import zarr
import json
import sys
import pandas as pd
import math
import re
import time

def replace_nan(obj):
    if isinstance(obj, float):
        if math.isnan(obj):
            return None
        return obj
    elif isinstance(obj, list):
        return [replace_nan(item) for item in obj]
    return obj

def simplify(text):
    t = str(text).lower().replace("&", "and")
    return re.sub(r'[^a-z0-9]', '', t)

def main():
    t0 = time.time()
    level = "state"
    region_name = "Kerala"
    
    path = f"C:/IACI-data_transformation/derived/temperature/spatial/temperature_{level}.zarr"
    cw_path = f"C:/IACI-data_transformation/derived/temperature/spatial/crosswalks/temperature_{level}_crosswalk.parquet"
    
    t1 = time.time()
    store = zarr.open(path, mode='r')
    years = store['year'][:]
    
    t2 = time.time()
    cw = pd.read_parquet(cw_path)
    mapping = cw[['region_id', 'region_name']].drop_duplicates()
    row = mapping[mapping['region_name'].str.upper() == region_name.upper()]
    if len(row) == 0:
        mapping['simple'] = mapping['region_name'].apply(simplify)
        row = mapping[mapping['simple'] == simplify(region_name)]
    
    region_id = row.iloc[0]['region_id']
    regions = list(store['region_id'][:])
    r_idx = regions.index(region_id)
    
    t3 = time.time()
    t90s = replace_nan(store['T90S'][:, :, r_idx].tolist())
    t10s = replace_nan(store['T10S'][:, :, r_idx].tolist())
    t90 = replace_nan(store['T90'][:, :, r_idx].tolist())
    t10 = replace_nan(store['T10'][:, :, r_idx].tolist())
    
    t4 = time.time()
    result = {
        "years": years.tolist(),
        "T90": t90,
        "T10": t10,
        "T90S": t90s,
        "T10S": t10s,
    }
    out = json.dumps(result)
    t5 = time.time()

    print(f"Python Startup & Imports: {(t0 - getattr(time, 'start_time', t0)) * 1000:.2f} ms") # Need to pass from JS to get true startup
    print(f"Setup vars: {(t1 - t0) * 1000:.2f} ms")
    print(f"Zarr open & read year: {(t2 - t1) * 1000:.2f} ms")
    print(f"Parquet read & filter: {(t3 - t2) * 1000:.2f} ms")
    print(f"Zarr slice & replace_nan: {(t4 - t3) * 1000:.2f} ms")
    print(f"JSON dumps: {(t5 - t4) * 1000:.2f} ms")
    print(f"Total Python Script Time: {(t5 - t0) * 1000:.2f} ms")

if __name__ == "__main__":
    main()
