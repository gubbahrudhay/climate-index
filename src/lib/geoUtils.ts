// lib/geoUtils.ts
// Utility to map TopoJSON state names to our stateId slugs

/** Maps the st_nm property from the TopoJSON to our stateId slug */
const STATE_NAME_TO_SLUG: Record<string, string> = {
  "Andhra Pradesh": "andhra-pradesh",
  "Arunachal Pradesh": "arunachal-pradesh",
  "Assam": "assam",
  "Bihar": "bihar",
  "Chhattisgarh": "chhattisgarh",
  "Goa": "goa",
  "Gujarat": "gujarat",
  "Haryana": "haryana",
  "Himachal Pradesh": "himachal-pradesh",
  "Jharkhand": "jharkhand",
  "Karnataka": "karnataka",
  "Kerala": "kerala",
  "Madhya Pradesh": "madhya-pradesh",
  "Maharashtra": "maharashtra",
  "Manipur": "manipur",
  "Meghalaya": "meghalaya",
  "Mizoram": "mizoram",
  "Nagaland": "nagaland",
  "Odisha": "odisha",
  "Punjab": "punjab",
  "Rajasthan": "rajasthan",
  "Sikkim": "sikkim",
  "Tamil Nadu": "tamil-nadu",
  "Telangana": "telangana",
  "Tripura": "tripura",
  "Uttar Pradesh": "uttar-pradesh",
  "Uttarakhand": "uttarakhand",
  "West Bengal": "west-bengal",
  "Delhi": "delhi",
  "Jammu and Kashmir": "jammu-and-kashmir",
  "Ladakh": "ladakh",
  "Puducherry": "puducherry",
  "Chandigarh": "chandigarh",
  "Andaman and Nicobar Islands": "andaman-and-nicobar",
  "Dadra and Nagar Haveli and Daman and Diu": "dadra-nagar-haveli-daman-diu",
  "Lakshadweep": "lakshadweep",
};

export function stateNameToSlug(stName: string): string {
  return STATE_NAME_TO_SLUG[stName] || stName.toLowerCase().replace(/\s+/g, "-");
}

export function getDistrictGeoUrl(stateSlug: string): string {
  return `/geo/districts/${stateSlug}.json`;
}

export const INDIA_STATES_GEO_URL = "/geo/india-states.json";
export const INDIA_TOPO_OBJECT_STATES = "states";
export const DISTRICT_TOPO_OBJECT = "districts";
