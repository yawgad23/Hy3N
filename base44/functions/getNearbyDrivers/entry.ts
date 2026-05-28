import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based access control:
    // - Admins get full driver details (for dashboard/monitoring)
    // - Riders get only minimal info needed to show drivers on map
    // - Other roles are denied access
    const isAdmin = user.role === 'admin';

    // Verify the user is a rider or admin (drivers should not query other drivers' locations)
    if (!isAdmin) {
      // Check if user is a registered rider (has used the app as rider)
      // Allow riders to see nearby drivers for the map display
      const riderProfiles = await base44.entities.RiderProfile.filter({ user_id: user.id }).catch(() => []);
      const isRider = riderProfiles.length > 0;
      
      if (!isRider) {
        // Also allow if user has any ride history as rider
        const riderRides = await base44.entities.Ride.filter({ rider_id: user.id }).catch(() => []);
        if (riderRides.length === 0) {
          return Response.json({ error: 'Forbidden: Only riders and admins can access nearby drivers' }, { status: 403 });
        }
      }
    }

    // Get user location from request or default to Accra
    const { lat, lng, radius = 5000 } = await req.json().catch(() => ({}));
    const userLat = lat || 5.6037;
    const userLng = lng || -0.1870;

    // Validate radius - cap at 10km for non-admins to prevent data scraping
    const maxRadius = isAdmin ? 50000 : 10000;
    const safeRadius = Math.min(Math.max(radius, 100), maxRadius);

    // Fetch approved drivers who are online
    const drivers = await base44.entities.DriverProfile.filter({
      approval_status: "approved",
      is_online: true
    });

    // Calculate distance and filter by radius (Haversine formula)
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
      .map(d => {
        const distance = haversineDistance(userLat, userLng, d.current_lat, d.current_lng);

        if (isAdmin) {
          // Admins get full driver details for monitoring
          return { ...d, distance };
        }

        // Riders only get minimal info needed for map display
        // No phone numbers, no exact names, no sensitive profile data
        return {
          id: d.id,
          current_lat: d.current_lat,
          current_lng: d.current_lng,
          vehicle_make: d.vehicle_make,
          vehicle_model: d.vehicle_model,
          vehicle_color: d.vehicle_color,
          ride_categories: d.ride_categories || ["standard"],
          rating: d.rating,
          distance
        };
      })
      .filter(d => d.distance <= safeRadius)
      .sort((a, b) => a.distance - b.distance);

    return Response.json({ drivers: nearbyDrivers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
