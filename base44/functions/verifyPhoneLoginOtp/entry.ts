import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * verifyPhoneLoginOtp - Verify OTP and authenticate/register user.
 * 
 * Security measures:
 * 1. Brute-force protection: Max 5 failed attempts per OTP, then OTP is invalidated
 * 2. Lockout: After 5 failed attempts, phone is locked for 30 minutes
 * 3. OTP expiry: 5-minute expiry window strictly enforced
 * 4. OTP hashing: Compares against hashed OTP (not plaintext)
 * 5. Single-use: OTP is deleted immediately after successful verification
 * 6. Generic error messages: Does not reveal whether phone exists in system
 */

const MAX_VERIFY_ATTEMPTS = 5;        // Max failed attempts before lockout
const OTP_EXPIRY_MINUTES = 5;         // OTP validity window
const LOCKOUT_DURATION_MIN = 30;      // Lockout after max attempts exceeded

// Normalize phone to +233 format
function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+233')) return cleaned;
  if (cleaned.startsWith('233')) return '+' + cleaned;
  if (cleaned.startsWith('0')) return '+233' + cleaned.substring(1);
  return cleaned;
}

// Hash OTP for comparison (must match sendPhoneLoginOtp hashing)
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
    const { phone, otpCode } = body;

    // --- Input Validation ---
    if (!phone || typeof phone !== 'string' || !otpCode || typeof otpCode !== 'string') {
      return Response.json({ error: 'Phone number and OTP code are required', success: false }, { status: 400 });
    }

    // Validate OTP format (must be exactly 6 digits)
    if (!/^\d{6}$/.test(otpCode)) {
      return Response.json({ error: 'Invalid OTP format', success: false }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    // --- Find OTP Record ---
    const otpRecords = await base44.asServiceRole.entities.PhoneOtp.filter({ phone: normalizedPhone });
    
    if (otpRecords.length === 0) {
      // Use generic error to prevent phone enumeration
      return Response.json({ error: 'Invalid or expired OTP code', success: false }, { status: 401 });
    }

    // Get the most recent OTP record
    const otpRecord = otpRecords.sort((a, b) => 
      new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
    )[0];

    // --- Check Lockout ---
    if (otpRecord.locked_until) {
      const lockedUntil = new Date(otpRecord.locked_until);
      if (new Date() < lockedUntil) {
        const remainingMin = Math.ceil((lockedUntil.getTime() - Date.now()) / (1000 * 60));
        return Response.json({ 
          error: `Account temporarily locked. Try again in ${remainingMin} minute(s).`,
          success: false,
          locked: true,
          retry_after_minutes: remainingMin
        }, { status: 429 });
      }
    }

    // --- Check Attempt Count (Brute-force Protection) ---
    const currentAttempts = otpRecord.attempt_count || 0;
    if (currentAttempts >= MAX_VERIFY_ATTEMPTS) {
      // Lock the phone and invalidate the OTP
      const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MIN * 60 * 1000).toISOString();
      await base44.asServiceRole.entities.PhoneOtp.update(otpRecord.id, {
        locked_until: lockUntil
      });
      return Response.json({ 
        error: `Too many failed attempts. Locked for ${LOCKOUT_DURATION_MIN} minutes. Request a new OTP after.`,
        success: false,
        locked: true
      }, { status: 429 });
    }

    // --- Check OTP Expiry ---
    const createdAt = new Date(otpRecord.created_date);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (diffMinutes > OTP_EXPIRY_MINUTES) {
      // Clean up expired OTP
      await base44.asServiceRole.entities.PhoneOtp.delete(otpRecord.id);
      return Response.json({ error: 'OTP expired. Please request a new one.', success: false }, { status: 401 });
    }

    // --- Verify OTP (compare hashed values) ---
    const hashedInput = await hashOtp(otpCode);
    if (otpRecord.otp_code !== hashedInput) {
      // Increment attempt counter
      await base44.asServiceRole.entities.PhoneOtp.update(otpRecord.id, {
        attempt_count: currentAttempts + 1
      });

      const remainingAttempts = MAX_VERIFY_ATTEMPTS - (currentAttempts + 1);
      
      if (remainingAttempts <= 0) {
        // Lock after final failed attempt
        const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MIN * 60 * 1000).toISOString();
        await base44.asServiceRole.entities.PhoneOtp.update(otpRecord.id, {
          locked_until: lockUntil
        });
        return Response.json({ 
          error: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MIN} minutes.`,
          success: false,
          locked: true
        }, { status: 429 });
      }

      return Response.json({ 
        error: `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`,
        success: false,
        remaining_attempts: remainingAttempts
      }, { status: 401 });
    }

    // --- OTP Verified Successfully ---
    // Immediately delete the OTP (single-use)
    await base44.asServiceRole.entities.PhoneOtp.delete(otpRecord.id);

    // Clean up any other OTP records for this phone
    for (const record of otpRecords) {
      if (record.id !== otpRecord.id) {
        try {
          await base44.asServiceRole.entities.PhoneOtp.delete(record.id);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }

    // --- Find or Create User ---
    let users = await base44.asServiceRole.entities.User.filter({});
    const existingUser = users.find(u => u.phone === normalizedPhone || u.email === normalizedPhone);

    if (!existingUser) {
      // Create new user with phone as email
      const tempEmail = `phone-${normalizedPhone.replace(/\+/g, '')}@hy3n.local`;
      const tempPassword = crypto.randomUUID().slice(0, 16); // Cryptographically random password
      
      await base44.asServiceRole.auth.register({ email: tempEmail, password: tempPassword });
      
      // Update user with phone number
      const newUser = await base44.asServiceRole.entities.User.filter({ email: tempEmail });
      if (newUser.length > 0) {
        await base44.asServiceRole.entities.User.update(newUser[0].id, { phone: normalizedPhone });
      }

      return Response.json({ 
        success: true, 
        email: tempEmail, 
        tempPassword,
        isNewUser: true
      });
    }

    // Return existing user credentials
    return Response.json({ 
      success: true, 
      email: existingUser.email,
      isNewUser: false
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    // Generic error message to prevent information leakage
    return Response.json({ error: "Verification failed. Please try again.", success: false }, { status: 500 });
  }
});
