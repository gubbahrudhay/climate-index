#!/bin/bash
set -e

echo "Processing State Boundaries..."
npx -y mapshaper 91/STATE_BOUNDARY.shp \
  -proj wgs84 \
  -simplify dp 5% \
  -o format=topojson public/geo/india-states.json

echo "Processing District Boundaries..."
npx -y mapshaper 91/DISTRICT_BOUNDARY.shp \
  -proj wgs84 \
  -simplify dp 5% \
  -o format=topojson public/geo/india-districts.json

echo "Done!"
