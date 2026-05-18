import { base44 } from "@/api/base44Client";

export function trackEvent(eventName, properties = {}) {
  try {
    base44.analytics.track({
      eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        path: window.location.pathname
      }
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
}

export function usePageAnalytics() {
  const trackPageView = (pageName) => {
    trackEvent('page_view', { page: pageName });
  };

  return { trackPageView };
}

export default trackEvent;