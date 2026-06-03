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

    const { lat, lng, radius_km = 5 } = await req.json();

    if (!lat || !lng) {
      return Response.json({ error: "lat and lng are required" }, { status: 400 });
    }

    // ── AUTO-CLEANUP STALE RIDES ──
    // Automatically cancel any requested, matched, or driver_arriving rides older than 30 minutes
    const pendingRidesRaw = await base44.asServiceRole.entities.Ride.filter({ status: "requested" });
    const matchedRidesRaw = await base44.asServiceRole.entities.Ride.filter({ status: "matched" });
    const arrivingRidesRaw = await base44.asServiceRole.entities.Ride.filter({ status: "driver_arriving" });
    
    const allStaleCandidateRides = [...pendingRidesRaw, ...matchedRidesRaw, ...arrivingRidesRaw];
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    let expiredCount = 0;

    for (const ride of allStaleCandidateRides) {
      // Check if created_at exists and is older than 30 minutes
      const rideTime = ride.created_at ? new Date(ride.created_at).getTime() : 0;
      if (rideTime && rideTime < thirtyMinutesAgo) {
        try {
          await base44.asServiceRole.entities.Ride.update(ride.id, {
            status: "cancelled",
            cancel_reason: "System auto-expired: Request timed out after 30 minutes."
          });
          expiredCount++;
        } catch (err) {
          console.error(`Failed to auto-expire stale ride ${ride.id}:`, err.message);
        }
      }
    }

    if (expiredCount > 0) {
      console.log(`[Auto-Cleanup] Automatically expired ${expiredCount} stale ride requests older than 30 minutes.`);
    }

    // Fetch fresh active ride requests in the area (after cleanup)
    const pendingRides = await base44.asServiceRole.entities.Ride.filter({ status: "requested" });
    const activeRides = await base44.asServiceRole.entities.Ride.filter({ status: "matched" });
    const inProgressRides = await base44.asServiceRole.entities.Ride.filter({ status: "driver_arriving" });

    // Count demand: rides originating near this location
    const nearbyDemand = [...pendingRides, ...activeRides, ...inProgressRides].filter((r) => {
      if (!r.pickup_lat || !r.pickup_lng) return false;
      return haversineKm(lat, lng, r.pickup_lat, r.pickup_lng) <= radius_km;
    }).length;

    // Count online approved drivers near this location
    const onlineDrivers = await base44.asServiceRole.entities.DriverProfile.filter({
      is_online: true,
      approval_status: "approved"
    });

    const nearbyDrivers = onlineDrivers.filter((d) => {
      if (!d.current_lat || !d.current_lng) return false;
      return haversineKm(lat, lng, d.current_lat, d.current_lng) <= radius_km;
    }).length;

        // Surge multiplier logic:
    // Only apply surge if there are actual drivers nearby.
    // If no drivers are online, return no surge (not a demand problem).
    let multiplier = 1.0;

    if (nearbyDrivers > 0) {
      const ratio = nearbyDemand / nearbyDrivers;
      if (ratio > 4) multiplier = 2.0;
      else if (ratio > 2.5) multiplier = 1.8;
      else if (ratio > 1.5) multiplier = 1.5;
      else if (ratio > 1) multiplier = 1.2;
    }

    const isSurge = multiplier > 1.0;


    console.log(`Surge check @ (${lat},${lng}) r=${radius_km}km: demand=${nearbyDemand}, drivers=${nearbyDrivers}, ratio=${ratio.toFixed(2)}, multiplier=${multiplier}`);

    return Response.json({
      multiplier,
      is_surge: isSurge,
      nearby_demand: nearbyDemand,
      nearby_drivers: nearbyDrivers,
      ratio: parseFloat(ratio.toFixed(2)),
    });
  } catch (error) {
    console.error("getSurgePricing error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
