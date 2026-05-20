export const LOGO_URL = "https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/ea1f43578_ChatGPTImageMay19202605_37_18PM.png";
export const DRIVER_LOGO_URL = "https://media.base44.com/images/public/6a0b47e6908611c99d7673ac/5acac13a0_ChatGPTImageMay19202602_44_02AM.png";

export const RIDE_CATEGORIES = [
  {
    id: "standard",
    name: "HY3N Standard",
    description: "Affordable everyday rides",
    icon: "Car",
    basePrice: 8,
    pricePerKm: 2.5,
    seats: 4
  },
  {
    id: "comfort",
    name: "HY3N Comfort",
    description: "Comfortable rides with extra amenities",
    icon: "Star",
    basePrice: 15,
    pricePerKm: 3.5,
    seats: 4
  },
  {
    id: "kantanka",
    name: "Kantanka HY3N",
    description: "Ride made in Ghana",
    icon: "Bus",
    basePrice: 10,
    pricePerKm: 3,
    seats: 4
  },
  {
    id: "executive",
    name: "HY3N Executive",
    description: "Premium luxury rides",
    icon: "Crown",
    basePrice: 25,
    pricePerKm: 5,
    seats: 4
  },
  {
    id: "express_delivery",
    name: "HY3N Express Delivery",
    description: "Fast package delivery",
    icon: "Package",
    basePrice: 12,
    pricePerKm: 2,
    seats: 0
  }
];

export const PAYMENT_METHODS = [
  { id: "wallet", name: "Wallet", icon: "Wallet" },
  { id: "cash", name: "Cash", icon: "Banknote" },
  { id: "card", name: "Card", icon: "CreditCard" }
];