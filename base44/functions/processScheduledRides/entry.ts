import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow automation system calls but block non-admin users
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    // Look up to 10 minutes ahead so we don't miss rides due to timing gaps
    const triggerCutoff = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

    // Fetch all pending scheduled rides
    const pendingRides = await base44.asServiceRole.entities.ScheduledRide.filter({ status: 'pending' });

    // Filter to those that should be triggered now (scheduled_for <= cutoff)
    const duRides = pendingRides.filter((sr) => {
      if (!sr.scheduled_for) return false;
      return new Date(sr.scheduled_for) <= new Date(triggerCutoff);
    });

    console.log(`[processScheduledRides] Found ${duRides.length} ride(s) to trigger`);

    const results = [];
    for (const sr of duRides) {
      try {
        // Create the live Ride record
        const ride = await base44.asServiceRole.entities.Ride.create({
          rider_id: sr.rider_id,
          rider_name: sr.rider_name || 'Rider',
          category: sr.category,
          pickup_address: sr.pickup_address,
          pickup_lat: sr.pickup_lat,
          pickup_lng: sr.pickup_lng,
          destination_address: sr.destination_address,
          destination_lat: sr.destination_lat,
          destination_lng: sr.destination_lng,
          fare_estimate: sr.fare_estimate,
          payment_method: sr.payment_method,
          distance_km: sr.distance_km,
          surge_multiplier: sr.surge_multiplier || 1.0,
          ride_type: 'scheduled',
          scheduled_for: sr.scheduled_for,
          status: 'requested'
        });

        // Mark scheduled ride as triggered
        await base44.asServiceRole.entities.ScheduledRide.update(sr.id, {
          status: 'triggered',
          triggered_ride_id: ride.id
        });

        console.log(`[processScheduledRides] Triggered ride ${ride.id} from scheduled ride ${sr.id}`);
        results.push({ scheduledRideId: sr.id, rideId: ride.id, status: 'triggered' });
      } catch (err) {
        console.error(`[processScheduledRides] Failed to trigger scheduled ride ${sr.id}:`, err.message);
        results.push({ scheduledRideId: sr.id, error: err.message, status: 'failed' });
      }
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    console.error('[processScheduledRides] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});