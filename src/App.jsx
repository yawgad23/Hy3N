import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import RoleSelect from '@/pages/RoleSelect';
import RiderHome from '@/pages/rider/RiderHome';
import RiderHistory from '@/pages/rider/RiderHistory';
import RiderProfile from '@/pages/rider/RiderProfile';
import RiderSupport from '@/pages/rider/RiderSupport';
import DriverGateway from '@/pages/driver/DriverGateway';
import DriverEarnings from '@/pages/driver/DriverEarnings';
import DriverHistory from '@/pages/driver/DriverHistory';
import DriverProfile from '@/pages/driver/DriverProfile';
import DriverSupport from '@/pages/driver/DriverSupport';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
    <Routes>
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
        <Route path="/driver" element={<DriverGateway />} />
        <Route path="/driver/earnings" element={<DriverEarnings />} />
        <Route path="/driver/history" element={<DriverHistory />} />
        <Route path="/driver/profile" element={<DriverProfile />} />
        <Route path="/driver/support" element={<DriverSupport />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App