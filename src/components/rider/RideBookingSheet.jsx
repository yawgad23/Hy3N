import { useState } from "react";
import { motion } from "framer-motion";
import { X, Smartphone, Banknote, CreditCard, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RIDE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import RideCategoryCard from "./RideCategoryCard";

const paymentIcons = {
  Smartphone: Smartphone,
  Banknote: Banknote,
  CreditCard: CreditCard
};

export default function RideBookingSheet({ destination, onClose, onBook }) {
  const [selectedCategory, setSelectedCategory] = useState(RIDE_CATEGORIES[0]);
  const [selectedPayment, setSelectedPayment] = useState("mobile_money");
  const distance = 5 + Math.random() * 15;

  const fare = selectedCategory.basePrice + selectedCategory.pricePerKm * distance;

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

        <div className="flex items-center justify-between mb-4 p-3 bg-secondary rounded-xl">
          <span className="text-muted-foreground">Estimated fare</span>
          <span className="font-heading font-bold text-xl text-primary">GH₵{fare.toFixed(2)}</span>
        </div>

        <Button
          onClick={() => onBook({
            category: selectedCategory.id,
            payment_method: selectedPayment,
            fare_estimate: parseFloat(fare.toFixed(2)),
            distance_km: parseFloat(distance.toFixed(1)),
            destination
          })}
          className="w-full h-14 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold text-lg rounded-xl"
        >
          <Navigation className="w-5 h-5 mr-2" />
          Request HY3N
        </Button>
      </div>
    </motion.div>
  );
}