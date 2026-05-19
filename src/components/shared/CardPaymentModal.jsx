import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function CardPaymentModal({ isOpen, onClose, amount, rideId, riderId, driverId, onSuccess }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Push history entry so back button closes the modal
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ modal: "card-payment" }, "");
    const onPop = () => onClose();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);

    // Basic validation
    if (!cardNumber || !expiry || !cvv) {
      setError("Please fill in all card details");
      setProcessing(false);
      return;
    }

    try {
      const response = await base44.functions.invoke("processCardPayment", {
        card_token: `tok_${cardNumber.replace(/\s/g, "")}`,
        amount,
        ride_id: rideId,
        rider_id: riderId,
        driver_id: driverId
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(response.data);
          resetForm();
        }, 2000);
      } else {
        setError(response.data.error || "Payment failed");
      }
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setError(null);
    setSuccess(false);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 border border-border"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", overflow: "auto" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Card Payment</h3>
              <p className="text-xs text-muted-foreground">Secure payment via Stripe</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ghana-green/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-ghana-green" />
            </div>
            <h4 className="font-heading font-bold text-lg mb-2">Payment Successful!</h4>
            <p className="text-sm text-muted-foreground">Your ride has been paid for</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-secondary rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-heading font-bold text-2xl">GH₵{amount.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Card Number</label>
              <Input
                type="text"
                placeholder="1234 5678 1234 5678"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Expiry Date</label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">CVV</label>
                <Input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  className="bg-background border-border"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={processing}
              className="w-full h-12 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-semibold"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Pay GH₵${amount.toFixed(2)}`
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Your card information is secure and encrypted
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}