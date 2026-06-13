import { useState } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Hardcoded promo codes for now (in production, validate via backend)
const VALID_PROMOS = {
  "FIRSTRIDE": { discount: 0.20, type: "percent", description: "20% off your first ride", maxDiscount: 15 },
  "HY3N10": { discount: 0.10, type: "percent", description: "10% off this ride", maxDiscount: 10 },
  "FREERIDE": { discount: 20, type: "fixed", description: "GH₵20 off this ride" },
  "WELCOME": { discount: 0.15, type: "percent", description: "15% off for new riders", maxDiscount: 12 },
  "WEEKEND": { discount: 0.10, type: "percent", description: "10% weekend discount", maxDiscount: 8 },
};

export default function PromoCodeInput({ onApply, appliedPromo, onRemove }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setError("");
    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const promo = VALID_PROMOS[code.trim().toUpperCase()];
    if (promo) {
      onApply({ code: code.trim().toUpperCase(), ...promo });
      setCode("");
      setShowInput(false);
    } else {
      setError("Invalid promo code. Please try again.");
    }
    setLoading(false);
  };

  // If a promo is already applied, show it as a badge
  if (appliedPromo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-2 bg-ghana-green/10 border border-ghana-green/30 rounded-xl"
      >
        <Tag className="w-4 h-4 text-ghana-green" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-ghana-green">{appliedPromo.code}</p>
          <p className="text-[10px] text-ghana-green/80">{appliedPromo.description}</p>
        </div>
        <button onClick={onRemove} className="p-1 hover:bg-ghana-green/20 rounded-lg">
          <X className="w-3.5 h-3.5 text-ghana-green" />
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
        >
          <Tag className="w-4 h-4" />
          <span>Add promo code</span>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
              className="bg-secondary text-sm uppercase font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
            <Button
              onClick={handleApply}
              disabled={loading || !code.trim()}
              size="sm"
              className="px-4"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </Button>
            <Button
              onClick={() => { setShowInput(false); setCode(""); setError(""); }}
              variant="ghost"
              size="sm"
              className="px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Utility function to calculate discount
export function calculateDiscount(fare, promo) {
  if (!promo) return 0;
  if (promo.type === "percent") {
    const discount = fare * promo.discount;
    return promo.maxDiscount ? Math.min(discount, promo.maxDiscount) : discount;
  }
  return Math.min(promo.discount, fare); // Fixed discount can't exceed fare
}
