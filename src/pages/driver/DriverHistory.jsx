import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Calendar, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import BottomNav from "@/components/shared/BottomNav";
import Logo from "@/components/shared/Logo";

const PULL_THRESHOLD = 70;

export default function DriverHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);
  const scrollRef = useRef(null);

  const loadRides = useCallback(async () => {
    const user = await base44.auth.me();
    if (user) {
      const data = await base44.entities.Ride.filter({ driver_id: user.id }, "-created_date", 50);
      setRides(data);
    }
  }, []);

  useEffect(() => {
    loadRides().finally(() => setLoading(false));
  }, [loadRides]);

  const handleTouchStart = (e) => {
    if (scrollRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (scrollRef.current?.scrollTop > 0) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && delta < 120) setPullY(delta);
  };

  const handleTouchEnd = async () => {
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      await loadRides();
      setRefreshing(false);
    }
    setPullY(0);
  };

  return (
    <div
      ref={scrollRef}
      className="min-h-screen bg-background pb-20 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className="flex justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: pullY > 0 ? `${pullY}px` : refreshing ? "48px" : "0px" }}
      >
        <RefreshCw className={`w-5 h-5 text-primary ${refreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${pullY * 2}deg)` }} />
      </div>

      <div className="p-4 pt-6 flex items-center gap-3 border-b border-border" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
        <Logo size="sm" />
        <h1 className="font-heading font-bold text-xl">Ride History</h1>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No completed rides yet</p>
          </div>
        ) : (
          rides.map((ride) => (
            <div key={ride.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-heading font-semibold text-sm">{ride.rider_name || "Rider"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ride.created_date), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                </div>
                <p className="font-heading font-bold text-ghana-green">
                  GH₵{(ride.final_fare || ride.fare_estimate)?.toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-ghana-green" />
                  <p className="text-xs text-muted-foreground truncate">{ride.pickup_address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground truncate">{ride.destination_address}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav role="driver" />
    </div>
  );
}