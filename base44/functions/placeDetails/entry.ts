import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { placeId } = await req.json();
    if (!placeId) {
      return Response.json({ error: 'Place ID required' }, { status: 400 });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`);
    const data = await response.json();
    
    return Response.json({ result: data.result || null });
  } catch (error) {
    return Response.json({ error: error.message, result: null }, { status: 500 });
  }
});