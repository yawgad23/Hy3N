import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
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
import RiderSplashScreen from '@/components/shared/RiderSplashScreen';

// Rider Pages
import RiderHome from '@/pages/rider/RiderHome';
import RiderHistory from '@/pages/rider/RiderHistory';
import RiderProfile from '@/pages/rider/RiderProfile';
import RiderSupport from '@/pages/rider/RiderSupport';
import ScheduledTrips from '@/pages/rider/ScheduledTrips';
import RiderWallet from '@/pages/rider/RiderWallet';
import Safety from '@/pages/rider/Safety';

// Driver Pages
import DriverGateway from '@/pages/driver/DriverGateway';
import DriverLogin from '@/pages/driver/DriverLogin';
import DriverRegister from '@/pages/driver/DriverRegister';
import DriverEarnings from '@/pages/driver/DriverEarnings';
import DriverHistory from '@/pages/driver/DriverHistory';
import DriverProfile from '@/pages/driver/DriverProfile';
import DriverSupport from '@/pages/driver/DriverSupport';
import DriverScheduledRides from '@/pages/driver/DriverScheduledRides';
import DriverMoMoSettings from '@/pages/driver/DriverMoMoSettings';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPortal from '@/pages/admin/AdminPortal';
import AdminRideReports from '@/components/admin/AdminRideReports';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const [splashDone, setSplashDone] = useState(false);

  // Check if we're on a driver route - skip rider splash for drivers
  const isDriverRoute = location.pathname.startsWith('/driver-app');

  // Show splash screen only for rider routes (Uber/Bolt style)
  if (!splashDone && !isDriverRoute) {
    return <RiderSplashScreen onComplete={() => setSplashDone(true)} />;
  }

  // After splash, show loading spinner if auth is still checking
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // For driver routes, redirect to driver login
      if (isDriverRoute) {
        window.location.href = "/driver-app/login";
        return null;
      }
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
          {/* Auth Routes (shared) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Driver Auth Routes (no protection needed - handled by DriverGateway) */}
          <Route path="/driver-app/login" element={<DriverLogin />} />
          <Route path="/driver-app/register" element={<DriverRegister />} />

          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            {/* Rider App */}
            <Route path="/" element={<RiderHome />} />
            <Route path="/history" element={<RiderHistory />} />
            <Route path="/profile" element={<RiderProfile />} />
            <Route path="/support" element={<RiderSupport />} />
            <Route path="/scheduled" element={<ScheduledTrips />} />
            <Route path="/wallet" element={<RiderWallet />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Driver App */}
            <Route path="/driver-app" element={<DriverGateway />} />
            <Route path="/driver-app/earnings" element={<DriverEarnings />} />
            <Route path="/driver-app/history" element={<DriverHistory />} />
            <Route path="/driver-app/profile" element={<DriverProfile />} />
            <Route path="/driver-app/support" element={<DriverSupport />} />
            <Route path="/driver-app/scheduled" element={<DriverScheduledRides />} />
            <Route path="/driver-app/momo-settings" element={<DriverMoMoSettings />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminRideReports />} />
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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppEffects />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App
