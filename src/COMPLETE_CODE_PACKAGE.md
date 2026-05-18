# 📦 HY3N Complete Code Package

## Project Overview
**HY3N** - Ghana's premium ride-hailing platform  
**Version**: 1.0.0  
**Tech Stack**: React 18 + Vite + Tailwind CSS + Base44 Platform

---

## 📁 File Structure

```
hy3n-app/
├── App.jsx                          # Main app router
├── main.jsx                         # Entry point
├── index.html                       # HTML template
├── index.css                        # Global styles & design tokens
├── tailwind.config.js               # Tailwind configuration
├── package.json                     # Dependencies
├── public/
│   ├── sw.js                        # Service Worker
│   └── manifest.json                # PWA manifest
├── src/
│   ├── api/
│   │   └── base44Client.js          # Base44 SDK client
│   ├── components/
│   │   ├── shared/                  # Shared components
│   │   ├── rider/                   # Rider-specific components
│   │   ├── driver/                  # Driver-specific components
│   │   ├── tasks/                   # Task management components
│   │   ├── admin/                   # Admin components
│   │   └── ui/                      # shadcn/ui components
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utilities & context
│   ├── pages/                       # Page components
│   │   ├── rider/                   # Rider pages
│   │   ├── driver/                  # Driver pages
│   │   └── admin/                   # Admin pages
│   └── functions/                   # Backend functions
└── entities/                        # Database schemas
```

---

## 🔧 Core Configuration Files

### 1. App.jsx (Main Router)
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

