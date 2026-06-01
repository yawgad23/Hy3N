import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CANCEL_REASONS = [
  { id: "wait_too_long", label: "Driver is taking too long" },
  { id: "wrong_address", label: "I entered wrong address" },
  { id: "change_of_plans", label: "Change of plans" },
  { id: "found_other_ride", label: "Found another ride" },
  { id: "driver_asked", label: "Driver asked me to cancel" },
  { id: "price_too_high", label: "Price is too high" },
  { id: "safety_concern", label: "Safety concern" },
  { id: "other", label: "Other reason" },
];

export default function CancelRideModal({ isOpen, onClose, onConfirm, rideStatus }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Determine if cancellation fee applies (after driver is matched/arriving)
  const hasFee = rideStatus === "matched" || rideStatus === "driver_arriving";
  const cancellationFee = hasFee ? 5.00 : 0; // GH₵5 fee if driver already assigned

  const handleConfirm = async () => {
    if (!selectedReason) return;
    setLoading(true);
    try {
      await onConfirm(selectedReason, cancellationFee);
    } finally {
      setLoading(false);
      setSelectedReason(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-card rounded-t-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-heading font-bold text-lg">Cancel Ride?</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Fee Warning */}
          {hasFee && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-500">Cancellation fee applies</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A driver has already been assigned. A fee of <span className="font-bold">GH₵{cancellationFee.toFixed(2)}</span> will be charged.
                </p>
              </div>
            </div>
          )}

          {/* Reason Selection */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Please select a reason:</p>
            <div className="space-y-2">
              {CANCEL_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                    selectedReason === reason.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedReason === reason.id ? "border-primary" : "border-muted-foreground/40"
                  }`}>
                    {selectedReason === reason.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{reason.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Keep Ride
          </Button>
          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={handleConfirm}
            disabled={!selectedReason || loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Cancel Ride{hasFee ? ` (GH₵${cancellationFee.toFixed(2)})` : ""}</>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
