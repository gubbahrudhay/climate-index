import pandas as pd
import json
import re

def simplify(text):
    t = str(text).lower().replace("&", "and")
    return re.sub(r'[^a-z0-9]', '', t)

def convert_cw(level):
    cw_path = f"C:/IACI-data_transformation/derived/temperature/spatial/crosswalks/temperature_{level}_crosswalk.parquet"
    cw = pd.read_parquet(cw_path)
    mapping = cw[['region_id', 'region_name']].drop_duplicates()
    
    result = {}
    for _, row in mapping.iterrows():
        name = row['region_name']
        r_id = row['region_id']
        simple = simplify(name)
        
        # We store both exact and simple as keys mapping to region_id
        result[name] = r_id
        result[name.upper()] = r_id
        result[name.lower()] = r_id
        result[simple] = r_id
        
    out_path = f"C:/IACI-data_transformation/derived/temperature/spatial/crosswalks/temperature_{level}_crosswalk.json"
    with open(out_path, 'w') as f:
        json.dump(result, f)
    print(f"Exported {level} crosswalk to {out_path}")

if __name__ == '__main__':
    convert_cw("state")
    convert_cw("district")
