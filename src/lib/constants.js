export const LOGO_URL = "https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/ea1f43578_ChatGPTImageMay19202605_37_18PM.png";
export const DRIVER_LOGO_URL = "https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/5acac13a0_ChatGPTImageMay19202602_44_02AM.png";

/**
 * Uber-like Pricing Calculation Reference:
 * For a 16.25km, 52min trip targeting the 80-90 GHS range:
 * Formula: Base + (Dist * PerKm) + (Time * PerMin)
 * 8 + (16.25 * 3.50) + (52 * 0.35) = 8 + 56.88 + 18.2 = GH₵83.08
 */

export const RIDE_CATEGORIES = [
  {
    id: "standard",
    name: "Standard",
    description: "Affordable everyday rides",
    icon: "Car",
    basePrice: 8.00,
    pricePerKm: 3.50,
    pricePerMin: 0.35,
    minFare: 12.00,
    seats: 4
  },
  {
    id: "comfort",
    name: "Comfort",
    description: "Comfortable rides with extra amenities",
    icon: "Star",
    basePrice: 12.00,
    pricePerKm: 4.20,
    pricePerMin: 0.50,
    minFare: 20.00,
    seats: 4
  },
  {
    id: "kantanka",
    name: "Kantanka",
    description: "Ride made in Ghana",
    icon: "Car",
    basePrice: 10.00,
    pricePerKm: 3.80,
    pricePerMin: 0.45,
    minFare: 15.00,
    seats: 4
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium luxury rides",
    icon: "Crown",
    basePrice: 20.00,
    pricePerKm: 5.50,
    pricePerMin: 0.90,
    minFare: 40.00,
    seats: 4
  },
  {
    id: "okada",
    name: "Okada",
    description: "Fast bike rides to beat traffic",
    icon: "Bike",
    basePrice: 4.00,
    pricePerKm: 2.20,
    pricePerMin: 0.15,
    minFare: 8.00,
    seats: 1
  },
  {
    id: "express_delivery",
    name: "Express Delivery",
    description: "Fast package delivery",
    icon: "Package",
    basePrice: 8.00,
    pricePerKm: 2.80,
    pricePerMin: 0.25,
    minFare: 12.00,
    seats: 0
  }
];

export const PAYMENT_METHODS = [
  { id: "wallet", name: "Wallet", icon: "Wallet" },
  { id: "cash", name: "Cash", icon: "Banknote" },
  { id: "card", name: "Card", icon: "CreditCard" }
];
