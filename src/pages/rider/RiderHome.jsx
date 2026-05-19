import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Bell, CalendarClock, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import Logo from "@/components/shared/Logo";
import BottomNav from "@/components/shared/BottomNav";
import OfflineIndicator from "@/components/shared/OfflineIndicator";
import PWAInstallPrompt from "@/components/shared/PWAInstallPrompt";
import InstallGuide from "@/components/shared/InstallGuide";
import DestinationSearch from "@/components/rider/DestinationSearch";
import RideBookingSheet from "@/components/rider/RideBookingSheet";
import TripTracker from "@/components/rider/TripTracker";
import GoogleTrackingMap from "@/components/shared/GoogleTrackingMap";
import SOSButton from "@/components/shared/SOSButton";
import { requestNotificationPermission, showNotification } from "@/lib/notificationService";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import RiderSplashScreen from "@/components/shared/RiderSplashScreen";

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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const { subscribeToPush } = usePushNotifications();

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          setIsCheckingAuth(false);
          return;
        }
        const me = await base44.auth.me();
        setUser(me);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
            () => {}
          );
        }
        const granted = await requestNotificationPermission();
        if (granted && me?.id) {
          subscribeToPush(me.id);
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    init();
    if (routeLocation.state?.bookAgain) {
      const { address, lat, lng } = routeLocation.state.bookAgain;
      setDestination({ name: address, lat, lng });
      window.history.replaceState({}, "");
    }
  }, []);

  // Real-time notifications for ride status changes
  useEffect(() => {
    if (!activeRide?.id) return;
    
    const unsubscribe = base44.entities.Ride.subscribe((event) => {
      if (event.id === activeRide.id && event.type === "update") {
        const newStatus = event.data.status;
        const oldStatus = activeRide.status;
        
        // Driver arriving notification
        if (newStatus === "driver_arriving" && oldStatus !== "driver_arriving") {
          showNotification(
            "Driver is Arriving!",
            `Your driver ${event.data.driver_name || 'is on the way'} will arrive soon.`,
            "info"
          );
        }
        
        // Driver matched notification
        if (newStatus === "matched" && oldStatus !== "matched") {
          showNotification(
            "Driver Assigned!",
            `Your driver is ${event.data.driver_name || 'on the way'}.`,
            "success"
          );
        }
        
        // Trip completed notification
        if (newStatus === "completed" && oldStatus !== "completed") {
          showNotification(
            "Trip Complete!",
            "You've arrived at your destination.",
            "success"
          );
        }
      }
    });
    
    return () => unsubscribe();
  }, [activeRide?.id, activeRide?.status]);

  const handleBookRide = async (bookingData) => {
    const isScheduled = bookingData.ride_type === "scheduled";
    const rideData = {
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
    };

    // Optimistic update — immediately show the ride in UI
    const optimisticRide = { ...rideData, id: `optimistic-${Date.now()}` };
    if (bookingData.split_fare) setSplitFare(bookingData.split_fare);
    setDestination(null);
    if (!isScheduled) {
      setActiveRide(optimisticRide);
    } else {
      setScheduledConfirm(optimisticRide);
    }

    // Persist in background — replace optimistic with real record
    const ride = await base44.entities.Ride.create({
      ...rideData,
      surge_multiplier: bookingData.surge_multiplier || 1.0
    });
    if (!isScheduled) {
      setActiveRide(ride);
    } else {
      setScheduledConfirm(ride);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen-safe bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen-safe bg-background flex flex-col items-center justify-center px-6 text-center">
        <Logo size="lg" className="mb-6" />
        <h1 className="font-heading font-bold text-2xl mb-2">Welcome to HY3N</h1>
        <p className="text-muted-foreground mb-6">Your ride, your way</p>
        <button
          onClick={() => navigate("/login")}
          className="w-full max-w-xs bg-primary text-primary-foreground font-heading font-semibold py-3 rounded-xl"
        >
          Sign In to Book a Ride
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen-safe bg-background relative">
      {showSplash && <RiderSplashScreen onComplete={() => setShowSplash(false)} />}
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-safe px-4 pb-4 flex items-center justify-between">
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
        <div className="fixed bottom-20 left-4 right-4 z-20 max-w-sm mx-auto" style={{ width: 'calc(100% - 2rem)' }}>
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
                onClick={() => navigate("/scheduled")}
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

      <BottomNav role="rider" />
      <PWAInstallPrompt />
      <InstallGuide />
    </div>
  );
}