# HY3N Driver App - Setup Guide

## Step 1: Create New Base44 App
1. Go to Base44 Dashboard
2. Click "Create New App"
3. Name it: **HY3N Driver**
4. Copy all files from this guide to the new app

## Step 2: Required Files to Copy

### A. Update index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="https://media.base44.com/images/public/user_6a0b47df1b4c35b2346c0b24/97a3a2b69_ed10837d-36bf-405d-9043-0f9ff87a5b4e.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#0A0A0A" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <title>HY3N Driver - Earn & Drive</title>
    <meta name="description" content="HY3N Driver - Earn money driving in Ghana. Flexible hours, instant payouts, and premium support." />
    <meta name="keywords" content="driver, Ghana, ride-hailing, earnings, driving, income, flexible work" />
    <meta name="author" content="HY3N" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="https://media.base44.com/images/public/user_6a0b47df1b4c35b2346c0b24/97a3a2b69_ed10837d-36bf-405d-9043-0f9ff87a5b4e.png" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <meta property="og:title" content="HY3N Driver - Earn & Drive" />
    <meta property="og:description" content="Earn money driving with HY3N in Ghana" />
    <meta property="og:image" content="https://media.base44.com/images/public/user_6a0b47df1b4c35b2346c0b24/97a3a2b69_ed10837d-36bf-405d-9043-0f9ff87a5b4e.png" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="HY3N Driver - Earn & Drive" />
    <meta name="twitter:description" content="Earn money driving with HY3N in Ghana" />
    <meta name="twitter:image" content="https://media.base44.com/images/public/user_6a0b47df1b4c35b2346c0b24/97a3a2b69_ed10837d-36bf-405d-9043-0f9ff87a5b4e.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### B. Create App.jsx (Driver-only routes)
```jsx
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
import DriverLogin from '@/pages/driver/DriverLogin';
import DriverRegister from '@/pages/driver/DriverRegister';
import DriverEarnings from '@/pages/driver/DriverEarnings';
import DriverHistory from '@/pages/driver/DriverHistory';
import DriverProfile from '@/pages/driver/DriverProfile';
import DriverSupport from '@/pages/driver/DriverSupport';
import DriverScheduledRides from '@/pages/driver/DriverScheduledRides';
import AdminDashboard from '@/pages/admin/AdminDashboard';

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
          <Route path="/driver-app/login" element={<DriverLogin />} />
          <Route path="/driver-app/register" element={<DriverRegister />} />

          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            {/* Driver App — entry point: /driver-app */}
            <Route path="/" element={<DriverGateway />} />
            <Route path="/driver-app" element={<DriverGateway />} />
            <Route path="/driver-app/earnings" element={<DriverEarnings />} />
            <Route path="/driver-app/history" element={<DriverHistory />} />
            <Route path="/driver-app/profile" element={<DriverProfile />} />
            <Route path="/driver-app/support" element={<DriverSupport />} />
            <Route path="/driver-app/scheduled" element={<DriverScheduledRides />} />
            <Route path="/admin" element={<AdminDashboard />} />
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

### Pages (driver folder):
- pages/driver/DriverGateway.jsx
- pages/driver/DriverLogin.jsx
- pages/driver/DriverRegister.jsx
- pages/driver/DriverEarnings.jsx
- pages/driver/DriverHistory.jsx
- pages/driver/DriverProfile.jsx
- pages/driver/DriverSupport.jsx
- pages/driver/DriverScheduledRides.jsx
- pages/driver/DriverHome.jsx
- pages/driver/DriverSetup.jsx

### Components (driver folder):
- components/driver/DemandHeatmap.jsx
- components/driver/ReferFriendModal.jsx
- components/driver/EarningsSummary.jsx

### Shared Components (keep all):
- components/shared/* (all files)
- components/ui/* (all files)
- components/admin/* (all files)

### Pages (keep for auth):
- pages/Login.jsx
- pages/Register.jsx
- pages/ForgotPassword.jsx
- pages/ResetPassword.jsx
- pages/admin/AdminDashboard.jsx

### Other Required Files:
- lib/* (all files)
- hooks/* (all files)
- components/ProtectedRoute.jsx
- components/AuthLayout.jsx
- components/UserNotRegisteredError.jsx
- components/AppEffects.jsx
- components/ErrorBoundary.jsx
- api/base44Client.js
- utils/index.ts
- index.css
- tailwind.config.js
- main.jsx

## Step 4: Set Required Secrets
In the new Driver app, set these secrets:
- GOOGLE_MAPS_API_KEY
- TWILIO_AUTH_TOKEN
- TWILIO_FROM_PHONE
- TWILIO_ACCOUNT_SID
- SOS_EMERGENCY_PHONE

## Step 5: Copy Backend Functions
Copy all backend functions to the new app:
- applyReferralCredit
- autoMatchRides
- generateInviteCode
- getGoogleMapsKey
- getGoogleMapsRoute
- getSurgePricing
- onNewMessage
- onRideCompleted
- processCardPayment
- processMoMoPayment
- processMoMoWithdrawal
- sendMessageNotification
- triggerSOS

## Step 6: Copy Entity Schemas
Copy all entity JSON files to maintain the same database structure:
- Ride.json
- DriverProfile.json
- RiderProfile.json
- Earning.json
- Payment.json
- Wallet.json
- WalletTransaction.json
- LoyaltyPoints.json
- LoyaltyRedemption.json
- Referral.json
- SosIncident.json
- SupportTicket.json
- Withdrawal.json
- RideMessage.json
- Task.json

## Step 7: Test Driver App
1. Navigate to `/driver-app/login` in the new app
2. Register a new driver account
3. Complete driver setup flow
4. Test earnings, history, and profile pages

## App Store Publishing

### Rider App (Current):
- **Name:** HY3N - Ride Ghana
- **Bundle ID:** com.hy3n.rider
- **Description:** Book safe, affordable rides in Ghana
- **Category:** Travel / Transportation

### Driver App (New):
- **Name:** HY3N Driver - Earn & Drive
- **Bundle ID:** com.hy3n.driver
- **Description:** Earn money driving flexibly in Ghana
- **Category:** Business / Finance

---

**Note:** Both apps share the same database, so rides, drivers, and earnings sync automatically between apps.