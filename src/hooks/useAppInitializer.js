import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export function useAppInitializer() {
  const initializeApp = async () => {
    try {
      // Pre-fetch essential data
      const isAuthenticated = await base44.auth.isAuthenticated();
      
      if (isAuthenticated) {
        // User is logged in, pre-fetch profile
        const user = await base44.auth.me();
        console.log('App initialized for user:', user.email);
      } else {
        console.log('App initialized for guest user');
      }
      
      return { success: true };
    } catch (error) {
      console.error('App initialization failed:', error);
      toast.error('Failed to initialize app');
      return { success: false, error };
    }
  };

  return { initializeApp };
}

export default useAppInitializer;