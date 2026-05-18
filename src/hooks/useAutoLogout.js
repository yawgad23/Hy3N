import { useEffect, useState } from 'react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export function useAutoLogout() {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Track user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    // Check for inactivity
    const checkInactivity = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_LIMIT) {
        // Auto logout
        base44.auth.logout();
        toast.info('Logged out due to inactivity');
        window.location.href = '/login';
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(checkInactivity);
    };
  }, [lastActivity]);

  return null;
}

export default useAutoLogout;