import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ride_id, report_type, category, description, severity } = body;

    if (!ride_id || !report_type || !category || !description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get ride details to get driver_id
    const rides = await base44.entities.Ride.filter({ id: ride_id });
    if (rides.length === 0) {
      return Response.json({ error: 'Ride not found' }, { status: 404 });
    }

    const ride = rides[0];

    // Create the report
    const report = await base44.entities.RideReport.create({
      ride_id,
      rider_id: user.id,
      driver_id: ride.driver_id,
      report_type,
      category,
      description,
      severity: severity || 'medium'
    });

    // Send notification to admins
    try {
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
      for (const admin of admins) {
        await base44.integrations.Core.SendEmail({
          to: admin.email,
          subject: `New Ride Report - ${report_type.replace('_', ' ').toUpperCase()}`,
          body: `A new ride report has been submitted:\n\nRide ID: ${ride_id}\nRider: ${user.full_name}\nDriver: ${ride.driver_name || 'Unknown'}\nType: ${report_type}\nCategory: ${category}\nSeverity: ${severity || 'medium'}\n\nDescription: ${description}\n\nPlease review in the admin dashboard.`
        });
      }
    } catch (emailErr) {
      console.error('Failed to send email notification:', emailErr);
    }

    return Response.json({ success: true, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});