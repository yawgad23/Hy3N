import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageAnalytics } from '@/lib/analytics';
import useAutoLogout from '@/hooks/useAutoLogout';

export default function AppEffects() {
  const location = useLocation();
  const { trackPageView } = usePageAnalytics();
  
  // Auto logout on inactivity
  useAutoLogout();

  // Track page views
  useEffect(() => {
    const pageName = location.pathname.replace('/', '') || 'home';
    trackPageView(pageName);
  }, [location, trackPageView]);

  return null;
}