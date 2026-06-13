import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

const PROVIDERS = [
  {
    id: "mtn",
    name: "MTN MoMo",
    color: "#FFCC00",
    textColor: "#1A1A1A",
    logo: "MTN"
  },
  {
    id: "vodafone",
    name: "Telecel Cash",
    color: "#E60000",
    textColor: "#FFFFFF",
    logo: "TCash"
  },
  {
    id: "airteltigo",
    name: "AirtelTigo",
    color: "#FF6600",
    textColor: "#FFFFFF",
    logo: "AT"
  }
];

export default function MoMoPaymentModal({ isOpen, onClose, amount, rideId, riderId, driverId, onSuccess }) {
  const [driverMoMo, setDriverMoMo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [txRef, setTxRef] = useState("");
  const [step, setStep] = useState("display"); // display | processing | success | failed
  const [loadingDriver, setLoadingDriver] = useState(true);

  useEffect(() => {
    if (isOpen && driverId) {
      setLoadingDriver(true);
      base44.entities.DriverProfile.filter({ user_id: driverId })
        .then(profiles => {
          if (profiles.length > 0) {
            setDriverMoMo({
              number: profiles[0].momo_number,
              provider: profiles[0].momo_provider,
              name: profiles[0].momo_name || profiles[0].full_name
            });
          }
          setLoadingDriver(false);
        })
        .catch(() => setLoadingDriver(false));
    }
  }, [isOpen, driverId]);

  const handleCopy = () => {
    if (!driverMoMo?.number) return;
    navigator.clipboard.writeText(driverMoMo.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!txRef) return;
    setStep("processing");

    try {
      // Record manual payment reference in database
      const payment = await base44.entities.Payment.create({
        ride_id: rideId,
        rider_id: riderId,
        driver_id: driverId,
        amount,
        method: "mobile_money",
        status: "completed",
        reference: txRef
      });

      // Update ride status to paid
      await base44.entities.Ride.update(rideId, { 
        payment_status: "paid",
        payment_reference: txRef
      });

      setStep("success");
      setTimeout(() => {
        onSuccess && onSuccess(payment);
        onClose();
        setStep("display");
        setTxRef("");
      }, 2500);
    } catch {
      setStep("failed");
    }
  };

  const providerInfo = PROVIDERS.find(p => p.id === driverMoMo?.provider) || PROVIDERS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step === "display" ? onClose : undefined}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 bg-card border-t border-border rounded-t-3xl z-50 max-w-md mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="p-5 pb-8">
              {/* Handle */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

              {loadingDriver && (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Fetching driver's payment details...</p>
                </div>
              )}

              {!loadingDriver && step === "display" && (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-heading font-bold text-lg">Direct Mobile Money Transfer</h3>
                    <button onClick={onClose}>
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Amount */}
                  <div className="bg-secondary rounded-xl p-4 mb-5 text-center">
                    <p className="text-muted-foreground text-sm">Send Exactly</p>
                    <p className="font-heading font-bold text-3xl text-primary mt-1">GH₵{amount?.toFixed(2)}</p>
                  </div>

                  {driverMoMo?.number ? (
                    <div className="bg-card border border-border rounded-xl p-4 mb-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Recipient Driver</p>
                          <p className="font-semibold text-sm">{driverMoMo.name}</p>
                        </div>
                        <div
                          className="px-2 py-1 rounded text-[10px] font-bold uppercase"
                          style={{ backgroundColor: providerInfo.color, color: providerInfo.textColor }}
                        >
                          {providerInfo.name}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">MoMo Phone Number</p>
                          <p className="font-mono font-bold text-lg text-foreground tracking-wider">{driverMoMo.number}</p>
                        </div>
                        <button
                          onClick={handleCopy}
                          className="p-2.5 bg-secondary hover:bg-secondary/80 rounded-xl transition-all"
                        >
                          {copied ? <Check className="w-4 h-4 text-ghana-green" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-5 text-center">
                      <p className="text-sm font-medium text-destructive">Driver payment details not available</p>
                      <p className="text-xs text-muted-foreground mt-1">Please ask the driver for their MoMo details directly or pay with Cash.</p>
                    </div>
                  )}

                  {driverMoMo?.number && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction Reference / ID</label>
                        <Input
                          placeholder="Enter MoMo transaction ID/Ref"
                          value={txRef}
                          onChange={(e) => setTxRef(e.target.value)}
                          className="bg-secondary border-none h-12 text-foreground text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Please transfer GH₵{amount?.toFixed(2)} to the number above, then enter the Transaction ID/Reference to confirm.
                        </p>
                      </div>

                      <Button
                        onClick={handleConfirmPayment}
                        disabled={!txRef}
                        className="w-full h-14 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold text-base rounded-xl disabled:opacity-40"
                      >
                        Confirm Transfer
                      </Button>
                    </div>
                  )}
                </>
              )}

              {step === "processing" && (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-5 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg">Verifying Reference</h3>
                  <p className="text-muted-foreground text-sm mt-2">Recording your direct MoMo payment...</p>
                </div>
              )}

              {step === "success" && (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-ghana-green/20 mx-auto mb-5 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-ghana-green" />
                  </div>
                  <h3 className="font-heading font-bold text-lg">Payment Confirmed!</h3>
                  <p className="text-muted-foreground text-sm mt-2">GH₵{amount?.toFixed(2)} successfully sent directly to driver.</p>
                </div>
              )}

              {step === "failed" && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-destructive/20 mx-auto mb-5 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                  </div>
                  <h3 className="font-heading font-bold text-lg">Confirmation Failed</h3>
                  <p className="text-muted-foreground text-sm mt-2">We couldn't submit your reference. Please try again.</p>
                  <div className="flex gap-3 mt-6">
                    <Button onClick={() => setStep("display")} className="flex-1 bg-primary text-primary-foreground">Try Again</Button>
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
