# HY3N Driver App - Code Package

This document contains all the code needed to create the HY3N Driver app.

## Step 1: Create New Base44 App

1. Go to Base44 Dashboard
2. Click "Create New App"
3. Name it "HY3N Driver"
4. Copy all files from this package to the new app

## Step 2: Required Files

### App.jsx (Router)
```javascript
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { registerServiceWorker } from '@/hooks/useServiceWorker';
import AppEffects from '@/components/AppEffects';

import DriverGateway from '@/pages/driver/DriverGateway';
import DriverEarnings from '@/pages/driver/DriverEarnings';
import DriverHistory from '@/pages/driver/DriverHistory';
import DriverProfile from '@/pages/driver/DriverProfile';
import DriverSupport from '@/pages/driver/DriverSupport';
import DriverScheduledRides from '@/pages/driver/DriverScheduledRides';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        style={{ minHeight: "100vh" }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route path="/" element={<DriverGateway />} />
            <Route path="/driver" element={<DriverGateway />} />
            <Route path="/driver/earnings" element={<DriverEarnings />} />
            <Route path="/driver/history" element={<DriverHistory />} />
            <Route path="/driver/profile" element={<DriverProfile />} />
            <Route path="/driver/support" element={<DriverSupport />} />
            <Route path="/driver/scheduled" element={<DriverScheduledRides />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  registerServiceWorker();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppEffects />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
```

## Step 3: Copy These Files to New App

### Pages (copy entire folders):
- `pages/driver/` - All driver pages
- `pages/Login.jsx`
- `pages/Register.jsx`
- `pages/ForgotPassword.jsx`
- `pages/ResetPassword.jsx`
- `pages/PrivacyPolicy.jsx`

### Components:
- `components/shared/` - All shared components (Logo, BottomNav, GoogleTrackingMap, SOSButton, etc.)
- `components/driver/` - All driver-specific components
- `components/ui/` - All UI components
- `components/ProtectedRoute.jsx`
- `components/AppEffects.jsx`
- `components/UserNotRegisteredError.jsx`
- `components/ErrorBoundary.jsx`

### Functions (Backend):
- `functions/autoMatchRides.js`
- `functions/getGoogleMapsRoute.js`
- `functions/getSurgePricing.js`
- `functions/onNewMessage.js`
- `functions/onRideCompleted.js`
- `functions/processCardPayment.js`
- `functions/processMoMoPayment.js`
- `functions/processMoMoWithdrawal.js`
- `functions/sendMessageNotification.js`
- `functions/triggerSOS.js`

### Lib & Hooks:
- `lib/AuthContext.jsx`
- `lib/constants.js`
- `lib/notificationService.js`
- `lib/query-client.js`
- `lib/utils.js`
- `lib/PageNotFound.jsx`
- `hooks/useServiceWorker.js`
- `hooks/usePushNotifications.js`
- `hooks/useDriverTracking.js`

### API:
- `api/base44Client.js`

### Public Assets:
- `public/sw.js`
- `public/manifest.json`
- `public/logo.png` (or your logo file)

### Configuration:
- `index.html`
- `index.css`
- `tailwind.config.js`
- `main.jsx`

## Step 4: Set Up Secrets (in new app)

Go to Dashboard → Secrets and add:
- `GOOGLE_MAPS_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`
- `SOS_EMERGENCY_PHONE`

## Step 5: Copy Entities

Create these entities in the new app (Dashboard → Entities):

