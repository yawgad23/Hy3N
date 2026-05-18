import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Custom gold driver icon
const driverIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:36px;height:36px;border-radius:50%;
    background:linear-gradient(135deg,#D4AF37,#f0cc5c);
    border:3px solid #0A0A0A;
    box-shadow:0 0 0 2px #D4AF37,0 4px 12px rgba(212,175,55,0.5);
    display:flex;align-items:center;justify-content:center;
  ">
    <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#0A0A0A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
      <path d='M19 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l3 4v6a2 2 0 0 1-2 2z'/><circle cx='7' cy='17' r='2'/><circle cx='17' cy='17' r='2'/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const pickupIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:28px;height:28px;border-radius:50%;
    background:#006B3F;
    border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,107,63,0.5);
  "/>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const destIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:28px;height:28px;border-radius:50%;
    background:#D4AF37;
    border:3px solid #fff;
    box-shadow:0 2px 8px rgba(212,175,55,0.5);
  "/>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function MapUpdater({ center }) {
  const map = useMap();
  const prevCenter = useRef(null);
  useEffect(() => {
    if (!center) return;
    const [lat, lng] = center;
    if (prevCenter.current) {
      const [pLat, pLng] = prevCenter.current;
      if (Math.abs(lat - pLat) < 0.00001 && Math.abs(lng - pLng) < 0.00001) return;
    }
    map.panTo(center, { animate: true, duration: 0.8 });
    prevCenter.current = center;
  }, [center, map]);
  return null;
}

export default function LiveTrackingMap({
  driverPos,
  pickupPos,
  destPos,
  userPos,
  status,
  height = "100%",
}) {
  const center = driverPos || userPos || pickupPos || [5.6037, -0.187];

  const routePoints = [];
  if (driverPos && pickupPos && status !== "in_progress") {
    routePoints.push(driverPos, pickupPos);
  } else if (driverPos && destPos && status === "in_progress") {
    routePoints.push(driverPos, destPos);
  }

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height, width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />

      {/* Dashed route line */}
      {routePoints.length === 2 && (
        <Polyline
          positions={routePoints}
          pathOptions={{ color: "#D4AF37", weight: 3, dashArray: "8 6", opacity: 0.8 }}
        />
      )}

      {/* Driver marker */}
      {driverPos && <Marker position={driverPos} icon={driverIcon} />}

      {/* Pickup marker */}
      {pickupPos && status !== "in_progress" && (
        <Marker position={pickupPos} icon={pickupIcon} />
      )}

      {/* Destination marker */}
      {destPos && <Marker position={destPos} icon={destIcon} />}

      {/* User position (rider only, no active driver) */}
      {userPos && !driverPos && <Marker position={userPos} />}

      <MapUpdater center={driverPos || userPos || pickupPos} />
    </MapContainer>
  );
}