import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, AlertCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

const PROVIDERS = [
  {
    id: "mtn",
    name: "MTN MoMo",
    color: "#FFCC00",
    textColor: "#1A1A1A",
    prefix: ["024", "054", "055", "059"],
    logo: "MTN"
  },
  {
    id: "vodafone",
    name: "Telecel Cash",
    color: "#E60000",
    textColor: "#FFFFFF",
    prefix: ["020", "050"],
    logo: "TCash"
  },
  {
    id: "airteltigo",
    name: "AirtelTigo",
    color: "#FF6600",
    textColor: "#FFFFFF",
    prefix: ["026", "056", "027", "057"],
    logo: "AT"
  }
];

function detectProvider(phone) {
  const clean = phone.replace(/\s/g, "").replace(/^\+233/, "0");
  return PROVIDERS.find(p => p.prefix.some(pfx => clean.startsWith(pfx))) || null;
}

export default function MoMoPaymentModal({ isOpen, onClose, amount, rideId, riderId, driverId, onSuccess }) {
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState(null);
  const [step, setStep] = useState("input"); // input | processing | success | failed
  const [manualProvider, setManualProvider] = useState(null);

  const activeProvider = manualProvider || provider;

  const handlePhoneChange = (val) => {
    setPhone(val);
    setProvider(detectProvider(val));
    setManualProvider(null);
  };

  const handlePay = async () => {
    if (!phone || !activeProvider) return;
    setStep("processing");

    try {
      const result = await base44.functions.invoke("processMoMoPayment", {
        phone,
        provider: activeProvider.id,
        amount,
        ride_id: rideId,
        rider_id: riderId,
        driver_id: driverId
      });

      if (result.data?.success) {
        setStep("success");
        setTimeout(() => {
          onSuccess && onSuccess(result.data);
          onClose();
          setStep("input");
          setPhone("");
        }, 2500);
      } else {
        setStep("failed");
      }
    } catch {
      setStep("failed");
    }
  };

  const reset = () => {
    setStep("input");
    setPhone("");
    setProvider(null);
    setManualProvider(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step === "input" ? onClose : undefined}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 bg-card border-t border-border rounded-t-3xl z-50"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="p-5 pb-8">
              {/* Handle */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

              {step === "input" && (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-heading font-bold text-lg">Pay with Mobile Money</h3>
                    <button onClick={onClose}>
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Amount */}
                  <div className="bg-secondary rounded-xl p-4 mb-5 text-center">
                    <p className="text-muted-foreground text-sm">Total Amount</p>
                    <p className="font-heading font-bold text-3xl text-primary mt-1">GH₵{amount?.toFixed(2)}</p>
                  </div>

                  {/* Provider selector */}
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Select Provider</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {PROVIDERS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setManualProvider(p)}
                        className={`rounded-xl p-3 border-2 transition-all ${
                          activeProvider?.id === p.id ? "border-primary scale-105" : "border-border"
                        }`}
                        style={{ backgroundColor: p.color + "20" }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center text-[10px] font-bold"
                          style={{ backgroundColor: p.color, color: p.textColor }}
                        >
                          {p.logo}
                        </div>
                        <p className="text-[10px] font-medium text-center leading-tight">{p.name}</p>
                      </button>
                    ))}
                  </div>

                  {/* Phone */}
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Mobile Number</p>
                  <div className="relative mb-5">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <span className="text-sm font-medium text-muted-foreground">🇬🇭 +233</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="024 000 0000"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="pl-20 bg-secondary border-none h-12 text-foreground"
                      maxLength={12}
                    />
                    {activeProvider && (
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ backgroundColor: activeProvider.color, color: activeProvider.textColor }}
                      >
                        {activeProvider.logo}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handlePay}
                    disabled={!phone || !activeProvider}
                    className="w-full h-14 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold text-base rounded-xl disabled:opacity-40"
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    Pay GH₵{amount?.toFixed(2)} via {activeProvider?.name || "MoMo"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    You will receive a prompt on your phone to confirm payment
                  </p>
                </>
              )}

              {step === "processing" && (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                    style={{ backgroundColor: (activeProvider?.color || "#FFCC00") + "20" }}
                  >
                    <Loader2 className="w-10 h-10 animate-spin" style={{ color: activeProvider?.color || "#FFCC00" }} />
                  </div>
                  <h3 className="font-heading font-bold text-lg">Processing Payment</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    Approve the prompt on <span className="font-semibold text-foreground">{phone}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">via {activeProvider?.name}</p>
                </div>
              )}

              {step === "success" && (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-ghana-green/20 mx-auto mb-5 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-ghana-green" />
                  </div>
                  <h3 className="font-heading font-bold text-lg">Payment Successful!</h3>
                  <p className="text-muted-foreground text-sm mt-2">GH₵{amount?.toFixed(2)} paid via {activeProvider?.name}</p>
                </div>
              )}

              {step === "failed" && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-destructive/20 mx-auto mb-5 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                  </div>
                  <h3 className="font-heading font-bold text-lg">Payment Failed</h3>
                  <p className="text-muted-foreground text-sm mt-2">The payment could not be processed. Please try again.</p>
                  <div className="flex gap-3 mt-6">
                    <Button onClick={reset} className="flex-1 bg-primary text-primary-foreground">Try Again</Button>
                    <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}