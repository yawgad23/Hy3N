import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query || query.length < 2) {
      return Response.json({ predictions: [] });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&types=geocode&components=country:gh`);
    const data = await response.json();
    
    return Response.json({ predictions: data.predictions || [] });
  } catch (error) {
    return Response.json({ error: error.message, predictions: [] }, { status: 500 });
  }
});