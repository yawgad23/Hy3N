import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This is called by automation - verify service role context
    const payload = await req.json();
    const { event, data } = payload;
    
    if (!data || !data.ride_id) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Get the ride details
    const ride = await base44.asServiceRole.entities.Ride.get(data.ride_id);
    if (!ride) {
      return Response.json({ error: 'Ride not found' }, { status: 404 });
    }

    // Determine recipient (the other party)
    const senderRole = data.sender_role;
    const recipientId = senderRole === 'rider' ? ride.driver_id : ride.rider_id;
    const recipientRole = senderRole === 'rider' ? 'driver' : 'rider';
    
    // Get recipient's user details
    const recipient = await base44.asServiceRole.entities.User.get(recipientId);
    
    // Send push notification via web push (using service worker)
    // For now, we'll store notification in a entity that the service worker can poll
    // Or use the base44 notification system if available
    
    // Create notification record
    await base44.asServiceRole.entities.RideMessage.create({
      ride_id: data.ride_id,
      sender_id: 'system',
      sender_role: 'system',
      sender_name: 'System',
      message: `NOTIFICATION:${recipientId}:${data.sender_name || senderRole}: New message: ${data.message.substring(0, 50)}`
    });

    return Response.json({ 
      success: true,
      recipientId,
      recipientRole
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});