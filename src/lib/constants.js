export const LOGO_URL = "https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/ea1f43578_ChatGPTImageMay19202605_37_18PM.png";
export const DRIVER_LOGO_URL = "https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/5acac13a0_ChatGPTImageMay19202602_44_02AM.png";

/**
 * Uber-like Pricing Calculation Reference:
 * For a 16.25km, 52min trip costing GH₵92:
 * Formula: Base + (Dist * PerKm) + (Time * PerMin)
 * 10 + (16.25 * 3.80) + (52 * 0.40) = 10 + 61.75 + 20.8 = GH₵92.55
 */

export const RIDE_CATEGORIES = [
  {
    id: "standard",
    name: "Standard",
    description: "Affordable everyday rides",
    icon: "Car",
    basePrice: 10.00,
    pricePerKm: 3.80,
    pricePerMin: 0.40,
    minFare: 15.00,
    seats: 4
  },
  {
    id: "comfort",
    name: "Comfort",
    description: "Comfortable rides with extra amenities",
    icon: "Star",
    basePrice: 15.00,
    pricePerKm: 4.50,
    pricePerMin: 0.60,
    minFare: 25.00,
    seats: 4
  },
  {
    id: "kantanka",
    name: "Kantanka",
    description: "Ride made in Ghana",
    icon: "Car",
    basePrice: 12.00,
    pricePerKm: 4.00,
    pricePerMin: 0.50,
    minFare: 20.00,
    seats: 4
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium luxury rides",
    icon: "Crown",
    basePrice: 25.00,
    pricePerKm: 6.00,
    pricePerMin: 1.00,
    minFare: 45.00,
    seats: 4
  },
  {
    id: "okada",
    name: "Okada",
    description: "Fast bike rides to beat traffic",
    icon: "Bike",
    basePrice: 5.00,
    pricePerKm: 2.50,
    pricePerMin: 0.20,
    minFare: 10.00,
    seats: 1
  },
  {
    id: "express_delivery",
    name: "Express Delivery",
    description: "Fast package delivery",
    icon: "Package",
    basePrice: 10.00,
    pricePerKm: 3.00,
    pricePerMin: 0.30,
    minFare: 15.00,
    seats: 0
  }
];

export const PAYMENT_METHODS = [
  { id: "wallet", name: "Wallet", icon: "Wallet" },
  { id: "cash", name: "Cash", icon: "Banknote" },
  { id: "card", name: "Card", icon: "CreditCard" }
];
