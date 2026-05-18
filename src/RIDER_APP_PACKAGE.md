# 📦 HY3N Rider App - Complete Code Package

**This is the RIDER-ONLY version** of HY3N. For the driver app, see `DRIVER_APP_PACKAGE.md`.

## Project Overview
**HY3N Rider** - Ghana's premium ride-hailing platform for passengers  
**Version**: 1.0.0 (Rider Edition)  
**Tech Stack**: React 18 + Vite + Tailwind CSS + Base44 Platform

---

## ✅ What's Included

This app contains **rider-only features**:
- Book on-demand and scheduled rides
- Track driver location in real-time
- View ride history
- Manage wallet and payments
- Rate drivers
- SOS emergency button
- Split fare functionality
- Push notifications

**Removed**: All driver-specific pages and components

---

## 📁 File Structure

```
hy3n-rider/
├── App.jsx                          # Main router (rider-only routes)
├── main.jsx                         # Entry point
├── index.html                       # HTML template
├── index.css                        # Global styles
├── tailwind.config.js               # Tailwind config
├── public/
│   ├── sw.js                        # Service Worker
│   └── manifest.json                # PWA manifest (HY3N Rider)
├── src/
│   ├── api/
│   │   └── base44Client.js
│   ├── components/
│   │   ├── shared/                  # Shared components
│   │   ├── rider/                   # Rider components ONLY
│   │   └── ui/                      # shadcn/ui
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   │   └── rider/                   # Rider pages ONLY
│   └── functions/                   # Backend functions
└── entities/                        # Database schemas
```

---

## 🔧 Current Setup (Already Done)

### App.jsx - Rider Routes Only
```javascript
// Routes configured:
- "/" → RiderHome (default)
- "/rider" → RiderHome
- "/rider/history" → RiderHistory
- "/rider/profile" → RiderProfile
- "/rider/support" → RiderSupport
- "/rider/scheduled" → ScheduledTrips
- "/rider/wallet" → RiderWallet
- "/admin/sos" → SOSDashboard (admin only)
- "/admin" → AdminDashboard (admin only)
```

### Removed Files
- ❌ `pages/RoleSelect.jsx` (deleted)
- ❌ All driver pages (kept for driver app package)
- ❌ Driver routes from App.jsx

---

## 🗄️ Required Entities

Create these in Base44 Dashboard → Entities:

### RiderProfile
```json
{
  "name": "RiderProfile",
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "full_name": {"type": "string"},
    "phone": {"type": "string"},
    "email": {"type": "string"},
    "profile_photo_url": {"type": "string"},
    "preferred_payment": {"type": "string", "enum": ["mobile_money", "cash", "card"], "default": "mobile_money"},
    "total_rides": {"type": "number", "default": 0},
    "rating": {"type": "number", "default": 5.0},
    "saved_locations": {"type": "array", "items": {"type": "object"}}
  },
  "required": ["user_id", "full_name", "phone"]
}
```

### Ride
```json
{
  "name": "Ride",
  "type": "object",
  "properties": {
    "rider_id": {"type": "string"},
    "driver_id": {"type": "string"},
    "status": {"type": "string", "enum": ["requested", "scheduled", "matched", "driver_arriving", "in_progress", "completed", "cancelled"], "default": "requested"},
    "ride_type": {"type": "string", "enum": ["on_demand", "scheduled"], "default": "on_demand"},
    "scheduled_for": {"type": "string"},
    "category": {"type": "string", "enum": ["standard", "xl", "executive", "kantanka", "express_delivery"]},
    "pickup_address": {"type": "string"},
    "pickup_lat": {"type": "number"},
    "pickup_lng": {"type": "number"},
    "destination_address": {"type": "string"},
    "destination_lat": {"type": "number"},
    "destination_lng": {"type": "number"},
    "fare_estimate": {"type": "number"},
    "final_fare": {"type": "number"},
    "payment_method": {"type": "string", "enum": ["mobile_money", "cash", "card", "wallet"], "default": "mobile_money"},
    "payment_status": {"type": "string", "enum": ["pending", "paid", "failed", "refunded"], "default": "pending"},
    "distance_km": {"type": "number"},
    "duration_minutes": {"type": "number"},
    "rider_rating": {"type": "number"},
    "driver_rating": {"type": "number"},
    "rider_name": {"type": "string"},
    "driver_name": {"type": "string"}
  },
  "required": ["rider_id", "category", "pickup_address", "destination_address"]
}
```

### Wallet
```json
{
  "name": "Wallet",
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "balance": {"type": "number", "default": 0},
    "total_topped_up": {"type": "number", "default": 0},
    "total_spent": {"type": "number", "default": 0}
  },
  "required": ["user_id"]
}
```

### WalletTransaction
```json
{
  "name": "WalletTransaction",
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "type": {"type": "string", "enum": ["top_up", "ride_payment", "refund"]},
    "amount": {"type": "number"},
    "balance_after": {"type": "number"},
    "description": {"type": "string"},
    "ride_id": {"type": "string"},
    "status": {"type": "string", "enum": ["pending", "completed", "failed"], "default": "completed"},
    "reference": {"type": "string"}
  },
  "required": ["user_id", "type", "amount"]
}
```

### Payment
```json
{
  "name": "Payment",
  "type": "object",
  "properties": {
    "ride_id": {"type": "string"},
    "rider_id": {"type": "string"},
    "driver_id": {"type": "string"},
    "amount": {"type": "number"},
    "method": {"type": "string", "enum": ["mobile_money", "cash", "card"]},
    "status": {"type": "string", "enum": ["pending", "completed", "failed"], "default": "pending"},
    "reference": {"type": "string"}
  },
  "required": ["ride_id", "amount", "method"]
}
```

