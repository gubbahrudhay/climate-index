// lib/geoUtils.ts
// Utility to map TopoJSON state names to our stateId slugs

/** Maps the STATE property from the TopoJSON to our stateId slug */
const STATE_NAME_TO_SLUG: Record<string, string> = {
  "ANDHRA PRADESH": "andhra-pradesh",
  "ARUNACHAL PRADESH": "arunachal-pradesh",
  "ASSAM": "assam",
  "BIHAR": "bihar",
  "CHHATTISGARH": "chhattisgarh",
  "GOA": "goa",
  "GUJARAT": "gujarat",
  "HARYANA": "haryana",
  "HIMACHAL PRADESH": "himachal-pradesh",
  "JHARKHAND": "jharkhand",
  "KARNATAKA": "karnataka",
  "KERALA": "kerala",
  "MADHYA PRADESH": "madhya-pradesh",
  "MAHARASHTRA": "maharashtra",
  "MANIPUR": "manipur",
  "MEGHALAYA": "meghalaya",
  "MIZORAM": "mizoram",
  "NAGALAND": "nagaland",
  "ODISHA": "odisha",
  "PUNJAB": "punjab",
  "RAJASTHAN": "rajasthan",
  "SIKKIM": "sikkim",
  "TAMIL NADU": "tamil-nadu",
  "TELANGANA": "telangana",
  "TRIPURA": "tripura",
  "UTTAR PRADESH": "uttar-pradesh",
  "UTTARAKHAND": "uttarakhand",
  "WEST BENGAL": "west-bengal",
  "DELHI": "delhi",
  "JAMMU AND KASHMIR": "jammu-and-kashmir",
  "LADAKH": "ladakh",
  "PUDUCHERRY": "puducherry",
  "CHANDIGARH": "chandigarh",
  "ANDAMAN & NICOBAR": "andaman-and-nicobar",
  "DADRA & NAGAR HAVELI & DAMAN & DIU": "dadra-nagar-haveli-daman-diu",
  "LAKSHADWEEP": "lakshadweep",
};

export function stateNameToSlug(stName: string): string {
  if (!stName) return "";
  return STATE_NAME_TO_SLUG[stName] || stName.toLowerCase().replace(/\s+/g, "-");
}

export const INDIA_STATES_GEO_URL = "/geo/india-states.json";
export const INDIA_DISTRICTS_GEO_URL = "/geo/india-districts.json";

export const INDIA_TOPO_OBJECT_STATES = "STATE_BOUNDARY";
export const INDIA_TOPO_OBJECT_DISTRICTS = "DISTRICT_BOUNDARY";
