import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    // Generate a random challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Store challenge temporarily
    try {
      await base44.asServiceRole.entities.BiometricKey.create({
        email: email,
        challenge: Array.from(challenge),
        created_date: new Date().toISOString()
      }).catch(() => {});
    } catch (e) {
      // Entity might not exist
    }

    return Response.json({
      challenge: Array.from(challenge),
      email: email
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});