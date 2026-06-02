import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { phone, provider, amount, ride_id, rider_id, driver_id } = body;

    if (!phone || !provider || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const PAYSTACK_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

    // If Paystack key is configured, use real API
    if (PAYSTACK_KEY) {
      const providerMap = { mtn: "mtn", vodafone: "vod", airteltigo: "tgo" };
      const clean = phone.replace(/\s/g, "").replace(/^\+?233/, "").replace(/^0/, "");
      const fullPhone = "233" + clean;

      const paystackRes = await fetch("https://api.paystack.co/charge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // kobo/pesewas
          currency: "GHS",
          mobile_money: {
            phone: fullPhone,
            provider: providerMap[provider] || "mtn"
          },
          email: user.email || `${fullPhone}@hy3n.gh`
        })
      });

      const paystackData = await paystackRes.json();

      if (!paystackData.status) {
        return Response.json({ success: false, error: paystackData.message }, { status: 400 });
      }

      // Record payment
      const paymentData: any = {
        rider_id: rider_id || user.id,
        amount,
        method: "mobile_money",
        status: "completed",
        reference: paystackData.data?.reference || ""
      };
      
      if (ride_id) paymentData.ride_id = ride_id;
      if (driver_id) paymentData.driver_id = driver_id;

      const payment = await base44.asServiceRole.entities.Payment.create(paymentData);

      // Update ride status to paid if it's a ride payment
      if (ride_id) {
        await base44.asServiceRole.entities.Ride.update(ride_id, { 
          status: "completed",
          payment_status: "paid",
          payment_reference: payment.reference
        });
      }

      return Response.json({ success: true, reference: paystackData.data?.reference, payment_id: payment.id });
    }

    // Simulated payment (no API key) — for demo/testing
    await new Promise(r => setTimeout(r, 2500));

    const reference = `HY3N-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

    const paymentData: any = {
      rider_id: rider_id || user.id,
      amount,
      method: "mobile_money",
      status: "completed",
      reference
    };

    if (ride_id) paymentData.ride_id = ride_id;
    if (driver_id) paymentData.driver_id = driver_id;

    const payment = await base44.asServiceRole.entities.Payment.create(paymentData);

    // Update ride status to paid if it's a ride payment
    if (ride_id) {
      await base44.asServiceRole.entities.Ride.update(ride_id, { 
        status: "completed",
        payment_status: "paid",
        payment_reference: payment.reference
      });
    }

    return Response.json({ success: true, reference, simulated: true, payment_id: payment.id });

  } catch (error) {
    console.error("MoMo payment function error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
