import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1. Authentication check - must be logged in
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Origin validation - only allow requests from known app domains
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

    // 3. Return the client-restricted Maps key
    // IMPORTANT: In Google Cloud Console, restrict this key to:
    // - HTTP referrer restrictions (your app domains only)
    // - API restrictions (Maps JavaScript API only)
    // Server-side functions use a separate unrestricted key internally
    const clientKey = Deno.env.get("GOOGLE_MAPS_CLIENT_KEY") || Deno.env.get("GOOGLE_MAPS_API_KEY") || "";

    if (!clientKey) {
      return Response.json({ error: 'Maps service unavailable' }, { status: 503 });
    }

    return new Response(JSON.stringify({ key: clientKey }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300'
      }
    });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
