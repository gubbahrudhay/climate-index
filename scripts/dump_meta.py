import zarr
import json

def get_meta(level):
    path = f"C:/IACI-data_transformation/derived/temperature/spatial/temperature_{level}.zarr"
    store = zarr.open(path, mode='r')
    return {
        "shape": store['T90S'].shape,
        "chunks": store['T90S'].chunks
    }

res = {
    "india": get_meta("india"),
    "state": get_meta("state"),
    "district": get_meta("district"),
}
with open("c:/climate-index/scripts/zarr_meta.json", "w") as f:
    json.dump(res, f)
