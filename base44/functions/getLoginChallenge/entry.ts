import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email } = body;

    // 1. Validate email input
    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 2. Origin validation
    const origin = req.headers.get('origin') || '';
    const allowedOrigins = [
      'https://hyen-ride-forward.base44.app',
      'https://hy3n-driver.base44.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];

    if (origin && !allowedOrigins.some(o => origin.startsWith(o))) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Check if user actually has biometric keys registered
    // Only generate challenges for users who have previously set up biometrics
    let hasExistingKey = false;
    try {
      const existingKeys = await base44.asServiceRole.entities.BiometricKey.filter({
        email: email.toLowerCase().trim(),
        enabled: true
      });
      hasExistingKey = existingKeys.length > 0;
    } catch (e) {
      // Entity might not exist
    }

    if (!hasExistingKey) {
      // Return generic error to prevent email enumeration
      return Response.json({ error: 'Biometric login not available' }, { status: 400 });
    }

    // 4. Generate a cryptographically secure challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // 5. Store challenge with expiry (5 minutes)
    try {
      await base44.asServiceRole.entities.BiometricKey.create({
        email: email.toLowerCase().trim(),
        user_id: 'challenge_' + Date.now(), // Temporary challenge record
        challenge: Array.from(challenge),
        created_date: new Date().toISOString()
      });
    } catch (e) {
      // If creation fails, still return challenge (stateless fallback)
    }

    return Response.json({
      challenge: Array.from(challenge),
      email: email
    });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
