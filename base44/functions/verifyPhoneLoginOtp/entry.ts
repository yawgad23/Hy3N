import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { phone, otpCode } = await req.json();

    if (!phone || !otpCode) {
      return Response.json({ error: 'Missing phone or OTP code' }, { status: 400 });
    }

    // Find the OTP record
    const otpRecords = await base44.asServiceRole.entities.PhoneOtp.filter({ phone });
    
    if (otpRecords.length === 0) {
      return Response.json({ error: 'No OTP found for this phone number', success: false });
    }

    const otpRecord = otpRecords[0];
    const createdAt = new Date(otpRecord.created_date);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    // Check if OTP is expired (5 minutes)
    if (diffMinutes > 5) {
      await base44.asServiceRole.entities.PhoneOtp.delete(otpRecord.id);
      return Response.json({ error: 'OTP expired', success: false });
    }

    // Verify OTP
    if (otpRecord.otp_code !== otpCode) {
      return Response.json({ error: 'Invalid OTP code', success: false });
    }

    // Check if user exists with this phone
    let users = await base44.asServiceRole.entities.User.filter({});
    const existingUser = users.find(u => u.phone === phone || u.email === phone);

    if (!existingUser) {
      // Create new user with phone as email
      const tempEmail = `phone-${phone.replace(/\+/g, '')}@hy3n.local`;
      const tempPassword = Math.random().toString(36).slice(-10);
      
      await base44.asServiceRole.auth.register({ email: tempEmail, password: tempPassword });
      
      // Update user with phone number
      const newUser = await base44.asServiceRole.entities.User.filter({ email: tempEmail });
      if (newUser.length > 0) {
        await base44.asServiceRole.entities.User.update(newUser[0].id, { phone });
      }

      // Delete used OTP
      await base44.asServiceRole.entities.PhoneOtp.delete(otpRecord.id);

      return Response.json({ 
        success: true, 
        email: tempEmail, 
        tempPassword 
      });
    }

    // Delete used OTP
    await base44.asServiceRole.entities.PhoneOtp.delete(otpRecord.id);

    // Return existing user credentials (they need to set password first time)
    return Response.json({ 
      success: true, 
      email: existingUser.email,
      isNewUser: !existingUser.password_set 
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});