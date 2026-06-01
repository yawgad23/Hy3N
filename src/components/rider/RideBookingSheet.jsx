import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Banknote, CreditCard, Wallet, MapPin, Navigation, CalendarClock, Clock, Zap, Users, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RIDE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import RideCategoryCard from "./RideCategoryCard";
import SplitFareModal from "./SplitFareModal";
import CalendarPicker from "./CalendarPicker";
import PromoCodeInput, { calculateDiscount } from "./PromoCodeInput";
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
  return addMinutes(new Date(), 30);
}

export default function RideBookingSheet({ destination, onClose, onBook, pickupLat, pickupLng }) {
  // Push a history entry so the OS back button dismisses this sheet
  useEffect(() => {
    window.history.pushState({ modal: "booking" }, "");
    const onPop = () => onClose();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState(RIDE_CATEGORIES[0]);
  const [selectedPayment, setSelectedPayment] = useState("mobile_money");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState(null);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitData, setSplitData] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [surge, setSurge] = useState({ multiplier: 1.0, is_surge: false });
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [surgeLoading, setSurgeLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calculatingFare, setCalculatingFare] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (me) => {
      if (!me) return;
      const wallets = await base44.entities.Wallet.filter({ user_id: me.id });
      setWalletBalance(wallets[0]?.balance || 0);
    }).catch(() => {});
  }, []);

  // Calculate distance and duration
  useEffect(() => {
    if (!pickupLat || !pickupLng || !destination?.lat || !destination?.lng) return;
    
    setCalculatingFare(true);
    base44.functions.invoke("calculateDistance", {
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      dest_lat: destination.lat,
      dest_lng: destination.lng
    })
      .then((res) => {
        setDistance(res.data.distance_km);
        setDuration(res.data.duration_minutes);
      })
      .catch((err) => {
        console.error("Distance calculation error:", err);
        setDistance(5); // Fallback
        setDuration(15);
      })
      .finally(() => setCalculatingFare(false));
  }, [pickupLat, pickupLng, destination]);

  // Get surge pricing
  useEffect(() => {
    if (!pickupLat || !pickupLng) return;
    setSurgeLoading(true);
    base44.functions.invoke("getSurgePricing", { lat: pickupLat, lng: pickupLng, radius_km: 5 })
      .then((res) => setSurge(res.data || { multiplier: 1.0, is_surge: false }))
      .catch(() => setSurge({ multiplier: 1.0, is_surge: false }))
      .finally(() => setSurgeLoading(false));
  }, [pickupLat, pickupLng]);

  // Uber-like pricing: base + (distance * pricePerKm) + (duration * pricePerMin)
  const calculateFare = () => {
    if (!distance || !duration) return 0;
    const distanceFare = selectedCategory.basePrice + (distance * selectedCategory.pricePerKm);
    const timeFare = duration * selectedCategory.pricePerMin;
    const subtotal = distanceFare + timeFare;
    const withSurge = subtotal * surge.multiplier;
    const final = Math.max(withSurge, selectedCategory.minFare);
    return parseFloat(final.toFixed(2));
  };
  
  const fare = calculateFare();
  const promoDiscount = calculateDiscount(fare, appliedPromo);
  const fareAfterPromo = Math.max(fare - promoDiscount, 0);
  const yourShare = splitData ? splitData.perPersonFare : fareAfterPromo;

  const handleSplitConfirm = (data) => {
    setSplitData(data);
  };

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 bg-card border-t border-border rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto pb-safe"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <div className="p-5 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg">Choose your ride</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Route Summary with Distance & Duration */}
        <div className="mb-5 p-4 bg-secondary rounded-xl">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-full border-2 border-ghana-green" />
              <div className="w-0.5 h-8 bg-border" />
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium text-foreground">Current Location</p>
              </div>
              {destination?.stops && destination.stops.map((stop, i) => (
                <div key={i}>
                  <p className="text-xs text-muted-foreground">Stop {i + 1}</p>
                  <p className="text-sm font-medium text-foreground">{stop.name}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium text-foreground">{destination?.name || "Selected destination"}</p>
              </div>
            </div>
          </div>
          
          {/* Distance & Duration Badge */}
          {distance && duration && (
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-sm font-bold text-foreground">{distance.toFixed(1)} km</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-bold text-foreground">~{duration} min</p>
                </div>
              </div>
            </div>
          )}
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

        {/* Ride Category Selection */}
        <div className="mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Choose Ride</p>
          <div className="space-y-2">
            {calculatingFare ? (
              <div className="flex items-center justify-center p-8 bg-secondary rounded-xl">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              RIDE_CATEGORIES.map((cat) => (
                <RideCategoryCard
                  key={cat.id}
                  category={cat}
                  selected={selectedCategory.id === cat.id}
                  onSelect={setSelectedCategory}
                  distance={distance}
                  duration={duration}
                  surgeMultiplier={surge.multiplier}
                />
              ))
            )}
          </div>
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
              Insufficient wallet balance. <span className="underline cursor-pointer" onClick={() => window.location.href = "/wallet"}>Top up →</span>
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
              onClick={() => {
                setIsScheduled(true);
                setShowCalendar(true);
              }}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                isScheduled ? "border-primary bg-primary/10" : "border-border bg-secondary"
              }`}
            >
              <CalendarClock className={`w-4 h-4 ${isScheduled ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium">Schedule</span>
            </button>
          </div>

          {isScheduled && (
            <button
              onClick={() => setShowCalendar(true)}
              className="mt-3 w-full flex items-center justify-between p-4 bg-secondary border border-border rounded-xl hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Scheduled for</p>
                  <p className="text-sm font-semibold text-foreground">
                    {scheduledFor ? format(scheduledFor, "EEE, MMM d · h:mm a") : "Select date & time"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Promo Code */}
        <div className="mb-4">
          <PromoCodeInput
            onApply={setAppliedPromo}
            appliedPromo={appliedPromo}
            onRemove={() => setAppliedPromo(null)}
          />
        </div>

        {/* Total Fare Display */}
        <div className="mb-4">
          {surge.is_surge && (
            <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/30 rounded-xl mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-destructive" />
                <p className="text-xs text-destructive font-medium">Surge Pricing Active ({surge.multiplier}x)</p>
              </div>
            </div>
          )}

          {promoDiscount > 0 && (
            <div className="flex items-center justify-between p-3 bg-ghana-green/10 border border-ghana-green/30 rounded-xl mb-3">
              <p className="text-xs text-ghana-green font-medium">Promo applied: -{appliedPromo.code}</p>
              <p className="text-sm font-bold text-ghana-green">-GH₵{promoDiscount.toFixed(2)}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between p-5 bg-secondary border border-border rounded-2xl">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">
                {splitData ? "Your Share" : "Estimated Fare"}
              </p>
              {splitData && (
                <p className="text-xs text-muted-foreground">Total Trip: GH₵{fare.toFixed(2)}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                  <Navigation className="w-3 h-3" />
                  <span>{distance ? distance.toFixed(1) : "-"} km</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                  <Clock className="w-3 h-3" />
                  <span>~{duration || "-"} min</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`font-heading font-bold text-3xl ${surge.is_surge ? "text-destructive" : "text-primary"}`}>
                GH₵{yourShare.toFixed ? yourShare.toFixed(2) : "0.00"}
              </span>
              <p className="text-[10px] text-muted-foreground mt-1">Includes all taxes & fees</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            if (isScheduled && !scheduledFor) return;
            onBook({
              category: selectedCategory.id,
              payment_method: selectedPayment,
              fare_estimate: parseFloat(fareAfterPromo.toFixed(2)),
              distance_km: parseFloat(distance.toFixed(1)),
              destination,
              ride_type: isScheduled ? "scheduled" : "on_demand",
              scheduled_for: isScheduled ? scheduledFor.toISOString() : null,
              split_fare: splitData || null,
              surge_multiplier: surge.multiplier,
              promo_code: appliedPromo?.code || null,
              promo_discount: promoDiscount > 0 ? parseFloat(promoDiscount.toFixed(2)) : 0,
            });
          }}
          className="w-full h-14 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold text-lg rounded-xl"
          disabled={(isScheduled && !scheduledFor) || (selectedPayment === "wallet" && yourShare > walletBalance)}
        >
          {isScheduled ? <CalendarClock className="w-5 h-5 mr-2" /> : <Navigation className="w-5 h-5 mr-2" />}
          {isScheduled ? "Schedule Trip" : "Request HY3N"}
        </Button>
      </div>

      <AnimatePresence>
        {showCalendar && (
          <CalendarPicker
            selectedDate={scheduledFor}
            onDateSelect={(date) => {
              setScheduledFor(date);
              setShowCalendar(false);
            }}
            minDate={minDateTime()}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </AnimatePresence>

      <SplitFareModal
        isOpen={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        totalFare={fare}
        onConfirm={handleSplitConfirm}
      />
    </motion.div>
  );
}