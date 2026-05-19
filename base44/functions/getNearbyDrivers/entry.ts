import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user location from request or default to Accra
    const { lat, lng, radius = 5000 } = await req.json().catch(() => ({}));
    const userLat = lat || 5.6037;
    const userLng = lng || -0.1870;

    // Fetch approved drivers who are online
    const drivers = await base44.entities.DriverProfile.filter({
      approval_status: "approved",
      is_online: true
    });

    // Calculate distance and filter by radius (simple Haversine formula)
    function haversineDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }

    const nearbyDrivers = drivers
      .filter(d => d.current_lat && d.current_lng)
      .map(d => ({
        ...d,
        distance: haversineDistance(userLat, userLng, d.current_lat, d.current_lng)
      }))
      .filter(d => d.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return Response.json({ drivers: nearbyDrivers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});