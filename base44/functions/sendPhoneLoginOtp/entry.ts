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

    // Send SMS via Twilio (production)
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromPhone = Deno.env.get("TWILIO_FROM_PHONE");

    if (!accountSid || !authToken || !fromPhone) {
      console.error("Twilio credentials not configured");
      return Response.json({ 
        success: false,
        error: "SMS service not configured"
      }, { status: 500 });
    }

    const message = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          From: fromPhone,
          To: phone,
          Body: `Your HY3N verification code is: ${otpCode}`
        })
      }
    );

    if (!message.ok) {
      const error = await message.json();
      console.error("Twilio error:", error);
      return Response.json({ 
        success: false,
        error: "Failed to send SMS"
      }, { status: 500 });
    }

    return Response.json({ 
      success: true,
      message: "OTP sent successfully"
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});