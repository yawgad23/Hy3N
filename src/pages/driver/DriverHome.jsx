import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Power, MapPin, Navigation, Check, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/shared/Logo";
import BottomNav from "@/components/shared/BottomNav";
import GoogleTrackingMap from "@/components/shared/GoogleTrackingMap";
import { useDriverTracking } from "@/hooks/useDriverTracking";
import RideChatModal from "@/components/shared/RideChatModal";
import RatingModal from "@/components/shared/RatingModal";

export default function DriverHome() {
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState([5.6037, -0.187]);
  const [incomingRide, setIncomingRide] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [completedRide, setCompletedRide] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      if (me) {
        const drivers = await base44.entities.DriverProfile.filter({ user_id: me.id });
        if (drivers.length > 0) {
          setDriver(drivers[0]);
          setIsOnline(drivers[0].is_online || false);
          if (drivers[0].current_lat) setLocation([drivers[0].current_lat, drivers[0].current_lng]);
        }
      }
    }
    load();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  // Poll for incoming rides
  useEffect(() => {
    if (!isOnline || activeRide) return;
    const interval = setInterval(async () => {
      const rides = await base44.entities.Ride.filter({ status: "requested" }, "-created_date", 1);
      if (rides.length > 0 && !incomingRide) setIncomingRide(rides[0]);
    }, 5000);
    return () => clearInterval(interval);
  }, [isOnline, activeRide, incomingRide]);

  // Live position simulation — driver side
  const driverPos = useDriverTracking({
    isDriver: true,
    driverProfileId: driver?.id,
    pickupLat: activeRide?.pickup_lat,
    pickupLng: activeRide?.pickup_lng,
    destLat: activeRide?.destination_lat,
    destLng: activeRide?.destination_lng,
    status: activeRide?.status,
    startLat: location[0],
    startLng: location[1],
  });

  const toggleOnline = async () => {
    if (driver) {
      await base44.entities.DriverProfile.update(driver.id, { is_online: !isOnline });
      setIsOnline(!isOnline);
    }
  };

  const acceptRide = async () => {
    if (!incomingRide || !driver) return;
    await base44.entities.Ride.update(incomingRide.id, {
      status: "matched",
      driver_id: user.id,
      driver_name: driver.full_name
    });
    setActiveRide({ ...incomingRide, status: "matched" });
    setIncomingRide(null);
  };

  const startTrip = async () => {
    if (!activeRide) return;
    await base44.entities.Ride.update(activeRide.id, { status: "in_progress" });
    setActiveRide({ ...activeRide, status: "in_progress" });
  };

  const endTrip = async () => {
    if (!activeRide) return;
    const fare = activeRide.fare_estimate;
    await base44.entities.Ride.update(activeRide.id, { status: "completed", final_fare: fare });
    await base44.entities.Earning.create({
      driver_id: user.id,
      ride_id: activeRide.id,
      amount: fare,
      commission: fare * 0.2,
      net_amount: fare * 0.8,
      status: "available"
    });
    setCompletedRide(activeRide);
    setActiveRide(null);
    setShowRating(true);
  };

  const handleDriverRate = async ({ rating, feedback }) => {
    if (!completedRide) return;
    await base44.entities.Ride.update(completedRide.id, {
      driver_rating: rating,
      driver_feedback: feedback || ""
    });
    // Update rider's average rating in RiderProfile
    const riderProfiles = await base44.entities.RiderProfile.filter({ user_id: completedRide.rider_id });
    if (riderProfiles.length > 0) {
      const rp = riderProfiles[0];
      const allRides = await base44.entities.Ride.filter({ rider_id: completedRide.rider_id });
      const rated = allRides.filter((r) => r.driver_rating > 0);
      const avg = rated.reduce((sum, r) => sum + r.driver_rating, 0) / rated.length;
      await base44.entities.RiderProfile.update(rp.id, { rating: parseFloat(avg.toFixed(2)) });
    }
    setShowRating(false);
    setCompletedRide(null);
  };

  if (driver?.approval_status === "pending") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Logo size="lg" />
        <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mt-8" />
        <h2 className="font-heading font-bold text-xl mt-6">Awaiting Approval</h2>
        <p className="text-muted-foreground text-sm text-center mt-2">
          Your documents are being reviewed. We'll notify you once approved.
        </p>
      </div>
    );
  }

  const pickupPos = activeRide?.pickup_lat ? [activeRide.pickup_lat, activeRide.pickup_lng] : null;
  const destPos = activeRide?.destination_lat ? [activeRide.destination_lat, activeRide.destination_lng] : null;

  return (
    <div className="h-screen bg-background relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
        <Logo size="sm" />
        <button
          onClick={toggleOnline}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
            isOnline
              ? "bg-ghana-green/20 border-ghana-green text-ghana-green"
              : "bg-card border-border text-muted-foreground"
          }`}
        >
          <Power className="w-4 h-4" />
          <span className="text-sm font-medium">{isOnline ? "Online" : "Offline"}</span>
        </button>
      </div>

      {/* Live Map */}
      <div className="h-full">
        <GoogleTrackingMap
          driverPos={activeRide ? driverPos : null}
          pickupPos={pickupPos}
          destPos={destPos}
          userPos={location}
          status={activeRide?.status}
          height="100%"
          onEtaUpdate={setEta}
        />
      </div>

      {/* Offline banner */}
      {!isOnline && !activeRide && (
        <div className="absolute bottom-24 left-4 right-4 z-30 bg-card border border-border rounded-2xl p-5 text-center">
          <Power className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="font-heading font-semibold">You're offline</p>
          <p className="text-sm text-muted-foreground mt-1">Go online to receive ride requests</p>
          <Button onClick={toggleOnline} className="mt-4 bg-ghana-green hover:bg-ghana-green/90 text-white w-full">
            Go Online
          </Button>
        </div>
      )}

      {isOnline && !activeRide && !incomingRide && (
        <div className="absolute bottom-24 left-4 right-4 z-30 bg-card border border-ghana-green/30 rounded-2xl p-5 text-center">
          <div className="w-3 h-3 rounded-full bg-ghana-green mx-auto mb-3 animate-pulse" />
          <p className="font-heading font-semibold text-ghana-green">Waiting for rides...</p>
          <p className="text-sm text-muted-foreground mt-1">Stay in this area for best results</p>
        </div>
      )}

      {/* Incoming Ride */}
      <AnimatePresence>
        {incomingRide && (
          <motion.div
            className="absolute bottom-24 left-4 right-4 z-40 bg-card border border-primary rounded-2xl p-5"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <p className="text-xs text-primary font-medium uppercase tracking-wider mb-2">New Ride Request</p>
            <h3 className="font-heading font-bold text-lg">{incomingRide.rider_name || "Rider"}</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-ghana-green" />
                <p className="text-sm text-muted-foreground truncate">{incomingRide.pickup_address}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground truncate">{incomingRide.destination_address}</p>
              </div>
            </div>
            <p className="font-heading font-bold text-xl text-primary mt-3">GH₵{incomingRide.fare_estimate}</p>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => setIncomingRide(null)} variant="outline" className="flex-1 border-destructive text-destructive">
                <X className="w-4 h-4 mr-2" /> Decline
              </Button>
              <Button onClick={acceptRide} className="flex-1 bg-ghana-green hover:bg-ghana-green/90 text-white">
                <Check className="w-4 h-4 mr-2" /> Accept
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Ride panel */}
      {activeRide && (
        <div className="absolute bottom-20 left-4 right-4 z-30 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-ghana-green font-medium uppercase">
                  {activeRide.status === "matched" ? "Navigate to Pickup" : "Trip in Progress"}
                </p>
                <h3 className="font-heading font-bold">{activeRide.rider_name}</h3>
              </div>
              <div className="text-right">
                <p className="font-heading font-bold text-primary">GH₵{activeRide.fare_estimate}</p>
                {eta && (
                  <p className="text-xs text-muted-foreground mt-0.5">{eta} min ETA</p>
                )}
              </div>
            </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-ghana-green" />
              <p className="text-sm truncate">{activeRide.pickup_address}</p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <p className="text-sm truncate">{activeRide.destination_address}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-border" onClick={() => setShowChat(true)}>
              <MessageSquare className="w-4 h-4 mr-2" /> Chat
            </Button>
            {activeRide.status === "matched" ? (
              <Button onClick={startTrip} className="flex-1 bg-ghana-green hover:bg-ghana-green/90 text-white">
                Start Trip
              </Button>
            ) : (
              <Button onClick={endTrip} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                End Trip
              </Button>
            )}
          </div>
        </div>
      )}

      <RideChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        rideId={activeRide?.id}
        currentUserId={user?.id}
        currentUserRole="driver"
        currentUserName={driver?.full_name || "Driver"}
      />

      <RatingModal
        isOpen={showRating}
        onClose={() => { setShowRating(false); setCompletedRide(null); }}
        onSubmit={handleDriverRate}
        raterRole="driver"
        targetName={completedRide?.rider_name}
      />

      <BottomNav role="driver" />
    </div>
  );
}