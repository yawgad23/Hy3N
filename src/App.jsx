import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
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
import SplashScreen from '@/components/shared/SplashScreen';
import { base44 } from '@/api/base44Client';

import RiderHome from '@/pages/rider/RiderHome';
import RiderHistory from '@/pages/rider/RiderHistory';
import RiderProfile from '@/pages/rider/RiderProfile';
import RiderSupport from '@/pages/rider/RiderSupport';
import ScheduledTrips from '@/pages/rider/ScheduledTrips';
import RiderWallet from '@/pages/rider/RiderWallet';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminRideReports from '@/components/admin/AdminRideReports';
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
            {/* Rider App */}
            <Route path="/" element={<RiderHome />} />
            <Route path="/history" element={<RiderHistory />} />
            <Route path="/profile" element={<RiderProfile />} />
            <Route path="/support" element={<RiderSupport />} />
            <Route path="/scheduled" element={<ScheduledTrips />} />
            <Route path="/wallet" element={<RiderWallet />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminRideReports />} />
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
  const [showSplash, setShowSplash] = React.useState(() => {
    // Only show splash on first launch (not if user has visited before)
    return !localStorage.getItem('hasVisitedBefore');
  });
  const [isAuth, setIsAuth] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuth(auth);
      if (!auth) {
        setShowSplash(false);
      }
    })();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          {showSplash && isAuth && <SplashScreen onComplete={() => {
            localStorage.setItem('hasVisitedBefore', 'true');
            setShowSplash(false);
          }} />}
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