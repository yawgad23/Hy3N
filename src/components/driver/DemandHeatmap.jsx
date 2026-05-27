import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

let googleMapsLoaded = false;
let loadPromise = null;

async function loadGoogleMaps() {
  if (googleMapsLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    let apiKey = "";
    try {
      const res = await base44.functions.invoke("getGoogleMapsKey", {});
      apiKey = res.data?.key || "";
    } catch (_) {
      // Fallback: load without key (tiles will be watermarked but functional)
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.onload = () => { googleMapsLoaded = true; resolve(); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  })();
  return loadPromise;
}

// Generate grid points around a center location
function generateGridPoints(centerLat, centerLng, radiusKm, gridSize = 8) {
  const points = [];
  const earthRadius = 6371;
  const latStep = (radiusKm / earthRadius) * (180 / Math.PI) / gridSize;
  const lngStep = (radiusKm / earthRadius) * (180 / Math.PI) / gridSize / Math.cos(centerLat * Math.PI / 180);

  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const lat = centerLat + (i - gridSize / 2) * latStep;
      const lng = centerLng + (j - gridSize / 2) * lngStep;
      points.push({ lat, lng, row: i, col: j });
    }
  }
  return points;
}

// Get surge color based on multiplier
function getSurgeColor(multiplier) {
  if (multiplier <= 1.0) return null; // No heatmap for normal demand
  if (multiplier <= 1.2) return "rgba(0, 107, 63, 0.4)"; // Green - low surge
  if (multiplier <= 1.5) return "rgba(212, 175, 55, 0.5)"; // Gold - moderate surge
  if (multiplier <= 1.8) return "rgba(255, 140, 0, 0.6)"; // Orange - high surge
  return "rgba(206, 17, 38, 0.7)"; // Red - very high surge
}

export default function DemandHeatmap({ centerLat, centerLng, isOnline, radiusKm = 8 }) {
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(googleMapsLoaded);
  const [heatOverlay, setHeatOverlay] = useState(null);
  const [demandData, setDemandData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Google Maps SDK
  useEffect(() => {
    loadGoogleMaps().then(() => setLoaded(true));
  }, []);

  // Fetch demand data for grid points
  useEffect(() => {
    if (!isOnline || !centerLat || !centerLng || !loaded) return;

    const fetchDemand = async () => {
      setLoading(true);
      try {
        const gridPoints = generateGridPoints(centerLat, centerLng, radiusKm, 6);
        const results = await Promise.all(
          gridPoints.map(async (point) => {
            try {
              const res = await base44.functions.invoke("getSurgePricing", {
                lat: point.lat,
                lng: point.lng,
                radius_km: 2
              });
              return {
                ...point,
                multiplier: res.data?.multiplier || 1.0,
                demand: res.data?.nearby_demand || 0,
                drivers: res.data?.nearby_drivers || 0
              };
            } catch {
              return { ...point, multiplier: 1.0, demand: 0, drivers: 0 };
            }
          })
        );
        setDemandData(results);
      } catch (error) {
        console.error("Error fetching demand data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemand();
    // Refresh demand data every 2 minutes when online
    const interval = setInterval(fetchDemand, 120000);
    return () => clearInterval(interval);
  }, [centerLat, centerLng, isOnline, loaded, radiusKm]);

  // Initialize map
  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 12,
      disableDefaultUI: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8c8c8c" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#222" }] },
        { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#060d0f" }] },
      ],
    });

    setHeatOverlay(map);
  }, [loaded, centerLat, centerLng]);

  // Draw heatmap polygons
  useEffect(() => {
    if (!heatOverlay || demandData.length === 0) return;

    // Clear existing polygons
    heatOverlay.data.forEach((feature) => {
      if (feature.getProperty("type") === "heatmap") {
        heatOverlay.data.remove(feature);
      }
    });

    // Create grid cells with colors based on surge multiplier
    const earthRadius = 6371;
    const latStep = (radiusKm / earthRadius) * (180 / Math.PI) / 6;
    const lngStep = (radiusKm / earthRadius) * (180 / Math.PI) / 6 / Math.cos(centerLat * Math.PI / 180);

    demandData.forEach((point) => {
      const color = getSurgeColor(point.multiplier);
      if (!color) return;

      const bounds = {
        north: point.lat + latStep / 2,
        south: point.lat - latStep / 2,
        east: point.lng + lngStep / 2,
        west: point.lng - lngStep / 2,
      };

      const polygon = new window.google.maps.Data.Polygon([
        [
          { lat: bounds.north, lng: bounds.west },
          { lat: bounds.north, lng: bounds.east },
          { lat: bounds.south, lng: bounds.east },
          { lat: bounds.south, lng: bounds.west },
        ],
      ]);

      const feature = new window.google.maps.Data.Feature({
        geometry: polygon,
        properties: {
          type: "heatmap",
          multiplier: point.multiplier,
          demand: point.demand,
          drivers: point.drivers
        },
      });

      heatOverlay.data.add(feature);
    });

    // Style the heatmap
    heatOverlay.data.setStyle((feature) => {
      if (feature.getProperty("type") !== "heatmap") return {};
      return {
        fillColor: feature.getProperty("multiplier") > 1.8 ? "rgba(206, 17, 38, 0.7)" :
                   feature.getProperty("multiplier") > 1.5 ? "rgba(255, 140, 0, 0.6)" :
                   feature.getProperty("multiplier") > 1.2 ? "rgba(212, 175, 55, 0.5)" :
                   "rgba(0, 107, 63, 0.4)",
        fillOpacity: 0.6,
        strokeWeight: 0,
      };
    });
  }, [heatOverlay, demandData, centerLat, radiusKm]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {loading && (
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Loading demand...</span>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 z-10">
        <p className="text-xs font-bold text-foreground mb-2">Demand Level</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "rgba(0, 107, 63, 0.5)" }} />
            <span className="text-[10px] text-muted-foreground">Low (1.2x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "rgba(212, 175, 55, 0.6)" }} />
            <span className="text-[10px] text-muted-foreground">Moderate (1.5x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "rgba(255, 140, 0, 0.7)" }} />
            <span className="text-[10px] text-muted-foreground">High (1.8x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "rgba(206, 17, 38, 0.8)" }} />
            <span className="text-[10px] text-muted-foreground">Very High (2.0x+)</span>
          </div>
        </div>
      </div>
    </div>
  );
}