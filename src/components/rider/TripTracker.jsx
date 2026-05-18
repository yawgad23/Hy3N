import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, MessageSquare, MapPin, Star, X, Navigation, Clock, Users, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import MoMoPaymentModal from "@/components/shared/MoMoPaymentModal";
import CardPaymentModal from "@/components/shared/CardPaymentModal";
import RideChatModal from "@/components/shared/RideChatModal";
import RatingModal from "@/components/shared/RatingModal";
import { useDriverTracking } from "@/hooks/useDriverTracking";

const STATUS_LABELS = {
  requested: "Finding your driver...",
  matched: "Driver assigned!",
  driver_arriving: "Driver is on the way",
  in_progress: "Trip in progress",
  completed: "Trip completed",
  cancelled: "Trip cancelled"
};



export default function TripTracker({ ride, onClose, onDriverPosUpdate, eta, splitFare }) {
  const [currentRide, setCurrentRide] = useState(ride);
  const [rating, setRating] = useState(0);
  const [showMoMoPayment, setShowMoMoPayment] = useState(false);
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  // Unread message counter for rider
  useEffect(() => {
    if (!ride?.id) return;
    const unsubscribe = base44.entities.RideMessage.subscribe((event) => {
      if (event.type === "create" && event.data?.ride_id === ride.id && event.data?.sender_role === "driver") {
        if (!showChat) setUnreadCount(prev => prev + 1);
      }
    });
    return () => unsubscribe();
  }, [ride?.id, showChat]);

  const openChat = () => { setShowChat(true); setUnreadCount(0); };

  // Rider-side live driver tracking
  const driverPos = useDriverTracking({
    isDriver: false,
    rideId: currentRide?.id,
    status: currentRide?.status,
  });

  // Bubble driver position up to RiderHome for the map
  useEffect(() => {
    if (driverPos && onDriverPosUpdate) onDriverPosUpdate(driverPos);
  }, [driverPos]);





  // Real-time ride status updates via subscription (handles auto-matching from backend)
  useEffect(() => {
    if (!ride?.id) return;
    const unsubscribe = base44.entities.Ride.subscribe((event) => {
      if (event.id === ride.id && (event.type === "update" || event.type === "create")) {
        setCurrentRide(event.data);
        // Auto-detect wallet payment completion
        if (event.data?.payment_status === "paid" && event.data?.payment_method === "wallet") {
          setPaid(true);
        }
      }
    });
    return unsubscribe;
  }, [ride?.id]);

  // Process wallet payment on mount if applicable
  useEffect(() => {
    if (!ride?.id || ride.payment_method !== "wallet" || ride.payment_status === "paid") return;
    processWalletPayment();
  }, [ride?.id, ride?.payment_method]);

  const processWalletPayment = async () => {
    try {
      const me = await base44.auth.me();
      const wallets = await base44.entities.Wallet.filter({ user_id: me.id });
      const wallet = wallets[0];
      
      if (!wallet || wallet.balance < (ride.final_fare || ride.fare_estimate)) {
        // Insufficient balance - will show payment UI
        return;
      }

      const amount = ride.final_fare || ride.fare_estimate;
      
      // Create wallet transaction
      await base44.entities.WalletTransaction.create({
        user_id: me.id,
        type: "ride_payment",
        amount: amount,
        balance_after: wallet.balance - amount,
        description: `Ride payment - ${ride.destination_address}`,
        ride_id: ride.id,
        status: "completed",
        reference: `HY3N-WALLET-${Date.now()}`
      });

      // Update wallet balance
      await base44.entities.Wallet.update(wallet.id, {
        balance: wallet.balance - amount,
        total_spent: (wallet.total_spent || 0) + amount
      });

      // Update ride payment status
      await base44.entities.Ride.update(ride.id, {
        payment_status: "paid",
        payment_reference: `WALLET-${ride.id}`
      });

      setPaid(true);
    } catch (error) {
      console.error("Wallet payment error:", error);
    }
  };

  const handleCancel = async () => {
    await base44.entities.Ride.update(currentRide.id, { status: "cancelled" });
    onClose();
  };

  const handleRate = async ({ rating: ratingValue, feedback }) => {
    await base44.entities.Ride.update(currentRide.id, {
      rider_rating: ratingValue,
      rider_feedback: feedback || "",
      rating: ratingValue // keep legacy field in sync
    });
    // Update driver's average rating
    if (currentRide.driver_id) {
      const driverProfiles = await base44.entities.DriverProfile.filter({ user_id: currentRide.driver_id });
      if (driverProfiles.length > 0) {
        const dp = driverProfiles[0];
        const allRides = await base44.entities.Ride.filter({ driver_id: currentRide.driver_id });
        const rated = allRides.filter((r) => r.rider_rating > 0);
        const avg = rated.reduce((sum, r) => sum + r.rider_rating, 0) / rated.length;
        await base44.entities.DriverProfile.update(dp.id, { rating: parseFloat(avg.toFixed(2)) });
      }
    }
    setShowRating(false);
    onClose();
  };

  const status = currentRide?.status || "requested";

  return (
    <>
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
              <div className="flex items-center gap-2">
                {eta !== null && (
                  <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{eta} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm font-medium text-primary">4.9</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl mb-4">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium">{currentRide.destination_address}</p>
              </div>
              <div className="text-right">
                <p className="font-heading font-bold text-primary">GH₵{currentRide.fare_estimate}</p>
                {splitFare && (
                  <p className="text-xs text-ghana-green">Split ÷{splitFare.totalPeople}</p>
                )}
              </div>
            </div>

            {splitFare && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-xl mb-4">
                <Users className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-primary">
                    Split with {splitFare.totalPeople - 1} friend{splitFare.totalPeople > 2 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">Your share: GH₵{splitFare.perPersonFare}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-4">
              <Button variant="outline" className="flex-1 h-12 border-border">
                <Phone className="w-4 h-4 mr-2" /> Call
              </Button>
              <Button variant="outline" className="flex-1 h-12 border-border relative" onClick={openChat}>
                <MessageSquare className="w-4 h-4 mr-2" /> Message
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
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

            {!paid && (
              <div className="space-y-3 mt-4">
                {currentRide.payment_method === "mobile_money" && (
                  <Button
                    onClick={() => setShowMoMoPayment(true)}
                    className="w-full bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-semibold gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    Pay GH₵{currentRide.final_fare || currentRide.fare_estimate} via MoMo
                  </Button>
                )}
                {currentRide.payment_method === "card" && (
                  <Button
                    onClick={() => setShowCardPayment(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay GH₵{currentRide.final_fare || currentRide.fare_estimate} with Card
                  </Button>
                )}
                {currentRide.payment_method === "wallet" && (
                  <div className="bg-ghana-green/10 border border-ghana-green/30 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-ghana-green">Paid with Wallet</p>
                    <p className="text-xs text-muted-foreground mt-1">Amount deducted from your wallet balance</p>
                  </div>
                )}
              </div>
            )}

            {(paid || currentRide.payment_method !== "mobile_money") && (
              <div className="space-y-3 mt-4">
                <Button
                  onClick={() => setShowRating(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold"
                >
                  <Star className="w-4 h-4 mr-2" /> Rate Your Driver
                </Button>
                <button onClick={onClose} className="w-full text-sm text-muted-foreground py-2">
                  Skip
                </button>
              </div>
            )}
          </div>
        )}

        <RideChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          rideId={currentRide?.id}
          currentUserId={currentUser?.id}
          currentUserRole="rider"
          currentUserName={currentUser?.full_name || "Rider"}
        />

        <MoMoPaymentModal
          isOpen={showMoMoPayment}
          onClose={() => setShowMoMoPayment(false)}
          amount={currentRide?.final_fare || currentRide?.fare_estimate || 0}
          rideId={currentRide?.id}
          riderId={currentRide?.rider_id}
          driverId={currentRide?.driver_id}
          onSuccess={() => setPaid(true)}
        />

        <CardPaymentModal
          isOpen={showCardPayment}
          onClose={() => setShowCardPayment(false)}
          amount={currentRide?.final_fare || currentRide?.fare_estimate || 0}
          rideId={currentRide?.id}
          riderId={currentRide?.rider_id}
          driverId={currentRide?.driver_id}
          onSuccess={() => setPaid(true)}
        />
      </div>
    </motion.div>

    <RatingModal
      isOpen={showRating}
      onClose={() => { setShowRating(false); onClose(); }}
      onSubmit={handleRate}
      raterRole="rider"
      targetName={currentRide?.driver_name}
    />
    </>
  );
}