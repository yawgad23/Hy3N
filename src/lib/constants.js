export const LOGO_URL = "https://media.base44.com/images/public/user_6a0b47df1b4c35b2346c0b24/97a3a2b69_ed10837d-36bf-405d-9043-0f9ff87a5b4e.png";
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
    id: "xl",
    name: "HY3N XL",
    description: "Extra space for groups",
    icon: "Bus",
    basePrice: 15,
    pricePerKm: 3.5,
    seats: 6
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
    id: "kantanka",
    name: "Kantanka Hyen",
    description: "Ride made in Ghana",
    icon: "Star",
    basePrice: 10,
    pricePerKm: 3,
    seats: 4
  },
  {
    id: "express_delivery",
    name: "HY3N Express",
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