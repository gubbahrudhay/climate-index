# Fetching Real Geo Data for Indian Climate Index

## Data Sources

### India States TopoJSON (all states boundary)
- **Source**: [udit-001/india-maps-data](https://github.com/udit-001/india-maps-data)
- **CDN URL**: `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/topojson/india.json`
- **Save to**: `public/geo/states.json`

### State District TopoJSON (per-state district boundaries)
- **Source**: Same repo, per-state files
- **CDN URL pattern**: `https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/topojson/states/<state-slug>.json`
- **Save to**: `public/geo/districts/<state-slug>.json`

## Quick Download Script

```bash
# Download India states
mkdir -p public/geo/districts
curl -o public/geo/states.json "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/topojson/india.json"

# Download district files for each state
STATES=(
  andhra-pradesh arunachal-pradesh assam bihar chhattisgarh goa gujarat
  haryana himachal-pradesh jharkhand karnataka kerala madhya-pradesh
  maharashtra manipur meghalaya mizoram nagaland odisha punjab rajasthan
  sikkim tamil-nadu telangana tripura uttar-pradesh uttarakhand west-bengal
  delhi jammu-and-kashmir ladakh puducherry chandigarh
  andaman-and-nicobar dadra-and-nagar-haveli-and-daman-and-diu lakshadweep
)

for state in "${STATES[@]}"; do
  echo "Downloading $state..."
  curl -sf -o "public/geo/districts/${state}.json" \
    "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/topojson/states/${state}.json" \
    || echo "  ⚠ Failed: $state"
done
```

## Alternative Sources

- **DataMeet**: https://github.com/datameet/maps (Shapefiles, need conversion)
- **geoBoundaries**: https://www.geoboundaries.org/ (global admin boundaries)
- **Mapshaper**: https://mapshaper.org/ (convert Shapefiles → TopoJSON online)

## Converting Shapefiles to TopoJSON

```bash
# Install mapshaper globally
npm install -g mapshaper

# Convert a shapefile to simplified TopoJSON
mapshaper input.shp -simplify 10% -o format=topojson output.json
```
