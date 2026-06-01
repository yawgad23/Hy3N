import { useState } from "react";
import { X, MapPin, Clock, Route, CreditCard, Download, Share2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function TripReceipt({ ride, onClose, onRate }) {
  const [sharing, setSharing] = useState(false);

  if (!ride) return null;

  const tripDate = ride.completed_at || ride.updated_at || new Date().toISOString();
  const baseFare = ride.fare_estimate || 0;
  const waitingFee = ride.waiting_fee || 0;
  const tip = ride.tip_amount || 0;
  const promoDiscount = ride.promo_discount || 0;
  const totalFare = ride.final_fare || (baseFare + waitingFee + tip - promoDiscount);

  const paymentMethodLabels = {
    mobile_money: "MoMo",
    cash: "Cash",
    card: "Card",
    wallet: "Wallet"
  };

  const handleShare = async () => {
    setSharing(true);
    const receiptText = `HY3N Ride Receipt\n\nFrom: ${ride.pickup_address}\nTo: ${ride.destination_address}\nDate: ${format(new Date(tripDate), "MMM d, yyyy 'at' h:mm a")}\nFare: GH₵${totalFare.toFixed(2)}\nPayment: ${paymentMethodLabels[ride.payment_method] || ride.payment_method}\n\nThank you for riding with HY3N!`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: "HY3N Ride Receipt",
          text: receiptText
        });
      } else {
        await navigator.clipboard.writeText(receiptText);
        alert("Receipt copied to clipboard!");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
    setSharing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-card rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg">Trip Receipt</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Trip Summary */}
          <div className="text-center py-3">
            <p className="text-3xl font-heading font-bold text-primary">GH₵{totalFare.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(tripDate), "EEEE, MMM d 'at' h:mm a")}
            </p>
          </div>

          {/* Route */}
          <div className="bg-secondary rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="w-3 h-3 rounded-full border-2 border-ghana-green bg-ghana-green/20" />
                <div className="w-0.5 h-8 bg-border" />
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pickup</p>
                  <p className="text-sm font-medium">{ride.pickup_address || "Current Location"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Drop-off</p>
                  <p className="text-sm font-medium">{ride.destination_address || "Destination"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <Route className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm font-bold">{ride.distance_km?.toFixed(1) || "—"} km</p>
              <p className="text-[10px] text-muted-foreground">Distance</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm font-bold">{ride.duration_min || "—"} min</p>
              <p className="text-[10px] text-muted-foreground">Duration</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <CreditCard className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm font-bold">{paymentMethodLabels[ride.payment_method] || "Cash"}</p>
              <p className="text-[10px] text-muted-foreground">Payment</p>
            </div>
          </div>

          {/* Fare Breakdown */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Fare Breakdown</p>
            <div className="bg-secondary rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base fare ({ride.category || "standard"})</span>
                <span className="font-medium">GH₵{baseFare.toFixed(2)}</span>
              </div>
              {waitingFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Waiting fee</span>
                  <span className="font-medium text-amber-500">GH₵{waitingFee.toFixed(2)}</span>
                </div>
              )}
              {promoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Promo discount</span>
                  <span className="font-medium text-ghana-green">-GH₵{promoDiscount.toFixed(2)}</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tip</span>
                  <span className="font-medium">GH₵{tip.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-heading font-bold text-sm">Total</span>
                <span className="font-heading font-bold text-primary">GH₵{totalFare.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          {ride.driver_name && (
            <div className="flex items-center gap-3 bg-secondary rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{ride.driver_name?.charAt(0) || "D"}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{ride.driver_name}</p>
                <p className="text-xs text-muted-foreground">{ride.vehicle_info || ride.category}</p>
              </div>
              {onRate && (
                <button
                  onClick={onRate}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold"
                >
                  <Star className="w-3.5 h-3.5" />
                  Rate
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleShare}
            disabled={sharing}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
