import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { phone, provider, amount, ride_id, rider_id, driver_id } = await req.json();

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
      await base44.asServiceRole.entities.Payment.create({
        ride_id,
        rider_id: rider_id || user.id,
        driver_id,
        amount,
        method: "mobile_money",
        status: "completed",
        reference: paystackData.data?.reference || ""
      });

      return Response.json({ success: true, reference: paystackData.data?.reference });
    }

    // Simulated payment (no API key) — for demo/testing
    await new Promise(r => setTimeout(r, 2500));

    const reference = `HY3N-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

    await base44.asServiceRole.entities.Payment.create({
      ride_id,
      rider_id: rider_id || user.id,
      driver_id,
      amount,
      method: "mobile_money",
      status: "completed",
      reference
    });

    return Response.json({ success: true, reference, simulated: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});