// Import all pages
import RoleSelect from '@/pages/RoleSelect';
import RiderHome from '@/pages/rider/RiderHome';
import RiderHistory from '@/pages/rider/RiderHistory';
import RiderProfile from '@/pages/rider/RiderProfile';
import RiderSupport from '@/pages/rider/RiderSupport';
import ScheduledTrips from '@/pages/rider/ScheduledTrips';
import RiderWallet from '@/pages/rider/RiderWallet';
import DriverGateway from '@/pages/driver/DriverGateway';
import DriverEarnings from '@/pages/driver/DriverEarnings';
import DriverHistory from '@/pages/driver/DriverHistory';
import DriverProfile from '@/pages/driver/DriverProfile';
import DriverSupport from '@/pages/driver/DriverSupport';
import DriverScheduledRides from '@/pages/driver/DriverScheduledRides';
import SOSDashboard from '@/pages/admin/SOSDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import Tasks from '@/pages/Tasks';

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
            <Route path="/" element={<RoleSelect />} />
            <Route path="/rider" element={<RiderHome />} />
            <Route path="/rider/history" element={<RiderHistory />} />
            <Route path="/rider/profile" element={<RiderProfile />} />
            <Route path="/rider/support" element={<RiderSupport />} />
            <Route path="/rider/scheduled" element={<ScheduledTrips />} />
            <Route path="/rider/wallet" element={<RiderWallet />} />
            <Route path="/driver" element={<DriverGateway />} />
            <Route path="/driver/earnings" element={<DriverEarnings />} />
            <Route path="/driver/history" element={<DriverHistory />} />
            <Route path="/driver/profile" element={<DriverProfile />} />
            <Route path="/driver/support" element={<DriverSupport />} />
            <Route path="/driver/scheduled" element={<DriverScheduledRides />} />
            <Route path="/admin/sos" element={<SOSDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/tasks" element={<Tasks />} />
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

### 2. index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="YOUR_LOGO_URL" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#0A0A0A" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <title>HY3N — Ride Ghana Forward</title>
    <meta name="description" content="HY3N - Ghana's premium ride-hailing service. Book affordable rides, express deliveries, and luxury transportation." />
    <meta name="keywords" content="ride-hailing, Ghana, taxi, transportation, booking, delivery" />
    <meta name="author" content="HY3N" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="YOUR_LOGO_URL" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <!-- Open Graph / Social -->
    <meta property="og:title" content="HY3N — Ride Ghana Forward" />
    <meta property="og:description" content="Ghana's premium ride-hailing service" />
    <meta property="og:image" content="YOUR_LOGO_URL" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="HY3N — Ride Ghana Forward" />
    <meta name="twitter:description" content="Ghana's premium ride-hailing service" />
    <meta name="twitter:image" content="YOUR_LOGO_URL" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 3. index.css (Design System)
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-heading: 'Outfit', sans-serif;
    --font-body: 'Inter', sans-serif;

    --background: 0 0% 4%;
    --foreground: 45 30% 95%;
    --card: 0 0% 7%;
    --card-foreground: 45 30% 95%;
    --popover: 0 0% 7%;
    --popover-foreground: 45 30% 95%;
    --primary: 43 56% 52%;
    --primary-foreground: 0 0% 4%;
    --secondary: 0 0% 12%;
    --secondary-foreground: 45 30% 90%;
    --muted: 0 0% 14%;
    --muted-foreground: 0 0% 55%;
    --accent: 153 100% 21%;
    --accent-foreground: 45 30% 95%;
    --destructive: 4 84% 44%;
    --destructive-foreground: 45 30% 95%;
    --border: 0 0% 16%;
    --input: 0 0% 16%;
    --ring: 43 56% 52%;
    --chart-1: 43 56% 52%;
    --chart-2: 153 100% 21%;
    --chart-3: 4 84% 44%;
    --chart-4: 45 30% 70%;
    --chart-5: 153 60% 40%;
    --radius: 0.75rem;
    --sidebar-background: 0 0% 6%;
    --sidebar-foreground: 45 30% 90%;
    --sidebar-primary: 43 56% 52%;
    --sidebar-primary-foreground: 0 0% 4%;
    --sidebar-accent: 0 0% 12%;
    --sidebar-accent-foreground: 45 30% 90%;
    --sidebar-border: 0 0% 16%;
    --sidebar-ring: 43 56% 52%;
  }

  .dark {
    --background: 0 0% 4%;
    --foreground: 45 30% 95%;
    --card: 0 0% 7%;
    --card-foreground: 45 30% 95%;
    --popover: 0 0% 7%;
    --popover-foreground: 45 30% 95%;
    --primary: 43 56% 52%;
    --primary-foreground: 0 0% 4%;
    --secondary: 0 0% 12%;
    --secondary-foreground: 45 30% 90%;
    --muted: 0 0% 14%;
    --muted-foreground: 0 0% 55%;
    --accent: 153 100% 21%;
    --accent-foreground: 45 30% 95%;
    --destructive: 4 84% 44%;
    --destructive-foreground: 45 30% 95%;
    --border: 0 0% 16%;
    --input: 0 0% 16%;
    --ring: 43 56% 52%;
    --chart-1: 43 56% 52%;
    --chart-2: 153 100% 21%;
    --chart-3: 4 84% 44%;
    --chart-4: 45 30% 70%;
    --chart-5: 153 60% 40%;
    --sidebar-background: 0 0% 6%;
    --sidebar-foreground: 45 30% 90%;
    --sidebar-primary: 43 56% 52%;
    --sidebar-primary-foreground: 0 0% 4%;
    --sidebar-accent: 0 0% 12%;
    --sidebar-accent-foreground: 45 30% 90%;
    --sidebar-border: 0 0% 16%;
    --sidebar-ring: 43 56% 52%;
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-body;
    overscroll-behavior: none;
  }
  button, a[href], nav a {
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
}
```

### 4. tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)']
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        ghana: {
          gold: '#D4AF37',
          green: '#006B3F',
          red: '#CE1126',
          black: '#0A0A0A'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212,175,55,0.6)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 🗄️ Entity Schemas

### Task Entity
```json
{
  "name": "Task",
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "description": { "type": "string" },
    "status": { "type": "string", "enum": ["pending", "in_progress", "completed"], "default": "pending" },
    "priority": { "type": "string", "enum": ["low", "medium", "high"], "default": "medium" },
    "due_date": { "type": "string", "format": "date" },
    "assignee": { "type": "string" }
  },
  "required": ["title"]
}
```

### Ride Entity
```json
{
  "name": "Ride",
  "type": "object",
  "properties": {
    "rider_id": { "type": "string" },
    "driver_id": { "type": "string" },
    "status": { "type": "string", "enum": ["requested", "scheduled", "matched", "driver_arriving", "in_progress", "completed", "cancelled"] },
    "ride_type": { "type": "string", "enum": ["on_demand", "scheduled"] },
    "scheduled_for": { "type": "string" },
    "category": { "type": "string", "enum": ["standard", "xl", "executive", "kantanka", "express_delivery"] },
    "pickup_address": { "type": "string" },
    "pickup_lat": { "type": "number" },
    "pickup_lng": { "type": "number" },
    "destination_address": { "type": "string" },
    "destination_lat": { "type": "number" },
    "destination_lng": { "type": "number" },
    "fare_estimate": { "type": "number" },
    "final_fare": { "type": "number" },
    "payment_method": { "type": "string", "enum": ["mobile_money", "cash", "card", "wallet"] },
    "payment_status": { "type": "string", "enum": ["pending", "paid", "failed", "refunded"] },
    "distance_km": { "type": "number" },
    "duration_minutes": { "type": "number" }
  },
  "required": ["rider_id", "category", "pickup_address", "destination_address"]
}
```

### DriverProfile Entity
```json
{
  "name": "DriverProfile",
  "type": "object",
  "properties": {
    "user_id": { "type": "string" },
    "full_name": { "type": "string" },
    "phone": { "type": "string" },
    "email": { "type": "string" },
    "vehicle_make": { "type": "string" },
    "vehicle_model": { "type": "string" },
    "vehicle_year": { "type": "string" },
    "vehicle_color": { "type": "string" },
    "license_plate": { "type": "string" },
    "approval_status": { "type": "string", "enum": ["pending", "approved", "rejected"] },
    "is_online": { "type": "boolean", "default": false },
    "current_lat": { "type": "number" },
    "current_lng": { "type": "number" },
    "total_earnings": { "type": "number", "default": 0 },
    "total_rides": { "type": "number", "default": 0 },
    "rating": { "type": "number", "default": 5.0 }
  },
  "required": ["user_id", "full_name", "phone"]
}
```

### RiderProfile Entity
```json
{
  "name": "RiderProfile",
  "type": "object",
  "properties": {
    "user_id": { "type": "string" },
    "full_name": { "type": "string" },
    "phone": { "type": "string" },
    "email": { "type": "string" },
    "preferred_payment": { "type": "string", "enum": ["mobile_money", "cash", "card"] },
    "total_rides": { "type": "number", "default": 0 },
    "rating": { "type": "number", "default": 5.0 },
    "saved_locations": { "type": "array" }
  },
  "required": ["user_id", "full_name", "phone"]
}
```

---

## 🔑 Required Secrets
Set these in Base44 dashboard:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`
- `SOS_EMERGENCY_PHONE`
- `VITE_GOOGLE_MAPS_API_KEY`

