import { useState } from "react";
import { motion } from "framer-motion";
import { X, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const TIP_PRESETS = [5, 10, 15, 20];

export default function TipModal({ isOpen, onClose, rideId, baseFare, onSuccess }) {
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const tipAmount = selectedTip === "custom" ? parseFloat(customTip) || 0 : selectedTip || 0;
  const total = baseFare + tipAmount;

  const handleAddTip = async () => {
    if (!tipAmount || tipAmount <= 0) {
      toast.error("Please enter a valid tip amount");
      return;
    }

    setLoading(true);
    try {
      // baseFare already includes waiting fee (final_fare = fare_estimate + waiting_fee)
      await base44.entities.Ride.update(rideId, {
        tip_amount: tipAmount,
        final_fare: baseFare + tipAmount
      });

      toast.success("Tip added successfully!");
      onSuccess(tipAmount);
      onClose();
    } catch (error) {
      toast.error("Failed to add tip");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card w-full max-w-md rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-bold text-lg">Add a Tip</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Show your appreciation for your driver's service
        </p>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {TIP_PRESETS.map((amount) => (
            <button
              key={amount}
              onClick={() => setSelectedTip(amount)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedTip === amount
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary"
              }`}
            >
              <p className="text-xs text-muted-foreground mb-1">GH₵</p>
              <p className={`font-heading font-bold text-lg ${selectedTip === amount ? "text-primary" : "text-foreground"}`}>
                {amount}
              </p>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <button
            onClick={() => setSelectedTip("custom")}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
              selectedTip === "custom"
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary"
            }`}
          >
            <DollarSign className={`w-5 h-5 ${selectedTip === "custom" ? "text-primary" : "text-muted-foreground"}`} />
            <div className="flex-1 text-left">
              <p className={`text-sm font-medium ${selectedTip === "custom" ? "text-primary" : "text-foreground"}`}>
                Custom Amount
              </p>
            </div>
          </button>

          {selectedTip === "custom" && (
            <input
              type="number"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              placeholder="Enter amount"
              className="mt-3 w-full p-4 bg-secondary border border-border rounded-xl text-foreground font-heading font-bold"
              autoFocus
            />
          )}
        </div>

        {tipAmount > 0 && (
          <div className="mb-6 p-4 bg-secondary rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Fare</span>
              <span className="font-medium">GH₵{baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tip</span>
              <span className="font-medium text-ghana-green">GH₵{tipAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-heading font-bold text-lg text-primary">GH₵{total.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleAddTip}
          disabled={!tipAmount || tipAmount <= 0 || loading}
          className="w-full h-14 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold text-lg rounded-xl"
        >
          {loading ? "Processing..." : `Add Tip GH₵${tipAmount.toFixed(2)}`}
        </Button>
      </motion.div>
    </motion.div>
  );
}