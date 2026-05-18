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

    for (const ride of pendingRides) {
      if (!ride.pickup_lat || !ride.pickup_lng) continue;

      // Find nearest available driver
      let nearest = null;
      let minDist = Infinity;

      for (const driver of availableDrivers) {
        if (alreadyAssigned.has(driver.user_id)) continue;
        if (!driver.current_lat || !driver.current_lng) continue;

        const dist = haversineKm(
          ride.pickup_lat, ride.pickup_lng,
          driver.current_lat, driver.current_lng
        );

        if (dist < minDist) {
          minDist = dist;
          nearest = driver;
        }
      }

      // Only match if driver is within 15km
      if (nearest && minDist <= 15) {
        await base44.asServiceRole.entities.Ride.update(ride.id, {
          status: "matched",
          driver_id: nearest.user_id,
          driver_name: nearest.full_name,
        });
        alreadyAssigned.add(nearest.user_id);
        matchedCount++;

        console.log(`Matched ride ${ride.id} to driver ${nearest.full_name} (${minDist.toFixed(2)} km away)`);
      } else {
        console.log(`No nearby driver for ride ${ride.id} (nearest: ${minDist === Infinity ? "none" : minDist.toFixed(2) + " km"})`);
      }
    }

    return Response.json({
      matched: matchedCount,
      pending: pendingRides.length,
      available_drivers: availableDrivers.length,
    });
  } catch (error) {
    console.error("autoMatchRides error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});