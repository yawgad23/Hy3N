# Files to Copy to Driver App

## Copy These Folders/Files:

### 1. Pages (driver folder)
Copy entire folder: `pages/driver/`
- DriverGateway.jsx
- DriverLogin.jsx
- DriverRegister.jsx
- DriverEarnings.jsx
- DriverHistory.jsx
- DriverProfile.jsx
- DriverSupport.jsx
- DriverScheduledRides.jsx
- DriverHome.jsx
- DriverSetup.jsx

### 2. Components (driver folder)
Copy entire folder: `components/driver/`
- DemandHeatmap.jsx
- ReferFriendModal.jsx
- EarningsSummary.jsx

### 3. Shared Components (keep all)
Copy entire folders:
- `components/shared/`
- `components/ui/`
- `components/admin/`

### 4. Required Pages
Copy these files:
- pages/Login.jsx
- pages/Register.jsx
- pages/ForgotPassword.jsx
- pages/ResetPassword.jsx
- pages/admin/AdminDashboard.jsx

### 5. Library Files
Copy entire folders:
- `lib/`
- `hooks/`
- `api/`
- `utils/`

### 6. Other Required Files
- components/ProtectedRoute.jsx
- components/AuthLayout.jsx
- components/UserNotRegisteredError.jsx
- components/AppEffects.jsx
- components/ErrorBoundary.jsx
- main.jsx

### 7. Configuration Files
- index.css
- tailwind.config.js

### 8. Replace These Files
**DO NOT copy - use the files in driver-app-files folder instead:**
- App.jsx (use driver-app-files/App.jsx)
- index.html (use driver-app-files/index.html)

---

## After Copying:

1. **Set Secrets** (in Base44 Dashboard → Settings → Secrets):
   - GOOGLE_MAPS_API_KEY
   - TWILIO_AUTH_TOKEN
   - TWILIO_FROM_PHONE
   - TWILIO_ACCOUNT_SID
   - SOS_EMERGENCY_PHONE

2. **Copy Backend Functions** (Dashboard → Code → Functions):
   Copy all functions from original app:
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

3. **Copy Entity Schemas** (Dashboard → Database → Entities):
   Copy all entities to maintain same database structure:
   - Ride
   - DriverProfile
   - RiderProfile
   - Earning
   - Payment
   - Wallet
   - WalletTransaction
   - LoyaltyPoints
   - LoyaltyRedemption
   - Referral
   - SosIncident
   - SupportTicket
   - Withdrawal
   - RideMessage
   - Task

4. **Test the App:**
   - Navigate to `/driver-app/login`
   - Register a driver account
   - Complete driver setup
   - Test earnings and history pages

---

**Both apps share the same database** - rides, drivers, and earnings sync automatically!