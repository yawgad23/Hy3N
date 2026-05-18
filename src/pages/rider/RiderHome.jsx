import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Search, MapPin, Bell } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/shared/Logo";
import BottomNav from "@/components/shared/BottomNav";
import DestinationSearch from "@/components/rider/DestinationSearch";
import RideBookingSheet from "@/components/rider/RideBookingSheet";
import TripTracker from "@/components/rider/TripTracker";

function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function RiderHome() {
  const [location, setLocation] = useState([5.6037, -0.1870]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [destination, setDestination] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  const handleBookRide = async (bookingData) => {
    const ride = await base44.entities.Ride.create({
      rider_id: user?.id || "anonymous",
      rider_name: user?.full_name || "Rider",
      category: bookingData.category,
      pickup_address: "Current Location",
      pickup_lat: location[0],
      pickup_lng: location[1],
      destination_address: bookingData.destination.name,
      destination_lat: bookingData.destination.lat,
      destination_lng: bookingData.destination.lng,
      fare_estimate: bookingData.fare_estimate,
      payment_method: bookingData.payment_method,
      distance_km: bookingData.distance_km,
      status: "requested"
    });
    setActiveRide(ride);
    setDestination(null);
  };

  return (
    <div className="h-screen bg-background relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
        <Logo size="sm" />
        <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
          <Bell className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Map */}
      <div className="h-full">
        <MapContainer
          center={location}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <Marker position={location} />
          <MapCenterUpdater center={location} />
        </MapContainer>
      </div>

      {/* Where To? Button */}
      {!destination && !activeRide && (
        <div className="absolute bottom-24 left-4 right-4 z-30">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-black/30"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="font-heading font-semibold text-foreground">Where to?</p>
              <p className="text-xs text-muted-foreground">Search destination</p>
            </div>
            <MapPin className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Destination Search */}
      <DestinationSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={setDestination}
      />

      {/* Booking Sheet */}
      <AnimatePresence>
        {destination && !activeRide && (
          <RideBookingSheet
            destination={destination}
            onClose={() => setDestination(null)}
            onBook={handleBookRide}
          />
        )}
      </AnimatePresence>

      {/* Trip Tracker */}
      <AnimatePresence>
        {activeRide && (
          <TripTracker
            ride={activeRide}
            userPos={location}
            onClose={() => setActiveRide(null)}
          />
        )}
      </AnimatePresence>

      {!searchOpen && !destination && !activeRide && <BottomNav role="rider" />}
    </div>
  );
}