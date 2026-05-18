import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Banknote, CreditCard, MapPin, Navigation, CalendarClock, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RIDE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import RideCategoryCard from "./RideCategoryCard";
import SplitFareModal from "./SplitFareModal";
import { format, addMinutes } from "date-fns";

const paymentIcons = {
  Smartphone: Smartphone,
  Banknote: Banknote,
  CreditCard: CreditCard
};

// Min scheduled time: 30 min from now
function minDateTime() {
  return format(addMinutes(new Date(), 30), "yyyy-MM-dd'T'HH:mm");
}

export default function RideBookingSheet({ destination, onClose, onBook }) {
  const [selectedCategory, setSelectedCategory] = useState(RIDE_CATEGORIES[0]);
  const [selectedPayment, setSelectedPayment] = useState("mobile_money");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitData, setSplitData] = useState(null);
  const [distance] = useState(() => 5 + Math.random() * 15);

  const fare = selectedCategory.basePrice + selectedCategory.pricePerKm * distance;
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

        <div className="space-y-2 mb-5">
          {RIDE_CATEGORIES.map((cat) => (
            <RideCategoryCard
              key={cat.id}
              category={cat}
              selected={selectedCategory.id === cat.id}
              onSelect={setSelectedCategory}
              distance={distance}
            />
          ))}
        </div>

        <div className="mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Payment Method</p>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map((pm) => {
              const Icon = paymentIcons[pm.icon];
              return (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPayment(pm.id)}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    selectedPayment === pm.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${selectedPayment === pm.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-xs font-medium">{pm.name}</span>
                </button>
              );
            })}
          </div>
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
          </div>
          <span className="font-heading font-bold text-xl text-primary">GH₵{yourShare.toFixed ? yourShare.toFixed(2) : yourShare}</span>
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
              split_fare: splitData || null
            });
          }}
          className="w-full h-14 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold text-lg rounded-xl"
          disabled={isScheduled && !scheduledFor}
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