import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { phone, provider, amount, driver_id } = await req.json();

    if (!phone || !provider || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const PAYSTACK_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    const reference = `WD-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

    if (PAYSTACK_KEY) {
      const providerMap = { mtn: "mtn", vodafone: "vod", airteltigo: "tgo" };
      const clean = phone.replace(/\s/g, "").replace(/^\+?233/, "").replace(/^0/, "");
      const fullPhone = "233" + clean;

      // Create transfer recipient
      const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "mobile_money",
          name: user.full_name || "HY3N Driver",
          account_number: fullPhone,
          bank_code: providerMap[provider] || "mtn",
          currency: "GHS"
        })
      });

      const recipientData = await recipientRes.json();
      if (!recipientData.status) {
        return Response.json({ success: false, error: recipientData.message }, { status: 400 });
      }

      const transferRes = await fetch("https://api.paystack.co/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: "balance",
          amount: Math.round(amount * 100),
          currency: "GHS",
          recipient: recipientData.data.recipient_code,
          reason: "HY3N Earnings Withdrawal"
        })
      });

      const transferData = await transferRes.json();
      if (!transferData.status) {
        return Response.json({ success: false, error: transferData.message }, { status: 400 });
      }

      await base44.asServiceRole.entities.Withdrawal.create({
        driver_id: driver_id || user.id,
        amount,
        method: "mobile_money",
        phone_number: phone,
        status: "processing",
        reference: transferData.data?.reference || reference
      });

      return Response.json({ success: true, reference: transferData.data?.reference });
    }

    // Simulated withdrawal
    await new Promise(r => setTimeout(r, 2000));

    await base44.asServiceRole.entities.Withdrawal.create({
      driver_id: driver_id || user.id,
      amount,
      method: `mobile_money_${provider}`,
      phone_number: phone,
      status: "processing",
      reference
    });

    return Response.json({ success: true, reference, simulated: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});