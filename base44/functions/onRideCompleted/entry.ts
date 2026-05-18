import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Only process completed rides
    if (event.type !== "update" || data.status !== "completed") {
      return Response.json({ skipped: true, reason: "Not a completed ride" });
    }

    // Check if this was the rider's first completed ride
    const allRides = await base44.asServiceRole.entities.Ride.filter({
      rider_id: data.rider_id
    });

    const completedRides = allRides.filter(r => r.status === "completed");
    
    // If this is the first completed ride
    if (completedRides.length === 1) {
      // Check if there's a pending referral for this rider
      const pendingReferrals = await base44.asServiceRole.entities.Referral.filter({
        referee_id: data.rider_id,
        status: "pending"
      });

      if (pendingReferrals.length > 0) {
        // Update referral status to completed (ready for credit)
        await base44.asServiceRole.entities.Referral.update(pendingReferrals[0].id, {
          status: "completed",
          first_ride_id: data.id
        });

        console.log(`First ride completed for referee ${data.rider_id}. Referral marked as completed.`);
      }
    }

    return Response.json({ 
      success: true, 
      message: "Ride completion processed",
      first_ride: completedRides.length === 1
    });
  } catch (error) {
    console.error("onRideCompleted error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});