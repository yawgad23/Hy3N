import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Bell, CalendarClock, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/shared/Logo";
import BottomNav from "@/components/shared/BottomNav";
import DestinationSearch from "@/components/rider/DestinationSearch";
import RideBookingSheet from "@/components/rider/RideBookingSheet";
import TripTracker from "@/components/rider/TripTracker";
import GoogleTrackingMap from "@/components/shared/GoogleTrackingMap";
import SOSButton from "@/components/shared/SOSButton";

export default function RiderHome() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [location, setLocation] = useState([5.6037, -0.1870]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [destination, setDestination] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [user, setUser] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [eta, setEta] = useState(null);
  const [scheduledConfirm, setScheduledConfirm] = useState(null);
  const [splitFare, setSplitFare] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
    // Handle "Book Again" navigation from history
    if (routeLocation.state?.bookAgain) {
      const { address, lat, lng } = routeLocation.state.bookAgain;
      setDestination({ name: address, lat, lng });
      window.history.replaceState({}, "");
    }
  }, []);

  const handleBookRide = async (bookingData) => {
    const isScheduled = bookingData.ride_type === "scheduled";
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
      ride_type: bookingData.ride_type || "on_demand",
      scheduled_for: bookingData.scheduled_for || null,
      status: isScheduled ? "scheduled" : "requested"
    });
    if (bookingData.split_fare) setSplitFare(bookingData.split_fare);
    setDestination(null);
    if (!isScheduled) {
      setActiveRide(ride);
    } else {
      setScheduledConfirm(ride);
    }
  };

  return (
    <div className="h-screen bg-background relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <SOSButton role="rider" rideId={activeRide?.id || null} location={location} />
          <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
            <Bell className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="h-full">
        <GoogleTrackingMap
          driverPos={activeRide ? driverPos : null}
          pickupPos={activeRide?.pickup_lat ? [activeRide.pickup_lat, activeRide.pickup_lng] : null}
          destPos={activeRide?.destination_lat ? [activeRide.destination_lat, activeRide.destination_lng] : null}
          userPos={location}
          status={activeRide?.status}
          height="100%"
          onEtaUpdate={setEta}
        />
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
            pickupLat={location[0]}
            pickupLng={location[1]}
          />
        )}
      </AnimatePresence>

      {/* Trip Tracker */}
      <AnimatePresence>
        {activeRide && (
          <TripTracker
            ride={activeRide}
            userPos={location}
            onDriverPosUpdate={setDriverPos}
            onClose={() => { setActiveRide(null); setDriverPos(null); setEta(null); setSplitFare(null); }}
            eta={eta}
            splitFare={splitFare}
          />
        )}
      </AnimatePresence>

      {/* Scheduled Confirmation Toast */}
      {scheduledConfirm && (
        <div className="absolute top-20 left-4 right-4 z-50">
          <div className="bg-card border border-ghana-green/40 rounded-2xl p-4 shadow-xl flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-ghana-green flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-heading font-bold text-sm">Trip Scheduled!</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {scheduledConfirm.scheduled_for
                  ? format(parseISO(scheduledConfirm.scheduled_for), "EEE, MMM d 'at' h:mm a")
                  : ""}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{scheduledConfirm.destination_address}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/rider/scheduled")}
                className="text-xs text-primary font-semibold"
              >
                View
              </button>
              <button
                onClick={() => setScheduledConfirm(null)}
                className="text-xs text-muted-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {!searchOpen && !destination && !activeRide && <BottomNav role="rider" />}
    </div>
  );
}