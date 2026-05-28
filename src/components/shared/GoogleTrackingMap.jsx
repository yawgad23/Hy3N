import { useEffect } from "react";
import LiveTrackingMap from "./LiveTrackingMap";
import { base44 } from "@/api/base44Client";

/**
 * GoogleTrackingMap Component (Bypassed Frontend Google SDK Load)
 * 
 * To prevent persistent "This page can't load Google Maps correctly" popups caused by 
 * browser HTTP referrer restrictions, this component renders the robust Leaflet Map 
 * directly as the primary map layer.
 * 
 * It still utilizes Google's backend API proxies (via Base44 functions) for accurate
 * route calculation, ETA, and autocomplete, keeping the app high-performance and error-free.
 */
export default function GoogleTrackingMap({
  driverPos,
  pickupPos,
  destPos,
  userPos,
  status,
  height = "100%",
  onEtaUpdate,
  nearbyDrivers = [],
}) {

  // Fetch route and calculate ETA using Google Maps backend proxy
  useEffect(() => {
    if (!driverPos || (!pickupPos && !destPos) || !onEtaUpdate) return;

    const destination = status === "in_progress" ? destPos : pickupPos;
    if (!destination) return;

    const fetchRouteEta = async () => {
      try {
        const response = await base44.functions.invoke("getGoogleMapsRoute", {
          origin: `${driverPos[0]},${driverPos[1]}`,
          destination: `${destination[0]},${destination[1]}`,
        });

        if (response.data?.routes?.length > 0) {
          const leg = response.data.routes[0]?.legs?.[0];
          if (leg) {
            // Convert seconds to minutes
            const minutes = leg.duration?.value
              ? Math.max(1, Math.round(leg.duration.value / 60))
              : Math.max(1, Math.round((leg.distance?.value || 0) / 1000 / 30 * 60)); // fallback: ~30 km/h
            
            onEtaUpdate(minutes);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch ETA from Google Maps route proxy:", err);
      }
    };

    fetchRouteEta();
    // Refresh ETA every 15 seconds during active tracking
    const interval = setInterval(fetchRouteEta, 15000);
    return () => clearInterval(interval);
  }, [driverPos, pickupPos, destPos, status, onEtaUpdate]);

  return (
    <LiveTrackingMap
      driverPos={driverPos}
      pickupPos={pickupPos}
      destPos={destPos}
      userPos={userPos}
      status={status}
      height={height}
      nearbyDrivers={nearbyDrivers}
    />
  );
}
