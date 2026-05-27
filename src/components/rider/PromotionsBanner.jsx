import { useState, useEffect } from "react";
import { X, Gift, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const defaultPromotions = [
  {
    id: "promo1",
    title: "First Ride Discount",
    description: "Get 10% off your first ride with HY3N",
    code: "WELCOME10",
    icon: Gift,
    color: "from-ghana-green to-green-600"
  },
  {
    id: "promo2",
    title: "Refer & Earn",
    description: "Get GH₵10 for every friend you refer",
    code: "REFER",
    icon: Percent,
    color: "from-ghana-gold to-yellow-600"
  }
];

export default function PromotionsBanner() {
  const [promotions, setPromotions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    // In production, fetch from backend
    setPromotions(defaultPromotions);
  }, []);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promotions.length]);

  const handleDismiss = () => {
    const current = promotions[currentIndex];
    setDismissed([...dismissed, current.id]);
  };

  const visiblePromos = promotions.filter(p => !dismissed.includes(p.id));
  
  if (visiblePromos.length === 0) return null;

  const currentPromo = visiblePromos[currentIndex % visiblePromos.length] || visiblePromos[0];
  const Icon = currentPromo.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r p-4 shadow-lg"
        style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
        className={`bg-gradient-to-r ${currentPromo.color} p-4 shadow-lg`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm">{currentPromo.title}</h4>
            <p className="text-xs text-white/90 mt-0.5">{currentPromo.description}</p>
            {currentPromo.code && (
              <p className="text-xs font-mono bg-white/20 inline-block px-2 py-0.5 rounded mt-1 text-white">
                Code: {currentPromo.code}
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
        
        {/* Pagination dots */}
        {visiblePromos.length > 1 && (
          <div className="flex gap-1 mt-3 justify-center">
            {visiblePromos.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}