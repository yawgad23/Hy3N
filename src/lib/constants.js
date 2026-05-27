export const LOGO_URL = "https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/ea1f43578_ChatGPTImageMay19202605_37_18PM.png";
export const DRIVER_LOGO_URL = "https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/5acac13a0_ChatGPTImageMay19202602_44_02AM.png";

export const RIDE_CATEGORIES = [
  {
    id: "standard",
    name: "Standard",
    description: "Affordable everyday rides",
    icon: "Car",
    basePrice: 3.10,
    pricePerKm: 1.26,
    pricePerMin: 0.45,
    minFare: 8.00,
    seats: 4
  },
  {
    id: "comfort",
    name: "Comfort",
    description: "Comfortable rides with extra amenities",
    icon: "Star",
    basePrice: 5.00,
    pricePerKm: 1.80,
    pricePerMin: 0.60,
    minFare: 12.00,
    seats: 4
  },
  {
    id: "kantanka",
    name: "Kantanka",
    description: "Ride made in Ghana",
    icon: "Bus",
    basePrice: 4.00,
    pricePerKm: 1.50,
    pricePerMin: 0.50,
    minFare: 10.00,
    seats: 4
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium luxury rides",
    icon: "Crown",
    basePrice: 10.00,
    pricePerKm: 2.50,
    pricePerMin: 1.00,
    minFare: 20.00,
    seats: 4
  },
  {
    id: "okada",
    name: "Okada",
    description: "Fast bike rides to beat traffic",
    icon: "Bike",
    basePrice: 2.00,
    pricePerKm: 0.80,
    pricePerMin: 0.25,
    minFare: 5.00,
    seats: 1
  },
  {
    id: "express_delivery",
    name: "Express Delivery",
    description: "Fast package delivery",
    icon: "Package",
    basePrice: 4.00,
    pricePerKm: 1.20,
    pricePerMin: 0.40,
    minFare: 8.00,
    seats: 0
  }
];

export const PAYMENT_METHODS = [
  { id: "wallet", name: "Wallet", icon: "Wallet" },
  { id: "cash", name: "Cash", icon: "Banknote" },
  { id: "card", name: "Card", icon: "CreditCard" }
];
