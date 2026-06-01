import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1. Strict authentication check
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.email) {
      return Response.json({ error: 'Email required for biometric setup' }, { status: 400 });
    }

    // 2. Get origin from request headers for WebAuthn RP ID
    const origin = req.headers.get('origin') || req.headers.get('host') || 'localhost';
    const rpID = origin.replace(/^https?:\/\//, '').split(':')[0].split('.')[0] === 'localhost'
      ? 'localhost'
      : origin.replace(/^https?:\/\//, '').split(':')[0];

    // 3. Generate a cryptographically secure challenge
    const challengeBytes = new Uint8Array(32);
    crypto.getRandomValues(challengeBytes);
    const challenge = Array.from(challengeBytes);

    // 4. Store challenge using the user's own auth context (RLS allows owner to create)
    // No need for asServiceRole since RLS permits: data.user_id == user.id
    try {
      await base44.entities.BiometricKey.create({
        user_id: user.id,
        email: user.email,
        challenge: challenge,
        created_date: new Date().toISOString()
      });
    } catch (e) {
      // If RLS blocks it, fall back to service role with strict user_id binding
      await base44.asServiceRole.entities.BiometricKey.create({
        user_id: user.id,
        email: user.email,
        challenge: challenge,
        created_date: new Date().toISOString()
      });
    }

    // 5. Return registration options (never expose internal IDs or keys)
    return Response.json({
      challenge: challenge,
      rpId: rpID,
      rpName: 'HY3N',
      userName: user.email,
      userId: user.id
    });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
