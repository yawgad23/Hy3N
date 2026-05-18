import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateUniqueCode(userId) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HY3N-${userId.substring(0, 4).toUpperCase()}-${code}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an invite code
    const existingReferrals = await base44.asServiceRole.entities.Referral.filter({
      referrer_id: user.id
    });

    let inviteCode = existingReferrals.length > 0 ? existingReferrals[0].invite_code : null;

    if (!inviteCode) {
      // Generate new unique code
      inviteCode = generateUniqueCode(user.id);
      
      // Verify uniqueness
      const duplicate = await base44.asServiceRole.entities.Referral.filter({
        invite_code: inviteCode
      });

      if (duplicate.length > 0) {
        // Regenerate if duplicate found
        inviteCode = generateUniqueCode(user.id + Date.now());
      }
    }

    // Determine user role
    const riderProfiles = await base44.entities.RiderProfile.filter({ user_id: user.id });
    const driverProfiles = await base44.entities.DriverProfile.filter({ user_id: user.id });
    const role = riderProfiles.length > 0 ? 'rider' : driverProfiles.length > 0 ? 'driver' : 'user';

    return Response.json({
      invite_code: inviteCode,
      user_id: user.id,
      user_name: user.full_name,
      role: role
    });
  } catch (error) {
    console.error("generateInviteCode error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});