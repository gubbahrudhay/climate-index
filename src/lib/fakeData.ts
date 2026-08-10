// lib/fakeData.ts
// Deterministic fake data generator for the Indian Climate Index.
// Uses mulberry32 PRNG seeded by a string hash so numbers don't change on every reload.

import {
  ComponentScore,
  TimeSeriesPoint,
  DistrictClimate,
  StateClimate,
  NationalClimate,
} from "@/types/climate";

// ---------------------------------------------------------------------------
// PRNG: mulberry32 — fast 32-bit PRNG with good distribution
// ---------------------------------------------------------------------------

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRng(name: string): () => number {
  return mulberry32(hashString(name));
}

// ---------------------------------------------------------------------------
// Helper: generate a value in [min, max] from a 0-1 random
// ---------------------------------------------------------------------------
function rangeVal(rng: () => number, min: number, max: number): number {
  return +(min + rng() * (max - min)).toFixed(2);
}

// ---------------------------------------------------------------------------
// Indian states & their districts (representative subset)
// Using slugified IDs for URL-friendly references
// ---------------------------------------------------------------------------

interface StateInfo {
  stateId: string;
  stateName: string;
  isCoastal: boolean;
  districts: { districtId: string; districtName: string; isCoastal: boolean }[];
}

const STATES_DATA: StateInfo[] = [
  {
    stateId: "andhra-pradesh", stateName: "Andhra Pradesh", isCoastal: true,
    districts: [
      { districtId: "ap-anantapur", districtName: "Anantapur", isCoastal: false },
      { districtId: "ap-chittoor", districtName: "Chittoor", isCoastal: false },
      { districtId: "ap-east-godavari", districtName: "East Godavari", isCoastal: true },
      { districtId: "ap-guntur", districtName: "Guntur", isCoastal: true },
      { districtId: "ap-krishna", districtName: "Krishna", isCoastal: true },
      { districtId: "ap-kurnool", districtName: "Kurnool", isCoastal: false },
      { districtId: "ap-nellore", districtName: "Nellore", isCoastal: true },
      { districtId: "ap-prakasam", districtName: "Prakasam", isCoastal: true },
      { districtId: "ap-srikakulam", districtName: "Srikakulam", isCoastal: true },
      { districtId: "ap-visakhapatnam", districtName: "Visakhapatnam", isCoastal: true },
      { districtId: "ap-vizianagaram", districtName: "Vizianagaram", isCoastal: false },
      { districtId: "ap-west-godavari", districtName: "West Godavari", isCoastal: true },
      { districtId: "ap-ysr-kadapa", districtName: "YSR Kadapa", isCoastal: false },
    ],
  },
  {
    stateId: "arunachal-pradesh", stateName: "Arunachal Pradesh", isCoastal: false,
    districts: [
      { districtId: "ar-tawang", districtName: "Tawang", isCoastal: false },
      { districtId: "ar-west-kameng", districtName: "West Kameng", isCoastal: false },
      { districtId: "ar-east-kameng", districtName: "East Kameng", isCoastal: false },
      { districtId: "ar-papum-pare", districtName: "Papum Pare", isCoastal: false },
      { districtId: "ar-lower-subansiri", districtName: "Lower Subansiri", isCoastal: false },
      { districtId: "ar-upper-subansiri", districtName: "Upper Subansiri", isCoastal: false },
    ],
  },
  {
    stateId: "assam", stateName: "Assam", isCoastal: false,
    districts: [
      { districtId: "as-kamrup", districtName: "Kamrup", isCoastal: false },
      { districtId: "as-nagaon", districtName: "Nagaon", isCoastal: false },
      { districtId: "as-sonitpur", districtName: "Sonitpur", isCoastal: false },
      { districtId: "as-dibrugarh", districtName: "Dibrugarh", isCoastal: false },
      { districtId: "as-cachar", districtName: "Cachar", isCoastal: false },
      { districtId: "as-jorhat", districtName: "Jorhat", isCoastal: false },
      { districtId: "as-tinsukia", districtName: "Tinsukia", isCoastal: false },
    ],
  },
  {
    stateId: "bihar", stateName: "Bihar", isCoastal: false,
    districts: [
      { districtId: "br-patna", districtName: "Patna", isCoastal: false },
      { districtId: "br-gaya", districtName: "Gaya", isCoastal: false },
      { districtId: "br-muzaffarpur", districtName: "Muzaffarpur", isCoastal: false },
      { districtId: "br-bhagalpur", districtName: "Bhagalpur", isCoastal: false },
      { districtId: "br-purnia", districtName: "Purnia", isCoastal: false },
      { districtId: "br-darbhanga", districtName: "Darbhanga", isCoastal: false },
      { districtId: "br-begusarai", districtName: "Begusarai", isCoastal: false },
      { districtId: "br-nalanda", districtName: "Nalanda", isCoastal: false },
    ],
  },
  {
    stateId: "chhattisgarh", stateName: "Chhattisgarh", isCoastal: false,
    districts: [
      { districtId: "cg-raipur", districtName: "Raipur", isCoastal: false },
      { districtId: "cg-bilaspur", districtName: "Bilaspur", isCoastal: false },
      { districtId: "cg-durg", districtName: "Durg", isCoastal: false },
      { districtId: "cg-rajnandgaon", districtName: "Rajnandgaon", isCoastal: false },
      { districtId: "cg-korba", districtName: "Korba", isCoastal: false },
      { districtId: "cg-bastar", districtName: "Bastar", isCoastal: false },
    ],
  },
  {
    stateId: "goa", stateName: "Goa", isCoastal: true,
    districts: [
      { districtId: "ga-north-goa", districtName: "North Goa", isCoastal: true },
      { districtId: "ga-south-goa", districtName: "South Goa", isCoastal: true },
    ],
  },
  {
    stateId: "gujarat", stateName: "Gujarat", isCoastal: true,
    districts: [
      { districtId: "gj-ahmedabad", districtName: "Ahmedabad", isCoastal: false },
      { districtId: "gj-surat", districtName: "Surat", isCoastal: true },
      { districtId: "gj-vadodara", districtName: "Vadodara", isCoastal: false },
      { districtId: "gj-rajkot", districtName: "Rajkot", isCoastal: false },
      { districtId: "gj-bhavnagar", districtName: "Bhavnagar", isCoastal: true },
      { districtId: "gj-jamnagar", districtName: "Jamnagar", isCoastal: true },
      { districtId: "gj-junagadh", districtName: "Junagadh", isCoastal: true },
      { districtId: "gj-kutch", districtName: "Kutch", isCoastal: true },
    ],
  },
  {
    stateId: "haryana", stateName: "Haryana", isCoastal: false,
    districts: [
      { districtId: "hr-faridabad", districtName: "Faridabad", isCoastal: false },
      { districtId: "hr-gurgaon", districtName: "Gurgaon", isCoastal: false },
      { districtId: "hr-hisar", districtName: "Hisar", isCoastal: false },
      { districtId: "hr-karnal", districtName: "Karnal", isCoastal: false },
      { districtId: "hr-panipat", districtName: "Panipat", isCoastal: false },
      { districtId: "hr-rohtak", districtName: "Rohtak", isCoastal: false },
      { districtId: "hr-ambala", districtName: "Ambala", isCoastal: false },
    ],
  },
  {
    stateId: "himachal-pradesh", stateName: "Himachal Pradesh", isCoastal: false,
    districts: [
      { districtId: "hp-shimla", districtName: "Shimla", isCoastal: false },
      { districtId: "hp-kangra", districtName: "Kangra", isCoastal: false },
      { districtId: "hp-mandi", districtName: "Mandi", isCoastal: false },
      { districtId: "hp-kullu", districtName: "Kullu", isCoastal: false },
      { districtId: "hp-solan", districtName: "Solan", isCoastal: false },
    ],
  },
  {
    stateId: "jharkhand", stateName: "Jharkhand", isCoastal: false,
    districts: [
      { districtId: "jh-ranchi", districtName: "Ranchi", isCoastal: false },
      { districtId: "jh-jamshedpur", districtName: "Jamshedpur (East Singhbhum)", isCoastal: false },
      { districtId: "jh-dhanbad", districtName: "Dhanbad", isCoastal: false },
      { districtId: "jh-bokaro", districtName: "Bokaro", isCoastal: false },
      { districtId: "jh-hazaribagh", districtName: "Hazaribagh", isCoastal: false },
      { districtId: "jh-deoghar", districtName: "Deoghar", isCoastal: false },
    ],
  },
  {
    stateId: "karnataka", stateName: "Karnataka", isCoastal: true,
    districts: [
      { districtId: "ka-bengaluru-urban", districtName: "Bengaluru Urban", isCoastal: false },
      { districtId: "ka-mysuru", districtName: "Mysuru", isCoastal: false },
      { districtId: "ka-belgaum", districtName: "Belgaum (Belagavi)", isCoastal: false },
      { districtId: "ka-mangalore", districtName: "Dakshina Kannada", isCoastal: true },
      { districtId: "ka-hubli", districtName: "Dharwad", isCoastal: false },
      { districtId: "ka-udupi", districtName: "Udupi", isCoastal: true },
      { districtId: "ka-uttara-kannada", districtName: "Uttara Kannada", isCoastal: true },
      { districtId: "ka-tumkur", districtName: "Tumkur", isCoastal: false },
    ],
  },
  {
    stateId: "kerala", stateName: "Kerala", isCoastal: true,
    districts: [
      { districtId: "kl-thiruvananthapuram", districtName: "Thiruvananthapuram", isCoastal: true },
      { districtId: "kl-ernakulam", districtName: "Ernakulam", isCoastal: true },
      { districtId: "kl-kozhikode", districtName: "Kozhikode", isCoastal: true },
      { districtId: "kl-thrissur", districtName: "Thrissur", isCoastal: true },
      { districtId: "kl-alappuzha", districtName: "Alappuzha", isCoastal: true },
      { districtId: "kl-kannur", districtName: "Kannur", isCoastal: true },
      { districtId: "kl-kollam", districtName: "Kollam", isCoastal: true },
      { districtId: "kl-idukki", districtName: "Idukki", isCoastal: false },
      { districtId: "kl-palakkad", districtName: "Palakkad", isCoastal: false },
      { districtId: "kl-malappuram", districtName: "Malappuram", isCoastal: true },
      { districtId: "kl-kottayam", districtName: "Kottayam", isCoastal: false },
      { districtId: "kl-wayanad", districtName: "Wayanad", isCoastal: false },
      { districtId: "kl-pathanamthitta", districtName: "Pathanamthitta", isCoastal: false },
      { districtId: "kl-kasaragod", districtName: "Kasaragod", isCoastal: true },
    ],
  },
  {
    stateId: "madhya-pradesh", stateName: "Madhya Pradesh", isCoastal: false,
    districts: [
      { districtId: "mp-bhopal", districtName: "Bhopal", isCoastal: false },
      { districtId: "mp-indore", districtName: "Indore", isCoastal: false },
      { districtId: "mp-jabalpur", districtName: "Jabalpur", isCoastal: false },
      { districtId: "mp-gwalior", districtName: "Gwalior", isCoastal: false },
      { districtId: "mp-ujjain", districtName: "Ujjain", isCoastal: false },
      { districtId: "mp-sagar", districtName: "Sagar", isCoastal: false },
      { districtId: "mp-rewa", districtName: "Rewa", isCoastal: false },
      { districtId: "mp-satna", districtName: "Satna", isCoastal: false },
    ],
  },
  {
    stateId: "maharashtra", stateName: "Maharashtra", isCoastal: true,
    districts: [
      { districtId: "mh-mumbai", districtName: "Mumbai", isCoastal: true },
      { districtId: "mh-pune", districtName: "Pune", isCoastal: false },
      { districtId: "mh-nagpur", districtName: "Nagpur", isCoastal: false },
      { districtId: "mh-thane", districtName: "Thane", isCoastal: true },
      { districtId: "mh-nashik", districtName: "Nashik", isCoastal: false },
      { districtId: "mh-aurangabad", districtName: "Aurangabad", isCoastal: false },
      { districtId: "mh-solapur", districtName: "Solapur", isCoastal: false },
      { districtId: "mh-kolhapur", districtName: "Kolhapur", isCoastal: false },
      { districtId: "mh-ratnagiri", districtName: "Ratnagiri", isCoastal: true },
      { districtId: "mh-sindhudurg", districtName: "Sindhudurg", isCoastal: true },
    ],
  },
  {
    stateId: "manipur", stateName: "Manipur", isCoastal: false,
    districts: [
      { districtId: "mn-imphal-east", districtName: "Imphal East", isCoastal: false },
      { districtId: "mn-imphal-west", districtName: "Imphal West", isCoastal: false },
      { districtId: "mn-bishnupur", districtName: "Bishnupur", isCoastal: false },
      { districtId: "mn-thoubal", districtName: "Thoubal", isCoastal: false },
    ],
  },
  {
    stateId: "meghalaya", stateName: "Meghalaya", isCoastal: false,
    districts: [
      { districtId: "ml-east-khasi-hills", districtName: "East Khasi Hills", isCoastal: false },
      { districtId: "ml-west-khasi-hills", districtName: "West Khasi Hills", isCoastal: false },
      { districtId: "ml-east-garo-hills", districtName: "East Garo Hills", isCoastal: false },
      { districtId: "ml-west-garo-hills", districtName: "West Garo Hills", isCoastal: false },
      { districtId: "ml-ri-bhoi", districtName: "Ri-Bhoi", isCoastal: false },
    ],
  },
  {
    stateId: "mizoram", stateName: "Mizoram", isCoastal: false,
    districts: [
      { districtId: "mz-aizawl", districtName: "Aizawl", isCoastal: false },
      { districtId: "mz-lunglei", districtName: "Lunglei", isCoastal: false },
      { districtId: "mz-champhai", districtName: "Champhai", isCoastal: false },
    ],
  },
  {
    stateId: "nagaland", stateName: "Nagaland", isCoastal: false,
    districts: [
      { districtId: "nl-kohima", districtName: "Kohima", isCoastal: false },
      { districtId: "nl-dimapur", districtName: "Dimapur", isCoastal: false },
      { districtId: "nl-mokokchung", districtName: "Mokokchung", isCoastal: false },
      { districtId: "nl-tuensang", districtName: "Tuensang", isCoastal: false },
    ],
  },
  {
    stateId: "odisha", stateName: "Odisha", isCoastal: true,
    districts: [
      { districtId: "od-khordha", districtName: "Khordha", isCoastal: true },
      { districtId: "od-cuttack", districtName: "Cuttack", isCoastal: true },
      { districtId: "od-ganjam", districtName: "Ganjam", isCoastal: true },
      { districtId: "od-balasore", districtName: "Balasore", isCoastal: true },
      { districtId: "od-sambalpur", districtName: "Sambalpur", isCoastal: false },
      { districtId: "od-sundargarh", districtName: "Sundargarh", isCoastal: false },
      { districtId: "od-puri", districtName: "Puri", isCoastal: true },
    ],
  },
  {
    stateId: "punjab", stateName: "Punjab", isCoastal: false,
    districts: [
      { districtId: "pb-ludhiana", districtName: "Ludhiana", isCoastal: false },
      { districtId: "pb-amritsar", districtName: "Amritsar", isCoastal: false },
      { districtId: "pb-jalandhar", districtName: "Jalandhar", isCoastal: false },
      { districtId: "pb-patiala", districtName: "Patiala", isCoastal: false },
      { districtId: "pb-bathinda", districtName: "Bathinda", isCoastal: false },
    ],
  },
  {
    stateId: "rajasthan", stateName: "Rajasthan", isCoastal: false,
    districts: [
      { districtId: "rj-jaipur", districtName: "Jaipur", isCoastal: false },
      { districtId: "rj-jodhpur", districtName: "Jodhpur", isCoastal: false },
      { districtId: "rj-udaipur", districtName: "Udaipur", isCoastal: false },
      { districtId: "rj-kota", districtName: "Kota", isCoastal: false },
      { districtId: "rj-bikaner", districtName: "Bikaner", isCoastal: false },
      { districtId: "rj-ajmer", districtName: "Ajmer", isCoastal: false },
      { districtId: "rj-alwar", districtName: "Alwar", isCoastal: false },
      { districtId: "rj-bharatpur", districtName: "Bharatpur", isCoastal: false },
      { districtId: "rj-jaisalmer", districtName: "Jaisalmer", isCoastal: false },
    ],
  },
  {
    stateId: "sikkim", stateName: "Sikkim", isCoastal: false,
    districts: [
      { districtId: "sk-east-sikkim", districtName: "East Sikkim", isCoastal: false },
      { districtId: "sk-west-sikkim", districtName: "West Sikkim", isCoastal: false },
      { districtId: "sk-north-sikkim", districtName: "North Sikkim", isCoastal: false },
      { districtId: "sk-south-sikkim", districtName: "South Sikkim", isCoastal: false },
    ],
  },
  {
    stateId: "tamil-nadu", stateName: "Tamil Nadu", isCoastal: true,
    districts: [
      { districtId: "tn-chennai", districtName: "Chennai", isCoastal: true },
      { districtId: "tn-coimbatore", districtName: "Coimbatore", isCoastal: false },
      { districtId: "tn-madurai", districtName: "Madurai", isCoastal: false },
      { districtId: "tn-tiruchirappalli", districtName: "Tiruchirappalli", isCoastal: false },
      { districtId: "tn-salem", districtName: "Salem", isCoastal: false },
      { districtId: "tn-tirunelveli", districtName: "Tirunelveli", isCoastal: false },
      { districtId: "tn-kanchipuram", districtName: "Kanchipuram", isCoastal: true },
      { districtId: "tn-thanjavur", districtName: "Thanjavur", isCoastal: true },
      { districtId: "tn-nagapattinam", districtName: "Nagapattinam", isCoastal: true },
      { districtId: "tn-ramanathapuram", districtName: "Ramanathapuram", isCoastal: true },
    ],
  },
  {
    stateId: "telangana", stateName: "Telangana", isCoastal: false,
    districts: [
      { districtId: "ts-hyderabad", districtName: "Hyderabad", isCoastal: false },
      { districtId: "ts-rangareddy", districtName: "Rangareddy", isCoastal: false },
      { districtId: "ts-warangal", districtName: "Warangal", isCoastal: false },
      { districtId: "ts-karimnagar", districtName: "Karimnagar", isCoastal: false },
      { districtId: "ts-nizamabad", districtName: "Nizamabad", isCoastal: false },
      { districtId: "ts-medak", districtName: "Medak", isCoastal: false },
      { districtId: "ts-nalgonda", districtName: "Nalgonda", isCoastal: false },
    ],
  },
  {
    stateId: "tripura", stateName: "Tripura", isCoastal: false,
    districts: [
      { districtId: "tr-west-tripura", districtName: "West Tripura", isCoastal: false },
      { districtId: "tr-south-tripura", districtName: "South Tripura", isCoastal: false },
      { districtId: "tr-north-tripura", districtName: "North Tripura", isCoastal: false },
      { districtId: "tr-dhalai", districtName: "Dhalai", isCoastal: false },
    ],
  },
  {
    stateId: "uttar-pradesh", stateName: "Uttar Pradesh", isCoastal: false,
    districts: [
      { districtId: "up-lucknow", districtName: "Lucknow", isCoastal: false },
      { districtId: "up-kanpur", districtName: "Kanpur Nagar", isCoastal: false },
      { districtId: "up-agra", districtName: "Agra", isCoastal: false },
      { districtId: "up-varanasi", districtName: "Varanasi", isCoastal: false },
      { districtId: "up-allahabad", districtName: "Prayagraj", isCoastal: false },
      { districtId: "up-meerut", districtName: "Meerut", isCoastal: false },
      { districtId: "up-ghaziabad", districtName: "Ghaziabad", isCoastal: false },
      { districtId: "up-bareilly", districtName: "Bareilly", isCoastal: false },
      { districtId: "up-gorakhpur", districtName: "Gorakhpur", isCoastal: false },
      { districtId: "up-moradabad", districtName: "Moradabad", isCoastal: false },
    ],
  },
  {
    stateId: "uttarakhand", stateName: "Uttarakhand", isCoastal: false,
    districts: [
      { districtId: "uk-dehradun", districtName: "Dehradun", isCoastal: false },
      { districtId: "uk-haridwar", districtName: "Haridwar", isCoastal: false },
      { districtId: "uk-nainital", districtName: "Nainital", isCoastal: false },
      { districtId: "uk-udham-singh-nagar", districtName: "Udham Singh Nagar", isCoastal: false },
      { districtId: "uk-pauri-garhwal", districtName: "Pauri Garhwal", isCoastal: false },
    ],
  },
  {
    stateId: "west-bengal", stateName: "West Bengal", isCoastal: true,
    districts: [
      { districtId: "wb-kolkata", districtName: "Kolkata", isCoastal: true },
      { districtId: "wb-north-24-parganas", districtName: "North 24 Parganas", isCoastal: true },
      { districtId: "wb-south-24-parganas", districtName: "South 24 Parganas", isCoastal: true },
      { districtId: "wb-howrah", districtName: "Howrah", isCoastal: true },
      { districtId: "wb-hooghly", districtName: "Hooghly", isCoastal: false },
      { districtId: "wb-barddhaman", districtName: "Barddhaman", isCoastal: false },
      { districtId: "wb-murshidabad", districtName: "Murshidabad", isCoastal: false },
      { districtId: "wb-darjeeling", districtName: "Darjeeling", isCoastal: false },
      { districtId: "wb-medinipur", districtName: "Medinipur East", isCoastal: true },
    ],
  },
  // Union Territories
  {
    stateId: "delhi", stateName: "Delhi", isCoastal: false,
    districts: [
      { districtId: "dl-central", districtName: "Central Delhi", isCoastal: false },
      { districtId: "dl-north", districtName: "North Delhi", isCoastal: false },
      { districtId: "dl-south", districtName: "South Delhi", isCoastal: false },
      { districtId: "dl-east", districtName: "East Delhi", isCoastal: false },
      { districtId: "dl-west", districtName: "West Delhi", isCoastal: false },
      { districtId: "dl-new-delhi", districtName: "New Delhi", isCoastal: false },
      { districtId: "dl-north-west", districtName: "North West Delhi", isCoastal: false },
      { districtId: "dl-south-west", districtName: "South West Delhi", isCoastal: false },
      { districtId: "dl-north-east", districtName: "North East Delhi", isCoastal: false },
      { districtId: "dl-south-east", districtName: "South East Delhi", isCoastal: false },
      { districtId: "dl-shahdara", districtName: "Shahdara", isCoastal: false },
    ],
  },
  {
    stateId: "jammu-and-kashmir", stateName: "Jammu & Kashmir", isCoastal: false,
    districts: [
      { districtId: "jk-srinagar", districtName: "Srinagar", isCoastal: false },
      { districtId: "jk-jammu", districtName: "Jammu", isCoastal: false },
      { districtId: "jk-anantnag", districtName: "Anantnag", isCoastal: false },
      { districtId: "jk-baramulla", districtName: "Baramulla", isCoastal: false },
      { districtId: "jk-udhampur", districtName: "Udhampur", isCoastal: false },
    ],
  },
  {
    stateId: "ladakh", stateName: "Ladakh", isCoastal: false,
    districts: [
      { districtId: "la-leh", districtName: "Leh", isCoastal: false },
      { districtId: "la-kargil", districtName: "Kargil", isCoastal: false },
    ],
  },
  {
    stateId: "puducherry", stateName: "Puducherry", isCoastal: true,
    districts: [
      { districtId: "py-puducherry", districtName: "Puducherry", isCoastal: true },
      { districtId: "py-karaikal", districtName: "Karaikal", isCoastal: true },
      { districtId: "py-yanam", districtName: "Yanam", isCoastal: true },
      { districtId: "py-mahe", districtName: "Mahe", isCoastal: true },
    ],
  },
  {
    stateId: "chandigarh", stateName: "Chandigarh", isCoastal: false,
    districts: [
      { districtId: "ch-chandigarh", districtName: "Chandigarh", isCoastal: false },
    ],
  },
  {
    stateId: "andaman-and-nicobar", stateName: "Andaman & Nicobar Islands", isCoastal: true,
    districts: [
      { districtId: "an-south-andaman", districtName: "South Andaman", isCoastal: true },
      { districtId: "an-north-middle-andaman", districtName: "North & Middle Andaman", isCoastal: true },
      { districtId: "an-nicobar", districtName: "Nicobar", isCoastal: true },
    ],
  },
  {
    stateId: "dadra-nagar-haveli-daman-diu", stateName: "Dadra & Nagar Haveli and Daman & Diu", isCoastal: true,
    districts: [
      { districtId: "dd-daman", districtName: "Daman", isCoastal: true },
      { districtId: "dd-diu", districtName: "Diu", isCoastal: true },
      { districtId: "dd-dadra-nagar-haveli", districtName: "Dadra & Nagar Haveli", isCoastal: false },
    ],
  },
  {
    stateId: "lakshadweep", stateName: "Lakshadweep", isCoastal: true,
    districts: [
      { districtId: "ld-lakshadweep", districtName: "Lakshadweep", isCoastal: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// Generate component scores for a district
// ---------------------------------------------------------------------------

function generateComponentScore(
  rng: () => number,
  isCoastal: boolean
): ComponentScore {
  return {
    highTemp: rangeVal(rng, -1.5, 3.0),
    lowTemp: rangeVal(rng, -2.0, 2.0),
    heavyRain: rangeVal(rng, -1.0, 3.0),
    drought: rangeVal(rng, -1.5, 2.5),
    highWind: rangeVal(rng, -1.0, 2.0),
    seaLevel: isCoastal ? rangeVal(rng, 0.0, 2.5) : null,
  };
}

// ---------------------------------------------------------------------------
// Generate time series with subtle upward trend + noise
// ---------------------------------------------------------------------------

function generateTimeSeries(
  rng: () => number,
  baseIndex: number
): TimeSeriesPoint[] {
  const startYear = 1990;
  const endYear = 2025;
  const points: TimeSeriesPoint[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const progress = (year - startYear) / (endYear - startYear);
    // subtle upward trend: starts ~30% below current, ends at current
    const trendValue = baseIndex * (0.7 + 0.3 * progress);
    // add noise ±0.3
    const noise = (rng() - 0.5) * 0.6;
    points.push({
      year,
      index: +Math.max(-1, trendValue + noise).toFixed(2),
    });
  }

  return points;
}

// ---------------------------------------------------------------------------
// Determine trend from time series
// ---------------------------------------------------------------------------

function determineTrend(history: TimeSeriesPoint[]): "up" | "down" | "flat" {
  if (history.length < 10) return "flat";
  const recent = history.slice(-5).reduce((s, p) => s + p.index, 0) / 5;
  const early = history.slice(0, 5).reduce((s, p) => s + p.index, 0) / 5;
  const diff = recent - early;
  if (diff > 0.3) return "up";
  if (diff < -0.3) return "down";
  return "flat";
}

// ---------------------------------------------------------------------------
// Public API: generate all fake climate data
// ---------------------------------------------------------------------------

let _cachedStates: StateClimate[] | null = null;
let _cachedDistricts: Map<string, DistrictClimate[]> | null = null;
let _cachedAllDistricts: DistrictClimate[] | null = null;

function ensureGenerated() {
  if (_cachedStates) return;

  const states: StateClimate[] = [];
  const districtsByState = new Map<string, DistrictClimate[]>();
  const allDistricts: DistrictClimate[] = [];

  for (const stateInfo of STATES_DATA) {
    const stateDistricts: DistrictClimate[] = [];

    for (const d of stateInfo.districts) {
      const rng = seededRng(d.districtId);
      const index = rangeVal(rng, -0.5, 3.0);
      const components = generateComponentScore(rng, d.isCoastal);
      const history = generateTimeSeries(seededRng(d.districtId + "-ts"), index);
      const trend = determineTrend(history);

      const district: DistrictClimate = {
        districtId: d.districtId,
        districtName: d.districtName,
        stateId: stateInfo.stateId,
        index,
        trend,
        components,
        history,
        isCoastal: d.isCoastal,
      };

      stateDistricts.push(district);
      allDistricts.push(district);
    }

    districtsByState.set(stateInfo.stateId, stateDistricts);

    // Aggregate state index from district averages
    const avgIndex =
      stateDistricts.reduce((sum, d) => sum + d.index, 0) /
      stateDistricts.length;
    const stateHistory = generateTimeSeries(
      seededRng(stateInfo.stateId + "-state-ts"),
      avgIndex
    );

    states.push({
      stateId: stateInfo.stateId,
      stateName: stateInfo.stateName,
      index: +avgIndex.toFixed(2),
      trend: determineTrend(stateHistory),
      districts: stateDistricts.map((d) => d.districtId),
    });
  }

  _cachedStates = states;
  _cachedDistricts = districtsByState;
  _cachedAllDistricts = allDistricts;
}

/** Get all state-level climate data */
export function getStatesClimate(): StateClimate[] {
  ensureGenerated();
  return _cachedStates!;
}

/** Get districts for a specific state */
export function getDistrictsForState(stateId: string): DistrictClimate[] {
  ensureGenerated();
  return _cachedDistricts!.get(stateId) || [];
}

/** Get a single district by ID */
export function getDistrictClimate(
  districtId: string
): DistrictClimate | undefined {
  ensureGenerated();
  return _cachedAllDistricts!.find((d) => d.districtId === districtId);
}

/** Get a single state by ID */
export function getStateClimate(stateId: string): StateClimate | undefined {
  ensureGenerated();
  return _cachedStates!.find((s) => s.stateId === stateId);
}

/** Get national aggregate */
export function getNationalClimate(): NationalClimate {
  ensureGenerated();
  const states = _cachedStates!;
  const avgIndex =
    states.reduce((sum, s) => sum + s.index, 0) / states.length;

  // Count trends
  const upCount = states.filter((s) => s.trend === "up").length;
  const downCount = states.filter((s) => s.trend === "down").length;

  let trend: "up" | "down" | "flat" = "flat";
  if (upCount > downCount + 5) trend = "up";
  else if (downCount > upCount + 5) trend = "down";

  return {
    index: +avgIndex.toFixed(2),
    trend,
    yearRange: [1990, 2025],
  };
}

/** Get the list of all state IDs and names (for map labeling) */
export function getStatesList(): { stateId: string; stateName: string }[] {
  return STATES_DATA.map((s) => ({
    stateId: s.stateId,
    stateName: s.stateName,
  }));
}
