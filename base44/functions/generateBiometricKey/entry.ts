import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { generateRegistrationOptions } from 'npm:@simplewebauthn/server@9.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get origin from request headers
    const origin = req.headers.get('origin') || req.headers.get('host') || 'localhost';
    const rpID = origin.replace(/^https?:\/\//, '').split(':')[0].split('.')[0] === 'localhost' 
      ? 'localhost' 
      : origin.replace(/^https?:\/\//, '').split(':')[0];

    // Generate registration options for WebAuthn
    const options = await generateRegistrationOptions({
      rpName: 'HY3N',
      rpID: rpID || 'localhost',
      userID: user.id,
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: [],
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
      },
    });

    // Store challenge temporarily (in production, store in database)
    await base44.asServiceRole.entities.BiometricKey.create({
      user_id: user.id,
      email: user.email,
      challenge: Array.from(options.challenge),
      created_date: new Date().toISOString()
    }).catch(() => {}); // Ignore if entity doesn't exist yet

    return Response.json({
      challenge: Array.from(options.challenge),
      rpId: options.rpID,
      userName: options.userName
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});