import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REFERRER_REWARD = 15; // GH₵15 for referrer
const REFEREE_REWARD = 10;  // GH₵10 for new user

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ride_id } = await req.json();

    if (!ride_id) {
      return Response.json({ error: 'ride_id is required' }, { status: 400 });
    }

    // Get the ride details
    const ride = await base44.asServiceRole.entities.Ride.get(ride_id);
    if (!ride) {
      return Response.json({ error: 'Ride not found' }, { status: 404 });
    }

    // Authorization check: Only the rider who completed the ride can trigger referral credit
    // This prevents any authenticated user from manipulating referral credits
    if (ride.rider_id !== user.id) {
      return Response.json({ 
        error: 'Forbidden: You can only claim referral credits for your own rides' 
      }, { status: 403 });
    }

    // Verify the ride is actually completed
    if (ride.status !== "completed") {
      return Response.json({ 
        error: 'Ride must be completed before referral credit can be applied' 
      }, { status: 400 });
    }

    // Check if this is already credited
    const existingReferral = await base44.asServiceRole.entities.Referral.filter({
      referee_id: ride.rider_id,
      status: "credited"
    });

    if (existingReferral.length > 0) {
      return Response.json({ 
        success: false, 
        message: 'Referral already credited for this user' 
      });
    }

    // Find pending referral for this user
    const pendingReferrals = await base44.asServiceRole.entities.Referral.filter({
      referee_id: ride.rider_id,
      status: "completed"
    });

    if (pendingReferrals.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No pending referral found for this user' 
      });
    }

    const referral = pendingReferrals[0];

    // Create or update wallet for referrer
    let referrerWallet = await base44.asServiceRole.entities.Wallet.filter({
      user_id: referral.referrer_id
    });

    if (referrerWallet.length === 0) {
      referrerWallet = await base44.asServiceRole.entities.Wallet.create({
        user_id: referral.referrer_id,
        balance: REFERRER_REWARD,
        total_topped_up: REFERRER_REWARD,
        total_spent: 0
      });
    } else {
      const wallet = referrerWallet[0];
      await base44.asServiceRole.entities.Wallet.update(wallet.id, {
        balance: wallet.balance + REFERRER_REWARD,
        total_topped_up: wallet.total_topped_up + REFERRER_REWARD
      });
    }

    // Create wallet transaction for referrer
    await base44.asServiceRole.entities.WalletTransaction.create({
      user_id: referral.referrer_id,
      type: "top_up",
      amount: REFERRER_REWARD,
      balance_after: (referrerWallet[0]?.balance || 0) + REFERRER_REWARD,
      description: `Referral reward - ${referral.referee_email} completed first ride`,
      ride_id: ride_id,
      reference: `REF-${referral.invite_code}`
    });

    // Create or update wallet for referee (new user)
    let refereeWallet = await base44.asServiceRole.entities.Wallet.filter({
      user_id: referral.referee_id
    });

    if (refereeWallet.length === 0) {
      refereeWallet = await base44.asServiceRole.entities.Wallet.create({
        user_id: referral.referee_id,
        balance: REFEREE_REWARD,
        total_topped_up: REFEREE_REWARD,
        total_spent: 0
      });
    } else {
      const wallet = refereeWallet[0];
      await base44.asServiceRole.entities.Wallet.update(wallet.id, {
        balance: wallet.balance + REFEREE_REWARD,
        total_topped_up: wallet.total_topped_up + REFEREE_REWARD
      });
    }

    // Create wallet transaction for referee
    await base44.asServiceRole.entities.WalletTransaction.create({
      user_id: referral.referee_id,
      type: "top_up",
      amount: REFEREE_REWARD,
      balance_after: (refereeWallet[0]?.balance || 0) + REFEREE_REWARD,
      description: `Welcome bonus - referred by ${referral.referrer_id}`,
      ride_id: ride_id,
      reference: `REF-${referral.invite_code}`
    });

    // Update referral status
    await base44.asServiceRole.entities.Referral.update(referral.id, {
      status: "credited",
      first_ride_id: ride_id,
      referrer_reward: REFERRER_REWARD,
      referee_reward: REFEREE_REWARD
    });

    console.log(`Referral credited: ${referral.invite_code} - Referrer: GH₵${REFERRER_REWARD}, Referee: GH₵${REFEREE_REWARD}`);

    return Response.json({
      success: true,
      referrer_reward: REFERRER_REWARD,
      referee_reward: REFEREE_REWARD,
      message: 'Referral rewards credited successfully'
    });
  } catch (error) {
    console.error("applyReferralCredit error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
