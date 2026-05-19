import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const POINTS_PER_RIDE = { bronze: 10, silver: 12, gold: 15, platinum: 20 };
const POINTS_PER_10_GHS = 2;
const POINTS_FOR_RATING = 5;

const TIER_THRESHOLDS = { silver: 500, gold: 1500, platinum: 4000 };

function calcTier(lifetimePoints) {
  if (lifetimePoints >= 4000) return "platinum";
  if (lifetimePoints >= 1500) return "gold";
  if (lifetimePoints >= 500) return "silver";
  return "bronze";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (event.type !== "update" || data.status !== "completed") {
      return Response.json({ skipped: true, reason: "Not a completed ride" });
    }

    // ── Referral processing ───────────────────────────────────────────
    const allRides = await base44.asServiceRole.entities.Ride.filter({ rider_id: data.rider_id });
    const completedRides = allRides.filter(r => r.status === "completed");

    if (completedRides.length === 1) {
      const pendingReferrals = await base44.asServiceRole.entities.Referral.filter({
        referee_id: data.rider_id,
        status: "pending"
      });
      if (pendingReferrals.length > 0) {
        await base44.asServiceRole.entities.Referral.update(pendingReferrals[0].id, {
          status: "completed",
          first_ride_id: data.id
        });
        console.log(`First ride completed for referee ${data.rider_id}. Referral marked as completed.`);
      }
    }

    // ── Loyalty points ────────────────────────────────────────────────
    const loyaltyList = await base44.asServiceRole.entities.LoyaltyPoints.filter({ user_id: data.rider_id });
    const loyalty = loyaltyList[0];

    const currentTier = loyalty?.tier || "bronze";
    const baseRidePoints = POINTS_PER_RIDE[currentTier];
    const farePoints = data.final_fare ? Math.floor((data.final_fare / 10) * POINTS_PER_10_GHS) : 0;
    const earnedPoints = baseRidePoints + farePoints;

    if (loyalty) {
      const newLifetime = (loyalty.lifetime_points || 0) + earnedPoints;
      const newTotal = (loyalty.total_points || 0) + earnedPoints;
      const newTotalRides = (loyalty.total_rides || 0) + 1;
      const newTier = calcTier(newLifetime);

      await base44.asServiceRole.entities.LoyaltyPoints.update(loyalty.id, {
        total_points: newTotal,
        lifetime_points: newLifetime,
        total_rides: newTotalRides,
        tier: newTier,
      });
      console.log(`Loyalty: +${earnedPoints} pts for rider ${data.rider_id}. Tier: ${newTier}`);
    } else {
      // Create new loyalty record
      await base44.asServiceRole.entities.LoyaltyPoints.create({
        user_id: data.rider_id,
        total_points: earnedPoints,
        lifetime_points: earnedPoints,
        total_rides: 1,
        tier: "bronze",
      });
      console.log(`New loyalty record created for rider ${data.rider_id} with ${earnedPoints} pts`);
    }

    return Response.json({
      success: true,
      message: "Ride completion processed",
      points_awarded: earnedPoints,
      first_ride: completedRides.length === 1
    });
  } catch (error) {
    console.error("onRideCompleted error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});