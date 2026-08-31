// Real approximate latitude/longitude for each Indian state/UT (capital
// city coordinates), used to place a marker on an actual map (OpenStreetMap
// via Leaflet). Projects only carry a state name, not an exact site address,
// so this gives an accurate state-level location rather than a precise pin.

export const STATE_COORDS = {
  "Andhra Pradesh": { lat: 16.5062, lng: 80.6480 },
  "Arunachal Pradesh": { lat: 27.0844, lng: 93.6053 },
  "Assam": { lat: 26.1445, lng: 91.7362 },
  "Bihar": { lat: 25.5941, lng: 85.1376 },
  "Chhattisgarh": { lat: 21.2514, lng: 81.6296 },
  "Goa": { lat: 15.4909, lng: 73.8278 },
  "Gujarat": { lat: 23.2156, lng: 72.6369 },
  "Haryana": { lat: 30.7333, lng: 76.7794 },
  "Himachal Pradesh": { lat: 31.1048, lng: 77.1734 },
  "Jharkhand": { lat: 23.3441, lng: 85.3096 },
  "Karnataka": { lat: 12.9716, lng: 77.5946 },
  "Kerala": { lat: 8.5241, lng: 76.9366 },
  "Madhya Pradesh": { lat: 23.2599, lng: 77.4126 },
  "Maharashtra": { lat: 19.0760, lng: 72.8777 },
  "Manipur": { lat: 24.8170, lng: 93.9368 },
  "Meghalaya": { lat: 25.5788, lng: 91.8933 },
  "Mizoram": { lat: 23.7271, lng: 92.7176 },
  "Nagaland": { lat: 25.6751, lng: 94.1086 },
  "Odisha": { lat: 20.2961, lng: 85.8245 },
  "Punjab": { lat: 31.6340, lng: 74.8723 },
  "Rajasthan": { lat: 26.9124, lng: 75.7873 },
  "Sikkim": { lat: 27.3389, lng: 88.6065 },
  "Tamil Nadu": { lat: 13.0827, lng: 80.2707 },
  "Telangana": { lat: 17.3850, lng: 78.4867 },
  "Tripura": { lat: 23.8315, lng: 91.2868 },
  "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
  "Uttarakhand": { lat: 30.3165, lng: 78.0322 },
  "West Bengal": { lat: 22.5726, lng: 88.3639 },
  "Delhi": { lat: 28.6139, lng: 77.2090 },
  "Jammu and Kashmir": { lat: 34.0837, lng: 74.7973 },
  "Jammu & Kashmir": { lat: 34.0837, lng: 74.7973 },
  "Ladakh": { lat: 34.1526, lng: 77.5771 },
  "Puducherry": { lat: 11.9416, lng: 79.8083 },
  "Chandigarh": { lat: 30.7333, lng: 76.7794 },
};

// Geographic center of India — used when a project's state isn't in the
// table above (e.g. a typo in uploaded data), so the map never breaks.
export const DEFAULT_COORDS = { lat: 22.9734, lng: 78.6569 };

export function getStateLatLng(stateName) {
  if (!stateName) return DEFAULT_COORDS;
  return STATE_COORDS[stateName.trim()] || DEFAULT_COORDS;
}