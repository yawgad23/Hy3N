import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { phone } = await req.json();

    if (!phone || phone.length < 10) {
      return Response.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in a temporary entity with 5-minute expiry
    await base44.asServiceRole.entities.PhoneOtp.create({
      phone,
      otp_code: otpCode,
      created_date: new Date().toISOString()
    });

    // MOCK MODE: Log OTP to console instead of sending SMS
    console.log("🔐 MOCK OTP for", phone, ":", otpCode);
    console.log("⚠️ In production, this would be sent via Twilio SMS");

    return Response.json({ 
      success: true,
      mock: true,
      message: "OTP sent (check backend logs for code in test mode)"
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});