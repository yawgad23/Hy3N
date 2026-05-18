import { Car, Bus, Crown, Star, Package } from "lucide-react";

const iconMap = {
  Car: Car,
  Bus: Bus,
  Crown: Crown,
  Star: Star,
  Package: Package
};

export default function RideCategoryCard({ category, selected, onSelect, distance }) {
  const Icon = iconMap[category.icon] || Car;
  const estimatedFare = distance
    ? (category.basePrice + category.pricePerKm * distance).toFixed(2)
    : category.basePrice.toFixed(2);

  return (
    <button
      onClick={() => onSelect(category)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-muted-foreground/30"
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        selected ? "bg-primary/20" : "bg-secondary"
      }`}>
        <Icon className={`w-6 h-6 ${selected ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 text-left">
        <h4 className="font-heading font-semibold text-sm text-foreground">{category.name}</h4>
        <p className="text-xs text-muted-foreground">{category.description}</p>
      </div>
      <div className="text-right">
        <p className="font-heading font-bold text-foreground">GH₵{estimatedFare}</p>
        {category.seats > 0 && (
          <p className="text-xs text-muted-foreground">{category.seats} seats</p>
        )}
      </div>
    </button>
  );
}