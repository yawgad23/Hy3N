import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Emergency contact number — set SOS_EMERGENCY_PHONE in your environment secrets
const EMERGENCY_PHONE = Deno.env.get("SOS_EMERGENCY_PHONE") || "";
// Twilio credentials — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_PHONE in secrets
const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") || "";
const TWILIO_FROM = Deno.env.get("TWILIO_FROM_PHONE") || "";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lat, lng, role, ride_id } = await req.json();

    // Validate role parameter - only allow valid roles
    const allowedRoles = ["rider", "driver"];
    const userRole = allowedRoles.includes(role) ? role : "rider";

    // Validate that the user is associated with the ride (if ride_id provided)
    if (ride_id) {
      try {
        const rides = await base44.entities.Ride.filter({ id: ride_id });
        if (rides.length > 0) {
          const ride = rides[0];
          // Ensure the user is either the rider or the driver of this ride
          if (ride.rider_id !== user.id && ride.driver_id !== user.id) {
            return Response.json({ error: "Forbidden: You are not part of this ride" }, { status: 403 });
          }
        }
      } catch (rideErr) {
        // If ride lookup fails, still allow SOS (safety takes priority) but log it
        console.warn(`SOS: Could not verify ride ${ride_id} for user ${user.id}:`, rideErr.message);
      }
    }

    // Validate coordinates
    const validLat = typeof lat === 'number' && lat >= -90 && lat <= 90 ? lat : null;
    const validLng = typeof lng === 'number' && lng >= -180 && lng <= 180 ? lng : null;

    // Build a Google Maps link
    const mapsLink = validLat && validLng
      ? `https://maps.google.com/?q=${validLat},${validLng}`
      : "Location unavailable";

    // Log the incident using asServiceRole (required to bypass RLS for incident creation)
    // This is acceptable because we've already authenticated the user above
    const incident = await base44.asServiceRole.entities.SosIncident.create({
      user_id: user.id,
      user_name: user.full_name || user.email,
      user_role: userRole,
      ride_id: ride_id || null,
      lat: validLat,
      lng: validLng,
      address: validLat && validLng ? `${validLat.toFixed(5)}, ${validLng.toFixed(5)}` : "Unknown",
      status: "active",
      sms_sent: false
    });

    let smsSent = false;

    // Send SMS via Twilio if configured
    if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM && EMERGENCY_PHONE) {
      const body = `🚨 SOS ALERT from HY3N!\nUser: ${user.full_name || user.email} (${userRole})\nLocation: ${mapsLink}\nTime: ${new Date().toISOString()}`;
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
      const credentials = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
      const formData = new URLSearchParams();
      formData.append("From", TWILIO_FROM);
      formData.append("To", EMERGENCY_PHONE);
      formData.append("Body", body);

      const smsRes = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });

      smsSent = smsRes.ok;
      await base44.asServiceRole.entities.SosIncident.update(incident.id, { sms_sent: smsSent });
    }

    return Response.json({ success: true, incident_id: incident.id, sms_sent: smsSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
