import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Banknote, CreditCard, Wallet, MapPin, Navigation, CalendarClock, Zap, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RIDE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import RideCategoryCard from "./RideCategoryCard";
import SplitFareModal from "./SplitFareModal";
import { format, addMinutes } from "date-fns";
import { base44 } from "@/api/base44Client";

const paymentIcons = {
  Smartphone: Smartphone,
  Banknote: Banknote,
  CreditCard: CreditCard,
  Wallet: Wallet
};

// Min scheduled time: 30 min from now
function minDateTime() {
  return format(addMinutes(new Date(), 30), "yyyy-MM-dd'T'HH:mm");
}

export default function RideBookingSheet({ destination, onClose, onBook, pickupLat, pickupLng }) {
  const [selectedCategory, setSelectedCategory] = useState(RIDE_CATEGORIES[0]);
  const [selectedPayment, setSelectedPayment] = useState("mobile_money");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitData, setSplitData] = useState(null);
  const [distance] = useState(() => 5 + Math.random() * 15);
  const [surge, setSurge] = useState({ multiplier: 1.0, is_surge: false });
  const [surgeLoading, setSurgeLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    base44.auth.me().then(async (me) => {
      if (!me) return;
      const wallets = await base44.entities.Wallet.filter({ user_id: me.id });
      setWalletBalance(wallets[0]?.balance || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!pickupLat || !pickupLng) return;
    setSurgeLoading(true);
    base44.functions.invoke("getSurgePricing", { lat: pickupLat, lng: pickupLng, radius_km: 5 })
      .then((res) => setSurge(res.data || { multiplier: 1.0, is_surge: false }))
      .catch(() => setSurge({ multiplier: 1.0, is_surge: false }))
      .finally(() => setSurgeLoading(false));
  }, [pickupLat, pickupLng]);

  const baseFare = selectedCategory.basePrice + selectedCategory.pricePerKm * distance;
  const fare = parseFloat((baseFare * surge.multiplier).toFixed(2));
  const yourShare = splitData ? splitData.perPersonFare : fare;

  const handleSplitConfirm = (data) => {
    setSplitData(data);
  };

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 bg-card border-t border-border rounded-t-3xl z-40 max-h-[85vh] overflow-y-auto"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg">Choose your ride</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5 p-3 bg-secondary rounded-xl">
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-ghana-green" />
            <div className="w-0.5 h-6 bg-border" />
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm font-medium text-foreground">Current Location</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="text-sm font-medium text-foreground">{destination?.name || "Selected destination"}</p>
            </div>
          </div>
        </div>

        {/* Surge banner */}
        {surge.is_surge && !surgeLoading && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-xl">
            <TrendingUp className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-xs text-destructive font-medium flex-1">
              High demand nearby — {surge.multiplier}x surge pricing active
            </p>
            <span className="text-xs text-destructive font-bold">{surge.nearby_demand} requests / {surge.nearby_drivers} drivers</span>
          </div>
        )}

        <div className="space-y-2 mb-5">
          {RIDE_CATEGORIES.map((cat) => (
            <RideCategoryCard
              key={cat.id}
              category={cat}
              selected={selectedCategory.id === cat.id}
              onSelect={setSelectedCategory}
              distance={distance}
              surgeMultiplier={surge.multiplier}
            />
          ))}
        </div>

        <div className="mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Payment Method</p>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_METHODS.map((pm) => {
              const Icon = paymentIcons[pm.icon];
              const isSelected = selectedPayment === pm.id;
              const isWallet = pm.id === "wallet";
              const insufficient = isWallet && yourShare > walletBalance;
              return (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPayment(pm.id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all min-w-[60px] ${
                    isSelected ? "border-primary bg-primary/10" : "border-border bg-secondary"
                  } ${insufficient && isSelected ? "border-destructive/60" : ""}`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-xs font-medium">{pm.name}</span>
                  {isWallet && (
                    <span className={`text-[10px] font-semibold ${insufficient ? "text-destructive" : "text-ghana-green"}`}>
                      GH₵{walletBalance.toFixed(2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedPayment === "wallet" && yourShare > walletBalance && (
            <p className="text-xs text-destructive mt-2">
              Insufficient wallet balance. <span className="underline cursor-pointer" onClick={() => window.location.href = "/rider/wallet"}>Top up →</span>
            </p>
          )}
        </div>

        {/* Split Fare */}
        <div className="mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Split Fare</p>
          <button
            onClick={() => setShowSplitModal(true)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
              splitData ? "border-primary bg-primary/10" : "border-border bg-secondary"
            }`}
          >
            <Users className={`w-4 h-4 ${splitData ? "text-primary" : "text-muted-foreground"}`} />
            <div className="flex-1 text-left">
              {splitData ? (
                <>
                  <p className="text-sm font-medium text-primary">
                    Split with {splitData.totalPeople - 1} friend{splitData.totalPeople > 2 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">GH₵{splitData.perPersonFare} each</p>
                </>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">Split fare with friends</p>
              )}
            </div>
            {splitData && (
              <button
                onClick={(e) => { e.stopPropagation(); setSplitData(null); }}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </button>
        </div>

        {/* Schedule toggle */}
        <div className="mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Trip Type</p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsScheduled(false)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                !isScheduled ? "border-primary bg-primary/10" : "border-border bg-secondary"
              }`}
            >
              <Zap className={`w-4 h-4 ${!isScheduled ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium">Now</span>
            </button>
            <button
              onClick={() => setIsScheduled(true)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                isScheduled ? "border-primary bg-primary/10" : "border-border bg-secondary"
              }`}
            >
              <CalendarClock className={`w-4 h-4 ${isScheduled ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium">Schedule</span>
            </button>
          </div>

          {isScheduled && (
            <div className="mt-3">
              <input
                type="datetime-local"
                min={minDateTime()}
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {isScheduled && !scheduledFor && (
                <p className="text-xs text-destructive mt-1">Please select a pickup date & time</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 p-3 bg-secondary rounded-xl">
          <div>
            <span className="text-muted-foreground">
              {splitData ? "Your share" : "Estimated fare"}
            </span>
            {splitData && (
              <p className="text-xs text-muted-foreground">Total: GH₵{fare.toFixed(2)}</p>
            )}
            {surge.is_surge && (
              <p className="text-xs text-destructive font-medium">{surge.multiplier}x surge applied</p>
            )}
          </div>
          <span className={`font-heading font-bold text-xl ${surge.is_surge ? "text-destructive" : "text-primary"}`}>
            GH₵{yourShare.toFixed ? yourShare.toFixed(2) : yourShare}
          </span>
        </div>

        <Button
          onClick={() => {
            if (isScheduled && !scheduledFor) return;
            onBook({
              category: selectedCategory.id,
              payment_method: selectedPayment,
              fare_estimate: parseFloat(fare.toFixed(2)),
              distance_km: parseFloat(distance.toFixed(1)),
              destination,
              ride_type: isScheduled ? "scheduled" : "on_demand",
              scheduled_for: isScheduled ? new Date(scheduledFor).toISOString() : null,
              split_fare: splitData || null,
              surge_multiplier: surge.multiplier,
            });
          }}
          className="w-full h-14 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold text-lg rounded-xl"
          disabled={(isScheduled && !scheduledFor) || (selectedPayment === "wallet" && yourShare > walletBalance)}
        >
          {isScheduled ? <CalendarClock className="w-5 h-5 mr-2" /> : <Navigation className="w-5 h-5 mr-2" />}
          {isScheduled ? "Schedule Trip" : "Request HY3N"}
        </Button>
      </div>

      <SplitFareModal
        isOpen={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        totalFare={fare}
        onConfirm={handleSplitConfirm}
      />
    </motion.div>
  );
}