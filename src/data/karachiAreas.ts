export interface KarachiArea {
  id: string;
  name: string;
  zone: string;
  lat: number;
  lng: number;
}

export const RESTAURANT_LOCATION = {
  name: 'Shahi Pizza — Fast Food & Bar B Q',
  address: 'Sector 5-A/1, Madiha Road, Near 4K Chowrangi, North Karachi, Karachi',
  phoneDisplay: '0310-3827633',
  whatsappDigits: '923103827633',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Sector+5-A%2F1,+Madiha+Road,+Near+4K+Chowrangi,+North+Karachi,+Karachi',
  lat: 24.9964,
  lng: 67.0645,
};

export const KARACHI_AREAS: KarachiArea[] = [
  { id: '4k-chowrangi', name: '4K Chowrangi (North Karachi)', zone: 'North Karachi', lat: 24.9964, lng: 67.0645 },
  { id: 'nk-5a1', name: 'North Karachi — Sector 5-A/1 & 5-A/2', zone: 'North Karachi', lat: 24.9958, lng: 67.0662 },
  { id: 'nk-5c', name: 'North Karachi — Sector 5-C & 5-D', zone: 'North Karachi', lat: 24.9912, lng: 67.0618 },
  { id: 'nk-7d', name: 'North Karachi — Sector 7-D & 7-C', zone: 'North Karachi', lat: 24.9875, lng: 67.0695 },
  { id: 'nk-11a', name: 'North Karachi — Sector 11-A & 11-B', zone: 'North Karachi', lat: 24.9822, lng: 67.0631 },
  { id: 'nk-11c', name: 'North Karachi — Sector 11-C & Anda More', zone: 'North Karachi', lat: 24.9776, lng: 67.0615 },
  { id: 'power-house', name: 'Power House Chowrangi', zone: 'North Karachi', lat: 24.9896, lng: 67.0584 },
  { id: 'up-more', name: 'UP More (North Karachi)', zone: 'North Karachi', lat: 24.9841, lng: 67.0558 },
  { id: 'nagan-chowrangi', name: 'Nagan Chowrangi', zone: 'North Karachi', lat: 24.9665, lng: 67.0664 },
  { id: 'new-karachi', name: 'New Karachi (All Sectors)', zone: 'North Karachi', lat: 24.9935, lng: 67.0748 },
  { id: 'surjani-town', name: 'Surjani Town (Sectors 4–7)', zone: 'Surjani', lat: 25.0258, lng: 67.0628 },
  { id: 'khuda-ki-basti', name: 'Khuda Ki Basti / Taiser Town', zone: 'Surjani', lat: 25.0442, lng: 67.0681 },
  { id: 'shadman-town', name: 'Shadman Town (14-A & 14-B)', zone: 'North Nazimabad', lat: 24.9642, lng: 67.0518 },
  { id: 'buffer-zone', name: 'Buffer Zone (15-A/1 to 15-B)', zone: 'North Nazimabad', lat: 24.9598, lng: 67.0612 },
  { id: 'sakhi-hassan', name: 'Sakhi Hassan Chowrangi', zone: 'North Nazimabad', lat: 24.9562, lng: 67.0514 },
  { id: 'nn-block-a-h', name: 'North Nazimabad — Blocks A to H', zone: 'North Nazimabad', lat: 24.9388, lng: 67.0398 },
  { id: 'nn-block-i-w', name: 'North Nazimabad — Blocks I to W', zone: 'North Nazimabad', lat: 24.9485, lng: 67.0472 },
  { id: 'hyderi', name: 'Hyderi Market', zone: 'North Nazimabad', lat: 24.9412, lng: 67.0435 },
  { id: 'nazimabad-1-4', name: 'Nazimabad (Blocks 1–4)', zone: 'Central', lat: 24.9145, lng: 67.0312 },
  { id: 'paposh-nagar', name: 'Paposh Nagar', zone: 'Central', lat: 24.9255, lng: 67.0324 },
  { id: 'liaquatabad', name: 'Liaquatabad (Lalukhet)', zone: 'Central', lat: 24.9048, lng: 67.0482 },
  { id: 'karimabad', name: 'Karimabad', zone: 'Gulberg', lat: 24.9182, lng: 67.0578 },
  { id: 'ayesha-manzil', name: 'Ayesha Manzil', zone: 'Gulberg', lat: 24.9265, lng: 67.0638 },
  { id: 'water-pump', name: 'Water Pump / Ancholi', zone: 'Gulberg', lat: 24.9445, lng: 67.0748 },
  { id: 'fb-area-1-10', name: 'Federal B Area — Blocks 1 to 10', zone: 'Gulberg', lat: 24.9315, lng: 67.0715 },
  { id: 'fb-area-11-22', name: 'Federal B Area — Blocks 11 to 22', zone: 'Gulberg', lat: 24.9472, lng: 67.0815 },
  { id: 'gulberg-town', name: 'Gulberg Town', zone: 'Gulberg', lat: 24.9375, lng: 67.0668 },
  { id: 'sohrab-goth', name: 'Sohrab Goth', zone: 'East', lat: 24.9495, lng: 67.0908 },
  { id: 'gulshan-maymar', name: 'Gulshan-e-Maymar', zone: 'Gadap', lat: 25.0195, lng: 67.1312 },
  { id: 'scheme-33', name: 'Scheme 33 (University Road)', zone: 'East', lat: 24.9562, lng: 67.1458 },
  { id: 'gulshan-1-7', name: 'Gulshan-e-Iqbal — Blocks 1 to 7', zone: 'East', lat: 24.9242, lng: 67.0992 },
  { id: 'gulshan-10-13', name: 'Gulshan-e-Iqbal — Blocks 10 to 13D', zone: 'East', lat: 24.9162, lng: 67.0885 },
  { id: 'gulshan-14-19', name: 'Gulshan-e-Iqbal — Blocks 14 to 19', zone: 'East', lat: 24.9062, lng: 67.0968 },
  { id: 'johar-1-10', name: 'Gulistan-e-Johar — Blocks 1 to 10', zone: 'East', lat: 24.9255, lng: 67.1318 },
  { id: 'johar-11-20', name: 'Gulistan-e-Johar — Blocks 11 to 20', zone: 'East', lat: 24.9125, lng: 67.1255 },
  { id: 'safoora-goth', name: 'Safoora Chowrangi', zone: 'East', lat: 24.9518, lng: 67.1524 },
  { id: 'maskan', name: 'Maskan Chowrangi', zone: 'East', lat: 24.9295, lng: 67.1105 },
  { id: 'millennium', name: 'Millennium Mall / Dalmia', zone: 'East', lat: 24.9012, lng: 67.1158 },
  { id: 'jauhar-mor', name: 'Johar Mor', zone: 'East', lat: 24.9032, lng: 67.1285 },
  { id: 'malir-cantt', name: 'Malir Cantt', zone: 'Malir', lat: 24.9388, lng: 67.2065 },
  { id: 'malir-halt', name: 'Malir Halt & Model Colony', zone: 'Malir', lat: 24.8925, lng: 67.1852 },
  { id: 'shah-faisal', name: 'Shah Faisal Colony', zone: 'Korangi', lat: 24.8785, lng: 67.1485 },
  { id: 'pechs-1-6', name: 'PECHS — Blocks 1 to 6', zone: 'East', lat: 24.8712, lng: 67.0585 },
  { id: 'bahadurabad', name: 'Bahadurabad', zone: 'East', lat: 24.8815, lng: 67.0685 },
  { id: 'tariq-road', name: 'Tariq Road', zone: 'East', lat: 24.8718, lng: 67.0615 },
  { id: 'nursery', name: 'Nursery (Shahrah-e-Faisal)', zone: 'East', lat: 24.8635, lng: 67.0612 },
  { id: 'karsaz', name: 'Karsaz (Shahrah-e-Faisal)', zone: 'East', lat: 24.8772, lng: 67.0875 },
  { id: 'gulshan-jamal', name: 'Gulshan-e-Jamal', zone: 'East', lat: 24.8958, lng: 67.1052 },
  { id: 'soldier-bazaar', name: 'Soldier Bazaar', zone: 'South', lat: 24.8768, lng: 67.0372 },
  { id: 'garden-east-west', name: 'Garden East & Garden West', zone: 'South', lat: 24.8722, lng: 67.0245 },
  { id: 'saddar', name: 'Saddar / Empress Market', zone: 'South', lat: 24.8615, lng: 67.0272 },
  { id: 'burns-road', name: 'Burns Road / II Chundrigar', zone: 'South', lat: 24.8535, lng: 67.0155 },
  { id: 'kharadar', name: 'Kharadar / Bolton Market', zone: 'South', lat: 24.8538, lng: 66.9998 },
  { id: 'lyari', name: 'Lyari Town', zone: 'South', lat: 24.8685, lng: 66.9942 },
  { id: 'defence-view', name: 'Defence View (Phases 1 & 2)', zone: 'Korangi', lat: 24.8355, lng: 67.0745 },
  { id: 'clifton-1-5', name: 'Clifton — Blocks 1 to 5', zone: 'South', lat: 24.8125, lng: 67.0298 },
  { id: 'clifton-6-9', name: 'Clifton — Blocks 6 to 9', zone: 'South', lat: 24.8235, lng: 67.0352 },
  { id: 'dha-1-4', name: 'DHA — Phases 1 to 4', zone: 'South', lat: 24.8248, lng: 67.0615 },
  { id: 'dha-5-6', name: 'DHA — Phases 5 & 6', zone: 'South', lat: 24.8012, lng: 67.0585 },
  { id: 'dha-7-8', name: 'DHA — Phases 7 & 8', zone: 'South', lat: 24.7865, lng: 67.0778 },
  { id: 'korangi', name: 'Korangi (Crossing to No. 6)', zone: 'Korangi', lat: 24.8342, lng: 67.1315 },
  { id: 'landhi', name: 'Landhi Town', zone: 'Korangi', lat: 24.8442, lng: 67.1965 },
  { id: 'orangi-town', name: 'Orangi Town', zone: 'West', lat: 24.9465, lng: 66.9895 },
  { id: 'site-area', name: 'SITE Industrial Area', zone: 'West', lat: 24.9012, lng: 66.9945 },
  { id: 'baldia-town', name: 'Baldia Town', zone: 'West', lat: 24.9185, lng: 66.9575 },
  { id: 'bahria-town', name: 'Bahria Town Karachi', zone: 'M-9 Highway', lat: 25.0412, lng: 67.3245 },
];

