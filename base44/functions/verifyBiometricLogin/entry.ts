import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, credential } = body;

    if (!email || !credential) {
      return Response.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Verify the biometric credential
    // In production, you would validate against stored public key
    // For now, we'll generate a temporary password
    
    const biometricKeys = await base44.asServiceRole.entities.BiometricKey.filter({ email });
    const isValid = biometricKeys.length > 0 && biometricKeys[0].enabled;

    if (!isValid) {
      return Response.json({ success: false, error: 'Biometric not registered' });
    }

    // Generate temporary password (in production, use proper token)
    const tempPassword = 'temp_' + crypto.randomUUID();

    return Response.json({
      success: true,
      tempPassword: tempPassword
    });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});