### DriverProfile
```json
{
  "name": "DriverProfile",
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "full_name": {"type": "string"},
    "phone": {"type": "string"},
    "email": {"type": "string"},
    "vehicle_make": {"type": "string"},
    "vehicle_model": {"type": "string"},
    "vehicle_year": {"type": "string"},
    "vehicle_color": {"type": "string"},
    "license_plate": {"type": "string"},
    "ghana_card_url": {"type": "string"},
    "drivers_license_url": {"type": "string"},
    "vehicle_registration_url": {"type": "string"},
    "insurance_url": {"type": "string"},
    "roadworthy_url": {"type": "string"},
    "profile_photo_url": {"type": "string"},
    "approval_status": {"type": "string", "enum": ["pending", "approved", "rejected"], "default": "pending"},
    "is_online": {"type": "boolean", "default": false},
    "current_lat": {"type": "number"},
    "current_lng": {"type": "number"},
    "total_earnings": {"type": "number", "default": 0},
    "total_rides": {"type": "number", "default": 0},
    "rating": {"type": "number", "default": 5.0}
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
    "payment_reference": {"type": "string"},
    "distance_km": {"type": "number"},
    "duration_minutes": {"type": "number"},
    "rider_rating": {"type": "number"},
    "driver_rating": {"type": "number"},
    "rider_feedback": {"type": "string"},
    "driver_feedback": {"type": "string"},
    "rating": {"type": "number"},
    "rider_name": {"type": "string"},
    "driver_name": {"type": "string"}
  },
  "required": ["rider_id", "category", "pickup_address", "destination_address"]
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

### Earning
```json
{
  "name": "Earning",
  "type": "object",
  "properties": {
    "driver_id": {"type": "string"},
    "ride_id": {"type": "string"},
    "amount": {"type": "number"},
    "commission": {"type": "number"},
    "net_amount": {"type": "number"},
    "status": {"type": "string", "enum": ["pending", "available", "withdrawn"], "default": "pending"}
  },
  "required": ["driver_id", "amount"]
}
```

### Withdrawal
```json
{
  "name": "Withdrawal",
  "type": "object",
  "properties": {
    "driver_id": {"type": "string"},
    "amount": {"type": "number"},
    "method": {"type": "string", "default": "mobile_money"},
    "phone_number": {"type": "string"},
    "status": {"type": "string", "enum": ["pending", "processing", "completed", "failed"], "default": "pending"},
    "reference": {"type": "string"}
  },
  "required": ["driver_id", "amount"]
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
    "sender_name": {"type": "string"},
    "message": {"type": "string"},
    "read_by_rider": {"type": "boolean", "default": false},
    "read_by_driver": {"type": "boolean", "default": false},
    "read_at_rider": {"type": "string"},
    "read_at_driver": {"type": "string"}
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
    "address": {"type": "string"},
    "status": {"type": "string", "enum": ["active", "resolved", "false_alarm"], "default": "active"},
    "notes": {"type": "string"},
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

## Step 6: Set Up Automations (in new app)

Go to Dashboard → Automations:

### Auto-Match Rides (Scheduled)
- Function: `autoMatchRides`
- Schedule: Every 1 minute
- Purpose: Match drivers with nearby ride requests

### On Ride Completed (Entity)
- Function: `onRideCompleted`
- Entity: `Ride`
- Event: `update` (when status changes to "completed")
- Purpose: Process driver earnings and ratings

### On New Message (Entity)
- Function: `onNewMessage`
- Entity: `RideMessage`
- Event: `create`
- Purpose: Send push notifications for new messages

## Step 7: Update index.html

Change the app title and meta tags:
```html
<title>HY3N Driver - Drive & Earn</title>
<meta name="description" content="Drive with HY3N and earn money across Ghana" />
<meta property="og:title" content="HY3N Driver" />
```

Update PWA manifest name to "HY3N Driver"

## Step 8: Test the App

1. Register a test driver account
2. Complete driver profile setup
3. Go online and test receiving ride requests
4. Test the complete ride flow
5. Test earnings and withdrawal features

## Notes

- Driver app does NOT need: RiderWallet, RiderProfile (rider version), DestinationSearch, RideBookingSheet, TripTracker (rider version)
- Driver app focuses on: Accepting rides, navigation, earnings, withdrawals
- Both apps share: SOS functionality, messaging, profile management

---

**Need Help?**
Contact Base44 support or refer to the documentation at https://docs.base44.com