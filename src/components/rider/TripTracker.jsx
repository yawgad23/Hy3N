import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, MessageSquare, MapPin, Star, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import MoMoPaymentModal from "@/components/shared/MoMoPaymentModal";

const STATUS_LABELS = {
  requested: "Finding your driver...",
  matched: "Driver assigned!",
  driver_arriving: "Driver is on the way",
  in_progress: "Trip in progress",
  completed: "Trip completed",
  cancelled: "Trip cancelled"
};

export default function TripTracker({ ride, onClose }) {
  const [currentRide, setCurrentRide] = useState(ride);
  const [rating, setRating] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!ride?.id) return;
    const interval = setInterval(async () => {
      const rides = await base44.entities.Ride.filter({ id: ride.id });
      if (rides.length > 0) setCurrentRide(rides[0]);
    }, 5000);
    return () => clearInterval(interval);
  }, [ride?.id]);

  // Simulate driver matching
  useEffect(() => {
    if (currentRide?.status === "requested") {
      const timer = setTimeout(async () => {
        await base44.entities.Ride.update(currentRide.id, {
          status: "matched",
          driver_name: "Kwame Asante",
          driver_id: "demo_driver"
        });
        setCurrentRide(prev => ({ ...prev, status: "matched", driver_name: "Kwame Asante" }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentRide?.status]);

  const handleCancel = async () => {
    await base44.entities.Ride.update(currentRide.id, { status: "cancelled" });
    onClose();
  };

  const handleRate = async () => {
    if (rating > 0) {
      await base44.entities.Ride.update(currentRide.id, { rating, status: "completed" });
      onClose();
    }
  };

  const status = currentRide?.status || "requested";

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 bg-card border-t border-border rounded-t-3xl z-40"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
    >
      <div className="p-5">
        {status === "requested" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-3 border-primary border-t-transparent animate-spin" />
            <h3 className="font-heading font-bold text-lg">{STATUS_LABELS[status]}</h3>
            <p className="text-muted-foreground text-sm mt-1">This usually takes 30 seconds</p>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="mt-6 border-destructive text-destructive"
            >
              Cancel Request
            </Button>
          </div>
        )}

        {(status === "matched" || status === "driver_arriving" || status === "in_progress") && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-ghana-green font-medium uppercase tracking-wider">
                  {STATUS_LABELS[status]}
                </p>
                <h3 className="font-heading font-bold text-lg mt-1">
                  {currentRide.driver_name || "Your Driver"}
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-sm font-medium text-primary">4.9</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl mb-4">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium">{currentRide.destination_address}</p>
              </div>
              <p className="font-heading font-bold text-primary">GH₵{currentRide.fare_estimate}</p>
            </div>

            <div className="flex gap-3 mb-4">
              <Button variant="outline" className="flex-1 h-12 border-border">
                <Phone className="w-4 h-4 mr-2" /> Call
              </Button>
              <Button variant="outline" className="flex-1 h-12 border-border">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </Button>
            </div>

            {status !== "in_progress" && (
              <Button onClick={handleCancel} variant="ghost" className="w-full text-destructive">
                Cancel Ride
              </Button>
            )}
          </div>
        )}

        {status === "completed" && (
          <div className="text-center py-6">
            <Navigation className="w-12 h-12 text-ghana-green mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg">Trip Complete!</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Total: GH₵{currentRide.final_fare || currentRide.fare_estimate}
            </p>

            {!paid && currentRide.payment_method === "mobile_money" && (
              <Button
                onClick={() => setShowPayment(true)}
                className="mt-4 w-full bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-semibold"
              >
                Pay GH₵{currentRide.final_fare || currentRide.fare_estimate} via MoMo
              </Button>
            )}

            {(paid || currentRide.payment_method !== "mobile_money") && (
              <>
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)}>
                      <Star className={`w-8 h-8 ${star <= rating ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleRate}
                  className="mt-4 bg-ghana-green hover:bg-ghana-green/90 text-white"
                  disabled={rating === 0}
                >
                  Submit Rating
                </Button>
              </>
            )}
          </div>
        )}

        <MoMoPaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          amount={currentRide?.final_fare || currentRide?.fare_estimate || 0}
          rideId={currentRide?.id}
          riderId={currentRide?.rider_id}
          driverId={currentRide?.driver_id}
          onSuccess={() => setPaid(true)}
        />
      </div>
    </motion.div>
  );
}