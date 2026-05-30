import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * sendPhoneLoginOtp - Send OTP to a phone number for login/registration.
 * 
 * Security measures:
 * 1. Rate limiting: Max 3 OTPs per phone per 15-minute window
 * 2. Lockout: Phone is locked for 30 minutes after exceeding rate limit
 * 3. Phone validation: Only valid Ghana phone numbers accepted
 * 4. IP tracking: Logs the requesting IP for abuse monitoring
 * 5. OTP hashing: OTP is stored hashed (SHA-256) to prevent database leaks
 */

const MAX_OTPS_PER_WINDOW = 3;       // Max OTP sends per phone in the time window
const RATE_LIMIT_WINDOW_MIN = 15;     // Time window in minutes
const LOCKOUT_DURATION_MIN = 30;      // Lockout duration after exceeding rate limit

// Validate Ghana phone number format
function isValidGhanaPhone(phone: string): boolean {
  // Accept: +233XXXXXXXXX, 233XXXXXXXXX, 0XXXXXXXXX (10 digits starting with 0)
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (/^\+233\d{9}$/.test(cleaned)) return true;
  if (/^233\d{9}$/.test(cleaned)) return true;
  if (/^0\d{9}$/.test(cleaned)) return true;
  return false;
}

// Normalize phone to +233 format
function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+233')) return cleaned;
  if (cleaned.startsWith('233')) return '+' + cleaned;
  if (cleaned.startsWith('0')) return '+233' + cleaned.substring(1);
  return cleaned;
}

// Simple SHA-256 hash for OTP storage
async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + (Deno.env.get("OTP_SALT") || "hy3n_otp_salt_2024"));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { phone } = body;

    // --- Input Validation ---
    if (!phone || typeof phone !== 'string') {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!isValidGhanaPhone(phone)) {
      return Response.json({ error: 'Invalid phone number format. Use Ghana format: 024XXXXXXX' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    // Get client IP for abuse tracking
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';

    // --- Rate Limiting ---
    // Check existing OTP records for this phone
    const existingOtps = await base44.asServiceRole.entities.PhoneOtp.filter({ phone: normalizedPhone });
    
    if (existingOtps.length > 0) {
      const latestOtp = existingOtps[0];
      
      // Check if phone is currently locked out
      if (latestOtp.locked_until) {
        const lockedUntil = new Date(latestOtp.locked_until);
        if (new Date() < lockedUntil) {
          const remainingMin = Math.ceil((lockedUntil.getTime() - Date.now()) / (1000 * 60));
          return Response.json({ 
            error: `Too many attempts. Please try again in ${remainingMin} minute(s).`,
            locked: true,
            retry_after_minutes: remainingMin
          }, { status: 429 });
        }
      }

      // Check rate limit within the time window
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60 * 1000);
      const recentOtps = existingOtps.filter(otp => {
        const created = new Date(otp.created_date);
        return created > windowStart;
      });

      if (recentOtps.length >= MAX_OTPS_PER_WINDOW) {
        // Lock the phone number
        const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MIN * 60 * 1000).toISOString();
        await base44.asServiceRole.entities.PhoneOtp.update(latestOtp.id, {
          locked_until: lockUntil
        });

        return Response.json({ 
          error: `Rate limit exceeded. Maximum ${MAX_OTPS_PER_WINDOW} OTPs per ${RATE_LIMIT_WINDOW_MIN} minutes. Locked for ${LOCKOUT_DURATION_MIN} minutes.`,
          locked: true,
          retry_after_minutes: LOCKOUT_DURATION_MIN
        }, { status: 429 });
      }

      // Clean up old OTP records (older than 15 minutes)
      for (const otp of existingOtps) {
        const created = new Date(otp.created_date);
        if (created <= windowStart) {
          try {
            await base44.asServiceRole.entities.PhoneOtp.delete(otp.id);
          } catch (e) {
            // Ignore deletion errors for cleanup
          }
        }
      }
    }

    // --- Generate and Store OTP ---
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await hashOtp(otpCode);

    await base44.asServiceRole.entities.PhoneOtp.create({
      phone: normalizedPhone,
      otp_code: hashedOtp,
      created_date: new Date().toISOString(),
      attempt_count: 0,
      send_count: (existingOtps.length || 0) + 1,
      ip_address: clientIp
    });

    // --- Send SMS via Twilio ---
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
          To: normalizedPhone,
          Body: `Your HY3N verification code is: ${otpCode}. This code expires in 5 minutes. Do not share it with anyone.`
        })
      }
    );

    if (!message.ok) {
      const error = await message.json();
      console.error("Twilio error:", error);
      return Response.json({ 
        success: false,
        error: "Failed to send SMS. Please try again."
      }, { status: 500 });
    }

    return Response.json({ 
      success: true,
      message: "OTP sent successfully"
      // NOTE: Never return the OTP code in the response
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return Response.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
});
