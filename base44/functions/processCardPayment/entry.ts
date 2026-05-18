import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { card_token, amount, ride_id, rider_id, driver_id } = await req.json();

    if (!amount || !ride_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY");

    // If Stripe key is configured, use real API
    if (STRIPE_KEY) {
      const stripeRes = await fetch("https://api.stripe.com/v1/charges", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          amount: Math.round(amount * 100), // cents
          currency: "ghs",
          source: card_token,
          description: `HY3N Ride Payment - ${ride_id}`,
          metadata: JSON.stringify({ ride_id, rider_id: rider_id || user.id })
        })
      });

      const stripeData = await stripeRes.json();

      if (!stripeRes.ok || stripeData.error) {
        return Response.json({ success: false, error: stripeData.error?.message }, { status: 400 });
      }

      // Record payment
      const payment = await base44.asServiceRole.entities.Payment.create({
        ride_id,
        rider_id: rider_id || user.id,
        driver_id,
        amount,
        method: "card",
        status: "completed",
        reference: stripeData.id || ""
      });

      // Update ride status to paid
      await base44.asServiceRole.entities.Ride.update(ride_id, { 
        status: "completed",
        payment_status: "paid",
        payment_reference: payment.reference
      });

      return Response.json({ success: true, reference: stripeData.id, payment_id: payment.id });
    }

    // Simulated payment (no API key) — for demo/testing
    await new Promise(r => setTimeout(r, 2000));

    const reference = `CARD-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

    const payment = await base44.asServiceRole.entities.Payment.create({
      ride_id,
      rider_id: rider_id || user.id,
      driver_id,
      amount,
      method: "card",
      status: "completed",
      reference
    });

    // Update ride status to paid
    await base44.asServiceRole.entities.Ride.update(ride_id, { 
      status: "completed",
      payment_status: "paid",
      payment_reference: payment.reference
    });

    return Response.json({ success: true, reference, simulated: true, payment_id: payment.id });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});