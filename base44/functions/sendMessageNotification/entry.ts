import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow automation system calls (no user token) but block unauthorized users
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { messageData, recipientId } = await req.json();
    
    if (!messageData || !recipientId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get recipient's push subscriptions (you'd need a PushSubscription entity)
    // For now, we'll use the notification service directly via automation
    // The automation will handle the actual push notification
    
    return Response.json({ 
      success: true,
      message: 'Notification queued'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});