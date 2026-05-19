import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { data } = payload;

    if (!data?.ride_id || !data?.sender_role || !data?.message) {
      return Response.json({ skipped: true });
    }

    // Skip system-generated messages
    if (data.sender_id === 'system') {
      return Response.json({ skipped: true });
    }

    // Get the ride to find the recipient
    const ride = await base44.asServiceRole.entities.Ride.get(data.ride_id);
    if (!ride) return Response.json({ error: 'Ride not found' }, { status: 404 });

    const recipientId = data.sender_role === 'rider' ? ride.driver_id : ride.rider_id;
    if (!recipientId) return Response.json({ skipped: true, reason: 'no_recipient' });

    const senderLabel = data.sender_name || (data.sender_role === 'rider' ? 'Rider' : 'Driver');
    const preview = data.message.length > 60 ? data.message.substring(0, 57) + '...' : data.message;

    console.log(`New message in ride ${data.ride_id}: ${senderLabel} → ${recipientId}: "${preview}"`);

    return Response.json({
      success: true,
      ride_id: data.ride_id,
      sender: senderLabel,
      recipient_id: recipientId,
      preview,
    });
  } catch (error) {
    console.error('onNewMessage error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});