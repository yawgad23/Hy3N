import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Haversine distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pickup_lat, pickup_lng, dest_lat, dest_lng } = await req.json();

    if (!pickup_lat || !pickup_lng || !dest_lat || !dest_lng) {
      return Response.json({ error: "All coordinates (pickup_lat, pickup_lng, dest_lat, dest_lng) are required" }, { status: 400 });
    }

    // Calculate distance between pickup and destination
    const distanceKm = haversineKm(pickup_lat, pickup_lng, dest_lat, dest_lng);

    // Estimate duration (assuming average 30 km/h in city traffic)
    const durationMinutes = Math.round(distanceKm / 30 * 60);

    console.log(`Distance: ${distanceKm.toFixed(2)} km, Duration: ${durationMinutes} min`);

    return Response.json({
      distance_km: parseFloat(distanceKm.toFixed(2)),
      duration_minutes: durationMinutes
    });
  } catch (error) {
    console.error("calculateDistance error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});