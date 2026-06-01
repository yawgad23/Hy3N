import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Bell, CheckCircle2, Clock, Home, Briefcase, Star, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

import BottomNav from "@/components/shared/BottomNav";
import OfflineIndicator from "@/components/shared/OfflineIndicator";
import DestinationSearch from "@/components/rider/DestinationSearch";
import RideBookingSheet from "@/components/rider/RideBookingSheet";
import TripTracker from "@/components/rider/TripTracker";
import GoogleTrackingMap from "@/components/shared/GoogleTrackingMap";
import { requestNotificationPermission, showNotification } from "@/lib/notificationService";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import Onboarding from "@/components/shared/Onboarding";
import ConnectionStatus from "@/components/shared/ConnectionStatus";


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
  const [loading, setLoading] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const { subscribeToPush } = usePushNotifications();



  // Get location immediately on mount (before auth check)
  useEffect(() => {
    if (navigator.geolocation) {
      // Get current position IMMEDIATELY (fast, low accuracy first)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.warn("Quick geolocation error:", err);
        },
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
      );
      // Then get high-accuracy position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.warn("Accurate geolocation error:", err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    let watchId = null;
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(
            (pos) => {
              setLocation([pos.coords.latitude, pos.coords.longitude]);
            },
            (err) => {
              console.warn("Geolocation watch error:", err);
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
          );
        }
        // Load saved places
        if (me?.id) {
          try {
            const profiles = await base44.entities.RiderProfile.filter({ user_id: me.id });
            if (profiles.length > 0 && profiles[0].saved_locations) {
              setSavedPlaces(profiles[0].saved_locations);
            }
          } catch (err) {
            console.warn("Failed to load saved places:", err);
          }
        }
        const granted = await requestNotificationPermission();
        if (granted && me?.id) subscribeToPush(me.id);
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();

    if (routeLocation.state?.bookAgain) {
      const { address, lat, lng } = routeLocation.state.bookAgain;
      setDestination({ name: address, lat, lng });
      window.history.replaceState({}, "");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
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

  // Helper: get saved place by label
  const getSavedPlace = (label) => savedPlaces.find(p => p.name.toLowerCase() === label.toLowerCase());
  const homePlace = getSavedPlace("home");
  const workPlace = getSavedPlace("work");

  // Handle quick-tap on saved place
  const handleQuickPlace = (place) => {
    if (place && place.lat && place.lng) {
      setDestination({ name: place.address || place.name, lat: place.lat, lng: place.lng });
    } else {
      // No saved place — open search to set it
      setSearchOpen(true);
    }
  };

  const handleBookRide = async (bookingData) => {
    const isScheduled = bookingData.ride_type === "scheduled";
    const baseData = {
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
      surge_multiplier: bookingData.surge_multiplier || 1.0,
      stops: bookingData.destination.stops || []
    };

    // Optimistic update
    const optimistic = { ...baseData, id: `optimistic-${Date.now()}` };
    if (bookingData.split_fare) setSplitFare(bookingData.split_fare);
    setDestination(null);

    try {
      if (isScheduled) {
        const scheduled = await base44.entities.ScheduledRide.create({
          ...baseData,
          scheduled_for: bookingData.scheduled_for,
          status: "pending"
        });
        setScheduledConfirm({ ...scheduled, destination_address: bookingData.destination.name });
        showNotification("Trip Scheduled!", `Your ${bookingData.category} ride is scheduled for ${format(new Date(bookingData.scheduled_for), "h:mm a")}.`, "success");
      } else {
        setActiveRide(optimistic);
        const ride = await base44.entities.Ride.create({
          ...baseData,
          ride_type: "on_demand",
          status: "requested"
        });
        setActiveRide(ride);
        showNotification("Looking for a driver...", `Searching for nearby ${bookingData.category} drivers.`, "info");
        
        setTimeout(async () => {
          try {
            const updatedRide = await base44.entities.Ride.read(ride.id);
            if (updatedRide.status === "requested") {
              showNotification("No Drivers Available", `Sorry, no ${bookingData.category} drivers are available right now. Please try again in a few moments.`, "warning");
            }
          } catch (err) {
            console.error("Error checking ride status:", err);
          }
        }, 30000);
      }
    } catch (err) {
      console.error("Booking error:", err);
      showNotification("Booking Failed", "Unable to book your ride. Please try again.", "error");
      setActiveRide(null);
      setDestination(bookingData.destination);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
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
    <div className="h-screen bg-background relative overflow-hidden">
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

      {/* Nearby Cars Indicator (when no active ride) */}
      {!activeRide && nearbyDrivers.length > 0 && (
        <div className="absolute top-28 left-4 z-10 bg-card/90 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-xs font-semibold text-foreground">{nearbyDrivers.length} cars nearby</p>
          </div>
        </div>
      )}

      {/* Where To? Search Bar - Uber/Bolt Style with Saved Places */}
      {!destination && !activeRide && (
        <div className="absolute bottom-0 left-0 right-0 z-20" style={{paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)'}}>
          <div className="bg-card border-t border-border rounded-t-3xl p-4 shadow-2xl">
            {/* Where to? Button */}
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
            
            {/* Saved Places Quick Actions - Uber/Bolt Style */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-hide">
              {/* Home Button */}
              <button 
                onClick={() => handleQuickPlace(homePlace)}
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors whitespace-nowrap min-w-fit"
              >
                <Home className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <span className="text-sm font-semibold block">Home</span>
                  {homePlace ? (
                    <span className="text-[10px] text-muted-foreground block truncate max-w-[100px]">{homePlace.address}</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground block">Set location</span>
                  )}
                </div>
              </button>

              {/* Work Button */}
              <button 
                onClick={() => handleQuickPlace(workPlace)}
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors whitespace-nowrap min-w-fit"
              >
                <Briefcase className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <span className="text-sm font-semibold block">Work</span>
                  {workPlace ? (
                    <span className="text-[10px] text-muted-foreground block truncate max-w-[100px]">{workPlace.address}</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground block">Set location</span>
                  )}
                </div>
              </button>

              {/* Other saved places */}
              {savedPlaces
                .filter(p => p.name.toLowerCase() !== "home" && p.name.toLowerCase() !== "work")
                .slice(0, 3)
                .map((place, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPlace(place)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors whitespace-nowrap min-w-fit"
                  >
                    <Star className="w-4 h-4 text-primary" />
                    <div className="text-left">
                      <span className="text-sm font-semibold block">{place.name}</span>
                      <span className="text-[10px] text-muted-foreground block truncate max-w-[100px]">{place.address}</span>
                    </div>
                  </button>
                ))
              }

              {/* Add place button */}
              <button 
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary/50 border border-dashed border-border rounded-xl hover:bg-secondary/80 transition-colors whitespace-nowrap min-w-fit"
              >
                <Plus className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Add</span>
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
