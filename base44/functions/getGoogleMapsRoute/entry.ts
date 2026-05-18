import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origin, destination } = await req.json();

    if (!origin || !destination) {
      return Response.json({ error: 'origin and destination are required' }, { status: 400 });
    }

    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!GOOGLE_MAPS_API_KEY) {
      return Response.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    // Call Google Maps Directions API
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return Response.json({ error: data.status || 'Failed to fetch route' }, { status: 400 });
    }

    return Response.json({
      routes: data.routes,
      status: 'OK'
    });
  } catch (error) {
    console.error("getGoogleMapsRoute error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});