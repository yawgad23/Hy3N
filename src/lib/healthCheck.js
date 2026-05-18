import { base44 } from "@/api/base44Client";

export async function checkAppHealth() {
  try {
    // Check if backend is accessible
    const isAuthenticated = await base44.auth.isAuthenticated();
    
    return {
      status: 'healthy',
      authenticated: isAuthenticated,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'degraded',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

export default checkAppHealth;