### RideMessage
```json
{
  "name": "RideMessage",
  "type": "object",
  "properties": {
    "ride_id": {"type": "string"},
    "sender_id": {"type": "string"},
    "sender_role": {"type": "string", "enum": ["rider", "driver"]},
    "message": {"type": "string"},
    "read_by_rider": {"type": "boolean", "default": false},
    "read_by_driver": {"type": "boolean", "default": false}
  },
  "required": ["ride_id", "sender_id", "sender_role", "message"]
}
```

### SosIncident
```json
{
  "name": "SosIncident",
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "user_name": {"type": "string"},
    "user_role": {"type": "string", "enum": ["rider", "driver"]},
    "ride_id": {"type": "string"},
    "lat": {"type": "number"},
    "lng": {"type": "number"},
    "status": {"type": "string", "enum": ["active", "resolved", "false_alarm"], "default": "active"},
    "sms_sent": {"type": "boolean", "default": false}
  },
  "required": ["user_id", "user_role"]
}
```

### SupportTicket
```json
{
  "name": "SupportTicket",
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "user_role": {"type": "string", "enum": ["rider", "driver"]},
    "subject": {"type": "string"},
    "message": {"type": "string"},
    "status": {"type": "string", "enum": ["open", "in_progress", "resolved"], "default": "open"},
    "ride_id": {"type": "string"}
  },
  "required": ["user_id", "subject", "message"]
}
```

### Referral
```json
{
  "name": "Referral",
  "type": "object",
  "properties": {
    "referrer_id": {"type": "string"},
    "referrer_role": {"type": "string", "enum": ["rider", "driver"]},
    "referee_id": {"type": "string"},
    "referee_email": {"type": "string"},
    "invite_code": {"type": "string"},
    "status": {"type": "string", "enum": ["pending", "completed", "credited"], "default": "pending"},
    "referrer_reward": {"type": "number"},
    "referee_reward": {"type": "number"}
  },
  "required": ["referrer_id", "referrer_role", "referee_id", "invite_code"]
}
```

---

## 🔑 Required Secrets

Set these in Base44 Dashboard → Secrets:

- `GOOGLE_MAPS_API_KEY` - Google Maps Directions API
- `TWILIO_ACCOUNT_SID` - Twilio SMS for SOS
- `TWILIO_AUTH_TOKEN` - Twilio authentication
- `TWILIO_FROM_PHONE` - Twilio sender number
- `SOS_EMERGENCY_PHONE` - Emergency contact number

---

## 🔧 Backend Functions

These functions are already configured:

1. **getGoogleMapsRoute** - Fetch routes from Google Maps API
2. **getSurgePricing** - Calculate dynamic pricing
3. **triggerSOS** - Send emergency alerts
4. **processMoMoPayment** - Handle Mobile Money payments
5. **processCardPayment** - Handle card payments
6. **sendMessageNotification** - Push notifications for messages
7. **onNewMessage** - Handle new chat messages
8. **onRideCompleted** - Process completed rides
9. **autoMatchRides** - Auto-match drivers to rides
10. **generateInviteCode** - Generate referral codes
11. **applyReferralCredit** - Apply referral bonuses

---

## 📱 Required Automations

Set up in Dashboard → Automations:

### 1. Auto-Match Rides (Scheduled)
- **Function**: `autoMatchRides`
- **Schedule**: Every 1 minute
- **Purpose**: Match nearby drivers with ride requests

### 2. On Ride Completed (Entity)
- **Function**: `onRideCompleted`
- **Entity**: `Ride`
- **Event**: `update` (when status → "completed")
- **Purpose**: Process payments, driver earnings, ratings

### 3. On New Message (Entity)
- **Function**: `onNewMessage`
- **Entity**: `RideMessage`
- **Event**: `create`
- **Purpose**: Send push notifications

---

## 🚀 Setup Instructions

### For This App (Already Rider-Only)
1. ✅ Routes updated to rider-only
2. ✅ RoleSelect page removed
3. ✅ Home page redirects to RiderHome
4. ✅ Driver routes removed

### Next Steps
1. **Test the rider flow**:
   - Register/login
   - Book a ride
   - Track driver
   - Complete payment
   - Rate driver

2. **Create Driver App**:
   - Follow instructions in `DRIVER_APP_PACKAGE.md`
   - Set up separate Base44 app for drivers

---

## 📊 Key Differences from Original App

| Feature | Original App | Rider App (This) |
|---------|-------------|------------------|
| Role Selection | ✅ Yes | ❌ Removed |
| Rider Features | ✅ Yes | ✅ Yes |
| Driver Features | ✅ Yes | ❌ Removed |
| Default Route | `/` → RoleSelect | `/` → RiderHome |
| Bottom Nav | Role-based | Rider-only tabs |

---

## 🎨 Brand Assets

**Colors**:
- Primary (Gold): `#D4AF37`
- Accent (Green): `#006B3F`
- Destructive (Red): `#CE1126`
- Background (Black): `#0A0A0A`

**Fonts**:
- Headings: Outfit
- Body: Inter

---

## 📞 Support

- **Base44 Docs**: https://docs.base44.com
- **Issues**: Check Base44 dashboard
- **Security**: See `SECURITY_STATUS.md`

---

**Version**: 1.0.0 (Rider Edition)  
**Last Updated**: May 18, 2026