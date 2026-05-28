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
import DriverMoMoSettings from '@/pages/driver/DriverMoMoSettings';
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
            {/* Driver App — entry point: / */}
            <Route path="/" element={<DriverGateway />} />
            <Route path="/driver-app" element={<DriverGateway />} />
            <Route path="/driver-app/earnings" element={<DriverEarnings />} />
            <Route path="/driver-app/history" element={<DriverHistory />} />
            <Route path="/driver-app/profile" element={<DriverProfile />} />
            <Route path="/driver-app/momo-settings" element={<DriverMoMoSettings />} />
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