---

## 📦 Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.26.0",
    "@tanstack/react-query": "^5.84.1",
    "framer-motion": "^11.16.4",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.475.0",
    "date-fns": "^3.6.0",
    "recharts": "^2.15.4",
    "sonner": "^2.0.1",
    "@radix-ui/react-*": "latest"
  }
}
```

---

## 🚀 Setup Instructions

1. **Install Base44 CLI**: `npm install -g @base44/cli`
2. **Clone/Import**: Import this code to Base44 platform
3. **Set Secrets**: Add required API keys in dashboard
4. **Install Dependencies**: `npm install`
5. **Run Dev**: `npm run dev`
6. **Deploy**: Push to Base44 for auto-deployment

---

## 📱 PWA Setup

### manifest.json
```json
{
  "name": "HY3N - Ride Ghana Forward",
  "short_name": "HY3N",
  "description": "Ghana's premium ride-hailing service",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0A0A",
  "theme_color": "#0A0A0A",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### sw.js (Service Worker)
```javascript
const CACHE_NAME = 'hy3n-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

---

## 🎨 Brand Assets

**Colors**:
- Gold: `#D4AF37`
- Green: `#006B3F`
- Red: `#CE1126`
- Black: `#0A0A0A`

**Fonts**:
- Headings: Outfit (Google Fonts)
- Body: Inter (Google Fonts)

**Logo**: Upload to your preferred CDN and update URLs in index.html

---

## 📞 Support & Documentation

- **Base44 Docs**: https://docs.base44.com
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com
- **Base44 Support**: support@base44.com

---

**Created**: May 2026  
**Version**: 1.0.0  
**License**: Proprietary