export function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const roadFactor = 1.24; // Karachi road routing factor vs straight-line distance
  return Math.round(R * c * roadFactor * 10) / 10;
}

export function findNearestKarachiArea(lat: number, lng: number): {
  area: KarachiArea;
  distanceKm: number;
} {
  let best = KARACHI_AREAS[0];
  let minStraightDist = Infinity;

  for (const area of KARACHI_AREAS) {
    const d = calculateDistanceKm(lat, lng, area.lat, area.lng);
    if (d < minStraightDist) {
      minStraightDist = d;
      best = area;
    }
  }

  const distanceFromRestaurant = calculateDistanceKm(
    RESTAURANT_LOCATION.lat,
    RESTAURANT_LOCATION.lng,
    lat,
    lng,
  );

  return {
    area: best,
    distanceKm: distanceFromRestaurant,
  };
}

// Local petrol-indexed calculation fallback (mirrors server-side pricing formula)
export function calculateDeliveryQuoteLocal(
  distanceKm: number,
  orderType: 'Delivery' | 'Takeaway' | 'Dine-In',
  petrolPricePerLiter = 254.63,
): { distanceKm: number; deliveryFee: number } {
  if (orderType !== 'Delivery') {
    return { distanceKm: 0, deliveryFee: 0 };
  }
  const effectiveKm = Math.max(0.5, distanceKm);
  const perKmRate = (petrolPricePerLiter / 42) * 2.55;
  const baseDispatch = 45;
  const rawFee = baseDispatch + effectiveKm * perKmRate;
  const roundedFee = Math.max(60, Math.round(rawFee / 10) * 10);
  return {
    distanceKm: Math.round(effectiveKm * 10) / 10,
    deliveryFee: roundedFee,
  };
}
