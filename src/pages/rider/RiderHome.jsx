import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Bell, CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

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
import Onboarding from "@/components/shared/Onboarding";
import ConnectionStatus from "@/components/shared/ConnectionStatus";
import RiderSplashScreen from "@/components/shared/RiderSplashScreen";
import PromotionsBanner from "@/components/rider/PromotionsBanner";

export default function RiderHome() {
  // All hooks must be called at the top level, before any conditional returns
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [location, setLocation] = useState([5.6037, -0.1870]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [destination, setDestination] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [user, setUser] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [eta, setEta] = useState(null);
  const [scheduledConfirm, setScheduledConfirm] = useState(null);
  const [splitFare, setSplitFare] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem('hasVisitedBefore'));
  const { subscribeToPush } = usePushNotifications();

  // Hide splash timer (runs once on mount)
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        localStorage.setItem('hasVisitedBefore', 'true');
        setShowSplash(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // All hooks must be called before any conditional returns
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

  // Fetch nearby drivers when no active ride
  const fetchNearbyDrivers = useCallback(async () => {
    if (!user || activeRide) return;
    try {
      const res = await base44.functions.invoke("getNearbyDrivers", {
        lat: location[0],
        lng: location[1],
        radius: 5000
      });
      setNearbyDrivers(res.data?.drivers || []);
    } catch (err) {
      console.error("Failed to fetch nearby drivers:", err);
    }
  }, [user, activeRide, location]);

  useEffect(() => {
    if (!user || activeRide) return;
    fetchNearbyDrivers();
    const interval = setInterval(fetchNearbyDrivers, 10000);
    return () => clearInterval(interval);
  }, [user, activeRide, fetchNearbyDrivers]);

  useEffect(() => {
    if (!activeRide?.id) return;
    
    const unsubscribe = base44.entities.Ride.subscribe((event) => {
      if (event.id === activeRide.id && event.type === "update") {
        const newStatus = event.data.status;
        const oldStatus = activeRide.status;
        if (newStatus === "driver_arriving" && oldStatus !== "driver_arriving") {
          showNotification("Driver is Arriving!", `Your driver ${event.data.driver_name || 'is on the way'} will arrive soon.`, "info");
        }
        if (newStatus === "matched" && oldStatus !== "matched") {
          showNotification("Driver Assigned!", `Your driver is ${event.data.driver_name || 'on the way'}.`, "success");
        }
        if (newStatus === "completed" && oldStatus !== "completed") {
          showNotification("Trip Complete!", "You've arrived at your destination.", "success");
        }
      }
    });
    return () => unsubscribe();
  }, [activeRide?.id, activeRide?.status]);

  // Conditional return AFTER all hooks
  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

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
      <>
        <RiderSplashScreen onComplete={() => setIsCheckingAuth(false)} />
        <div className="h-screen-safe bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <RiderSplashScreen onComplete={() => setIsCheckingAuth(false)} />
        <div className="h-screen-safe bg-background flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-heading font-bold text-2xl mb-2">Welcome to HY3N</h1>
          <p className="text-muted-foreground mb-6">Your ride, your way</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full max-w-xs bg-primary text-primary-foreground font-heading font-semibold py-3 rounded-xl"
          >
            Sign In to Book a Ride
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="h-screen-safe bg-background relative">
      {/* Connection Status Banner */}
      <ConnectionStatus />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-safe px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">H</span>
          </div>
          <span className="font-heading font-bold text-sm">HY3N</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </button>
      </div>

      {/* Map - Full Screen */}
      <div className="absolute inset-0 z-0">
        <GoogleTrackingMap
          driverPos={activeRide ? driverPos : null}
          pickupPos={activeRide?.pickup_lat ? [activeRide.pickup_lat, activeRide.pickup_lng] : null}
          destPos={activeRide?.destination_lat ? [activeRide.destination_lat, activeRide.destination_lng] : null}
          userPos={location}
          status={activeRide?.status}
          nearbyDrivers={!activeRide ? nearbyDrivers : []}
          height="100%"
          onEtaUpdate={setEta}
        />
      </div>

      {/* Promotions Banner (when no active ride) */}
      {!activeRide && (
        <div className="absolute top-28 left-4 right-4 z-10">
          <PromotionsBanner />
        </div>
      )}

      {/* Nearby Cars Indicator (when no active ride) */}
      {!activeRide && nearbyDrivers.length > 0 && (
        <div className="absolute top-40 left-4 z-10 bg-card/90 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-xs font-semibold text-foreground">{nearbyDrivers.length} cars nearby</p>
          </div>
        </div>
      )}

      {/* Where To? Search Bar - Uber/Bolt Style */}
      {!destination && !activeRide && (
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe">
          <div className="bg-card border-t border-border rounded-t-3xl p-4 shadow-2xl">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full bg-secondary hover:bg-secondary/80 rounded-2xl p-4 flex items-center gap-4 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-left flex-1">
                <p className="font-heading font-bold text-lg text-foreground">Where to?</p>
                <p className="text-sm text-muted-foreground">Enter your destination</p>
              </div>
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </button>
            
            {/* Quick Actions */}
            <div className="flex gap-3 mt-4 overflow-x-auto">
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors whitespace-nowrap">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Home</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors whitespace-nowrap">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Work</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors whitespace-nowrap">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Recent</span>
              </button>
            </div>
          </div>
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
    </div>
  );
}