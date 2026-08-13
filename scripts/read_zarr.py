import zarr
import json
import sys
import pandas as pd
import math
import re

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
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing args"}))
        return

    level = sys.argv[1] # "india", "state", "district"
    region_name = sys.argv[2]
    
    path = f"C:/IACI-data_transformation/derived/temperature/spatial/temperature_{level}.zarr"
    cw_path = f"C:/IACI-data_transformation/derived/temperature/spatial/crosswalks/temperature_{level}_crosswalk.parquet"
    
    try:
        store = zarr.open(path, mode='r')
        years = store['year'][:]
        
        if level == "india":
            r_idx = 0
        else:
            cw = pd.read_parquet(cw_path)
            mapping = cw[['region_id', 'region_name']].drop_duplicates()
            
            # Exact case-insensitive match
            row = mapping[mapping['region_name'].str.upper() == region_name.upper()]
            
            # Simplified match if not found
            if len(row) == 0:
                mapping['simple'] = mapping['region_name'].apply(simplify)
                row = mapping[mapping['simple'] == simplify(region_name)]
                
            if len(row) == 0:
                print(json.dumps({"error": f"Region '{region_name}' not found in {level} crosswalk"}))
                return
            
            region_id = row.iloc[0]['region_id']
            regions = list(store['region_id'][:])
            if region_id not in regions:
                print(json.dumps({"error": f"Region ID {region_id} not found in {level} zarr"}))
                return
            r_idx = regions.index(region_id)
            
        t90s = replace_nan(store['T90S'][:, :, r_idx].tolist())
        t10s = replace_nan(store['T10S'][:, :, r_idx].tolist())
        t90 = replace_nan(store['T90'][:, :, r_idx].tolist())
        t10 = replace_nan(store['T10'][:, :, r_idx].tolist())
        
        result = {
            "years": years.tolist(),
            "T90": t90,
            "T10": t10,
            "T90S": t90s,
            "T10S": t10s,
        }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
