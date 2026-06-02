import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const QUICK_AMOUNTS = [10, 20, 50, 100, 200];

export default function WalletTopUpModal({ isOpen, onClose, onSuccess, currentBalance }) {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("mtn");
  const [step, setStep] = useState("input"); // input | processing | success
  const [error, setError] = useState("");

  const handleTopUp = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) { setError("Enter a valid amount (min GH₵1)"); return; }
    if (!phone || phone.length < 10) { setError("Enter a valid phone number"); return; }
    setError("");
    setStep("processing");

    try {
      const res = await base44.functions.invoke("processMoMoPayment", {
        amount: amt,
        phone: phone,
        provider: provider,
        reference: `WALLET-${Date.now()}`,
        description: "HY3N Wallet Top-Up"
      });

      if (res.data?.success || res.data?.status === "success") {
        // Record the top-up transaction
        const me = await base44.auth.me();
        const wallets = await base44.entities.Wallet.filter({ user_id: me.id });
        let wallet = wallets[0];
        const newBalance = (wallet?.balance || 0) + amt;

        if (wallet) {
          await base44.entities.Wallet.update(wallet.id, {
            balance: newBalance,
            total_topped_up: (wallet.total_topped_up || 0) + amt
          });
        } else {
          wallet = await base44.entities.Wallet.create({
            user_id: me.id,
            balance: newBalance,
            total_topped_up: amt,
            total_spent: 0
          });
        }

        await base44.entities.WalletTransaction.create({
          user_id: me.id,
          type: "top_up",
          amount: amt,
          balance_after: newBalance,
          description: `Top-up via Mobile Money (${phone})`,
          status: "completed",
          reference: `WALLET-${Date.now()}`
        });

        setStep("success");
        onSuccess(newBalance);
      } else {
        setError(res.data?.error || "Payment failed. Please try again.");
        setStep("input");
      }
    } catch (err) {
      console.error("Top-up error:", err);
      setError("An error occurred. Please check your connection.");
      setStep("input");
    }
  };

  const handleClose = () => {
    setStep("input");
    setAmount("");
    setPhone("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <motion.div
          className="absolute inset-0 bg-black/60"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
        />
        <motion.div
          className="relative w-full max-w-lg bg-card border-t border-border rounded-t-3xl p-5 z-10"
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-bold text-lg">Top Up Wallet</h3>
            </div>
            <button onClick={handleClose}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>

          {step === "input" && (
            <>
              <div className="bg-secondary rounded-xl p-3 mb-5 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Balance</span>
                <span className="font-heading font-bold text-primary text-lg">GH₵{(currentBalance || 0).toFixed(2)}</span>
              </div>

              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Quick Amounts</p>
              <div className="flex gap-2 mb-5">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${
                      amount === String(a) ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-foreground"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Amount (GH₵)</p>
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary mb-4"
              />

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Provider</p>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none"
                  >
                    <option value="mtn">MTN</option>
                    <option value="vodafone">Telecel</option>
                    <option value="airteltigo">AT</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">MoMo Number</p>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="0241234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-destructive mb-3">{error}</p>}

              <Button
                onClick={handleTopUp}
                disabled={!amount || !phone}
                className="w-full h-12 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold rounded-xl"
              >
                Top Up GH₵{amount || "0"}
              </Button>
            </>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-heading font-semibold">Processing Payment...</p>
              <p className="text-sm text-muted-foreground text-center">Please approve the MoMo prompt on your phone</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-10 gap-4">
              <CheckCircle2 className="w-14 h-14 text-ghana-green" />
              <p className="font-heading font-bold text-xl">Top-Up Successful!</p>
              <p className="text-sm text-muted-foreground">GH₵{amount} added to your wallet</p>
              <Button onClick={handleClose} className="w-full h-12 bg-primary rounded-xl font-heading font-bold">
                Done
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
