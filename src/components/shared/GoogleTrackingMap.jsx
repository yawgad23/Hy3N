import { useEffect, useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Load Google Maps SDK without API key (key is handled server-side for API calls)
let googleMapsLoaded = false;
let loadPromise = null;

function loadGoogleMaps() {
  if (googleMapsLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    // Load without key - we'll use backend for Directions API calls
    script.src = `https://maps.googleapis.com/maps/api/js?libraries=geometry`;
    script.async = true;
    script.onload = () => { googleMapsLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return loadPromise;
}

function calcEtaFromDistance(meters) {
  const minutes = Math.max(1, Math.round(meters / 1000 / 30 * 60)); // ~30 km/h
  return minutes;
}

export default function GoogleTrackingMap({
  driverPos,
  pickupPos,
  destPos,
  userPos,
  status,
  height = "100%",
  onEtaUpdate,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routeRendererRef = useRef(null);
  const [loaded, setLoaded] = useState(googleMapsLoaded);

  // Load Google Maps SDK once
  useEffect(() => {
    loadGoogleMaps().then(() => setLoaded(true));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const center = toLatLng(driverPos || userPos || pickupPos || [5.6037, -0.187]);
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      disableDefaultUI: true,
      styles: darkMapStyles,
    });
    routeRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#D4AF37",
        strokeWeight: 4,
        strokeOpacity: 0.85,
      },
    });
    routeRendererRef.current.setMap(mapInstanceRef.current);
  }, [loaded]);

  // Update markers & route whenever positions change
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Driver marker
    if (driverPos) {
      if (!markersRef.current.driver) {
        markersRef.current.driver = new window.google.maps.Marker({
          map,
          icon: driverMarkerIcon(),
          zIndex: 10,
        });
      }
      markersRef.current.driver.setPosition(toLatLng(driverPos));
    }

    // Pickup marker
    if (pickupPos && status !== "in_progress") {
      if (!markersRef.current.pickup) {
        markersRef.current.pickup = new window.google.maps.Marker({
          map,
          icon: dotIcon("#006B3F"),
          title: "Pickup",
        });
      }
      markersRef.current.pickup.setPosition(toLatLng(pickupPos));
    } else if (markersRef.current.pickup && status === "in_progress") {
      markersRef.current.pickup.setMap(null);
      delete markersRef.current.pickup;
    }

    // Destination marker
    if (destPos) {
      if (!markersRef.current.dest) {
        markersRef.current.dest = new window.google.maps.Marker({
          map,
          icon: dotIcon("#D4AF37"),
          title: "Destination",
        });
      }
      markersRef.current.dest.setPosition(toLatLng(destPos));
    }

    // User/rider marker (when no driver)
    if (userPos && !driverPos) {
      if (!markersRef.current.user) {
        markersRef.current.user = new window.google.maps.Marker({
          map,
          icon: dotIcon("#D4AF37"),
          title: "You",
        });
      }
      markersRef.current.user.setPosition(toLatLng(userPos));
    }

    // Pan map to follow driver (or user)
    const focusPos = driverPos || userPos || pickupPos;
    if (focusPos) map.panTo(toLatLng(focusPos));

    // Draw Directions route + compute ETA
    if (driverPos && (pickupPos || destPos)) {
      const origin = toLatLng(driverPos);
      const destination = status === "in_progress" ? toLatLng(destPos) : toLatLng(pickupPos);
      if (destination) {
        // Use backend proxy for Directions API (keeps API key secure)
        base44.functions.invoke("getGoogleMapsRoute", {
          origin: `${driverPos[0]},${driverPos[1]}`,
          destination: `${destination.lat},${destination.lng}`
        }).then((response) => {
          if (response.data?.routes?.length > 0) {
            const result = { routes: response.data.routes };
            routeRendererRef.current.setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg && onEtaUpdate) {
              const minutes = leg.duration?.value
                ? Math.max(1, Math.round(leg.duration.value / 60))
                : calcEtaFromDistance(leg.distance?.value || 0);
              onEtaUpdate(minutes);
            }
          }
        }).catch((error) => {
          console.error("Failed to fetch route:", error);
        });
      }
    } else if (routeRendererRef.current) {
      routeRendererRef.current.setDirections({ routes: [] });
    }
  }, [loaded, driverPos, pickupPos, destPos, userPos, status]);

  if (!loaded) {
    return (
      <div style={{ height }} className="w-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <div ref={mapRef} style={{ height, width: "100%" }} />;
}

// ── helpers ────────────────────────────────────────────────────────────────

function toLatLng([lat, lng]) {
  return { lat, lng };
}

function dotIcon(color) {
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#fff",
    strokeWeight: 2.5,
  };
}

function driverMarkerIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="19" fill="#D4AF37" stroke="#0A0A0A" stroke-width="2"/>
      <path d="M27 25H13a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h10l3 4v4a2 2 0 0 1-2 2z"
        fill="none" stroke="#0A0A0A" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="15.5" cy="25" r="1.8" fill="#0A0A0A"/>
      <circle cx="24.5" cy="25" r="1.8" fill="#0A0A0A"/>
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20),
  };
}

// Dark theme styles for Google Maps
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8c8c8c" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#333" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#444" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#111" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#555" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#0d2010" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#222" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#191919" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#888" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#060d0f" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#333" }] },
];