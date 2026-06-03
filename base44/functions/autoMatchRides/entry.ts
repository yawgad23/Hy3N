import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Haversine distance in km between two lat/lng points
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fallback categories for Kantanka if not available
const FALLBACK_CATEGORIES = {
  kantanka: ["standard", "comfort"],
  okada: ["standard"],
  executive: ["comfort", "standard"],
  comfort: ["standard"],
  standard: [],
  express_delivery: []
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Fetch all unmatched ride requests
    const pendingRides = await base44.asServiceRole.entities.Ride.filter({ status: "requested" });

    if (pendingRides.length === 0) {
      return Response.json({ matched: 0, message: "No pending rides" });
    }

    // Fetch all online approved drivers
    const onlineDrivers = await base44.asServiceRole.entities.DriverProfile.filter({
      is_online: true,
      approval_status: "approved"
    });

    if (onlineDrivers.length === 0) {
      return Response.json({ matched: 0, message: "No online drivers available" });
    }

    // Find drivers that are already assigned to an active ride
    const activeRides = await base44.asServiceRole.entities.Ride.filter({
      status: "matched"
    });
    const activeRides2 = await base44.asServiceRole.entities.Ride.filter({
      status: "driver_arriving"
    });
    const activeRides3 = await base44.asServiceRole.entities.Ride.filter({
      status: "in_progress"
    });

    const busyDriverIds = new Set([
      ...activeRides.map(r => r.driver_id),
      ...activeRides2.map(r => r.driver_id),
      ...activeRides3.map(r => r.driver_id),
    ].filter(Boolean));

    const availableDrivers = onlineDrivers.filter(d => !busyDriverIds.has(d.user_id));

    if (availableDrivers.length === 0) {
      return Response.json({ matched: 0, message: "All drivers currently busy" });
    }

    let matchedCount = 0;
    const alreadyAssigned = new Set(); // prevent double-assigning same driver in one run
    const unmatchedRides = [];

    for (const ride of pendingRides) {
      if (!ride.pickup_lat || !ride.pickup_lng) continue;

      // Determine which categories to search for (primary + fallbacks)
      const categoriesToSearch = [ride.category, ...(FALLBACK_CATEGORIES[ride.category] || [])];

      // Find nearest available driver that supports the requested category (or fallback)
      let nearest = null;
      let minDist = Infinity;
      let matchedCategory = null;

      for (const category of categoriesToSearch) {
        for (const driver of availableDrivers) {
          if (alreadyAssigned.has(driver.user_id)) continue;
          if (!driver.current_lat || !driver.current_lng) continue;

          // Check if driver supports this category
          const driverCategories = driver.ride_categories || ["standard"];
          if (!driverCategories.includes(category)) continue;

          const dist = haversineKm(
            ride.pickup_lat, ride.pickup_lng,
            driver.current_lat, driver.current_lng
          );

          if (dist < minDist) {
            minDist = dist;
            nearest = driver;
            matchedCategory = category;
          }
        }

        // If we found a match for this category, don't check further categories
        if (nearest) break;
      }

      // Only match if driver is within 15km
      if (nearest && minDist <= 15) {
        await base44.asServiceRole.entities.Ride.update(ride.id, {
          status: "matched",
          driver_id: nearest.user_id,
          driver_name: nearest.full_name,
          matched_category: matchedCategory // Track which category was actually matched
        });
        alreadyAssigned.add(nearest.user_id);
        matchedCount++;

        console.log(`Matched ride ${ride.id} (${ride.category}) to driver ${nearest.full_name} as ${matchedCategory} (${minDist.toFixed(2)} km away)`);
      } else {
        unmatchedRides.push({
          ride_id: ride.id,
          requested_category: ride.category,
          reason: minDist === Infinity ? "No drivers available" : `No drivers within 15km (nearest: ${minDist.toFixed(2)} km)`
        });
        console.log(`No nearby driver for ride ${ride.id} requesting ${ride.category} (nearest: ${minDist === Infinity ? "none" : minDist.toFixed(2) + " km"})`);
      }
    }

    return Response.json({
      matched: matchedCount,
      pending: pendingRides.length,
      available_drivers: availableDrivers.length,
      unmatched_rides: unmatchedRides,
      message: unmatchedRides.length > 0 ? `${matchedCount} matched, ${unmatchedRides.length} unmatched (no drivers available or too far)` : `All ${matchedCount} rides matched`
    });
  } catch (error) {
    console.error("autoMatchRides error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
