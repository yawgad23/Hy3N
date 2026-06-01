export const LOGO_URL = "https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/ea1f43578_ChatGPTImageMay19202605_37_18PM.png";
export const DRIVER_LOGO_URL = "https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/5acac13a0_ChatGPTImageMay19202602_44_02AM.png";

/**
 * Uber-like Pricing Calculation Reference (Updated June 2026 - 10% fare increase):
 * For a 16.25km, 52min trip:
 * Formula: Base + (Dist * PerKm) + (Time * PerMin)
 * 11 + (16.25 * 4.18) + (52 * 0.44) = 11 + 67.93 + 22.88 = GH₵101.81
 */

// Free waiting time before charges begin (in minutes)
export const FREE_WAITING_MINUTES = 3;

export const RIDE_CATEGORIES = [
  {
    id: "standard",
    name: "Standard",
    description: "Affordable everyday rides",
    icon: "Car",
    basePrice: 11.00,
    pricePerKm: 4.18,
    pricePerMin: 0.44,
    waitingFeePerMin: 0.55,
    minFare: 16.50,
    seats: 4
  },
  {
    id: "comfort",
    name: "Comfort",
    description: "Comfortable rides with extra amenities",
    icon: "Star",
    basePrice: 16.50,
    pricePerKm: 5.06,
    pricePerMin: 0.66,
    waitingFeePerMin: 0.88,
    minFare: 27.50,
    seats: 4
  },
  {
    id: "kantanka",
    name: "Kantanka",
    description: "Proudly Ghanaian-made mini SUVs",
    icon: "Car",
    basePrice: 13.20,
    pricePerKm: 4.62,
    pricePerMin: 0.55,
    waitingFeePerMin: 0.66,
    minFare: 22.00,
    seats: 4
  },
  {
    id: "executive",
    name: "Executive",
    description: "Luxury travel for special occasions",
    icon: "ShieldCheck",
    basePrice: 27.50,
    pricePerKm: 6.60,
    pricePerMin: 1.10,
    waitingFeePerMin: 1.65,
    minFare: 44.00,
    seats: 4
  },
  {
    id: "okada",
    name: "Okada",
    description: "Fast bike rides to beat traffic",
    icon: "Bike",
    basePrice: 5.50,
    pricePerKm: 1.65,
    pricePerMin: 0.33,
    waitingFeePerMin: 0.33,
    minFare: 8.80,
    seats: 1
  },
  {
    id: "express_delivery",
    name: "Express Delivery",
    description: "Fast package delivery across the city",
    icon: "Package",
    basePrice: 16.50,
    pricePerKm: 2.20,
    pricePerMin: 0.55,
    waitingFeePerMin: 0.55,
    minFare: 22.00,
    seats: 0
  }
];

export const PAYMENT_METHODS = [
  { id: "cash", name: "Cash", icon: "Banknote" },
  { id: "mobile_money", name: "MoMo", icon: "Smartphone" },
  { id: "wallet", name: "Wallet", icon: "Wallet" },
  { id: "card", name: "Card", icon: "CreditCard" }
];
