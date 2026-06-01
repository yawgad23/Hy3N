import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, CalendarClock, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/shared/BottomNav";
import { format, isPast, parseISO, isFuture } from "date-fns";
import { motion } from "framer-motion";

const CATEGORY_LABELS = {
  standard: "Standard",
  xl: "XL",
  executive: "Executive",
  kantanka: "Kantanka",
  okada: "Okada",
  express_delivery: "Express Delivery"
};

export default function DriverScheduledRides() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      loadTrips(u.id);
    });
  }, []);

  const loadTrips = async (userId) => {
    setLoading(true);
    const all = await base44.entities.Ride.filter({ driver_id: userId, ride_type: "scheduled" }, "-scheduled_for");
    setTrips(all);
    setLoading(false);
  };

  const handleAccept = async (trip) => {
    setProcessingId(trip.id);
    await base44.entities.Ride.update(trip.id, { status: "matched" });
    setTrips((prev) => prev.map((t) => t.id === trip.id ? { ...t, status: "matched" } : t));
    setProcessingId(null);
  };

  const handleDecline = async (trip) => {
    setProcessingId(trip.id);
    await base44.entities.Ride.update(trip.id, { status: "cancelled" });
    setTrips((prev) => prev.map((t) => t.id === trip.id ? { ...t, status: "cancelled" } : t));
    setProcessingId(null);
  };

  const upcoming = trips.filter((t) => 
    t.status === "scheduled" && 
    t.scheduled_for && 
    isFuture(parseISO(t.scheduled_for))
  );
  const past = trips.filter((t) => 
    t.status !== "scheduled" || 
    (t.scheduled_for && isPast(parseISO(t.scheduled_for)))
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/driver-app")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-heading font-bold text-lg leading-tight">Scheduled Rides</h1>
          <p className="text-xs text-muted-foreground">Upcoming & past scheduled trips</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Upcoming */}
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h2>
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <CalendarClock className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">No upcoming scheduled rides</p>
                  <p className="text-xs text-muted-foreground mt-1">Rides will appear here when booked</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((trip) => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      onAccept={handleAccept} 
                      onDecline={handleDecline}
                      processingId={processingId} 
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Past / Cancelled */}
            {past.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Past & Cancelled</h2>
                <div className="space-y-3">
                  {past.map((trip) => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      onAccept={null} 
                      onDecline={null}
                      processingId={processingId} 
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <BottomNav role="driver" />
    </div>
  );
}

function TripCard({ trip, onAccept, onDecline, processingId }) {
  const isCancelled = trip.status === "cancelled";
  const isCompleted = trip.status === "completed";
  const isExpired = trip.scheduled_for && isPast(parseISO(trip.scheduled_for)) && trip.status === "scheduled";
  const isPending = trip.status === "scheduled" && trip.scheduled_for && isFuture(parseISO(trip.scheduled_for));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-2xl p-4 ${isCancelled ? "border-border opacity-60" : "border-border"}`}
    >
      {/* Time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {trip.scheduled_for ? format(parseISO(trip.scheduled_for), "EEE, MMM d · h:mm a") : "—"}
            </p>
            <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[trip.category] || trip.category}</p>
          </div>
        </div>
        <StatusBadge status={isCancelled ? "cancelled" : isCompleted ? "completed" : isExpired ? "expired" : "upcoming"} />
      </div>

      {/* Route */}
      <div className="flex items-start gap-2 bg-secondary rounded-xl p-3 mb-3">
        <div className="flex flex-col items-center gap-1 mt-0.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-ghana-green" />
          <div className="w-0.5 h-5 bg-border" />
          <MapPin className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-sm font-medium truncate">{trip.pickup_address}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">To</p>
            <p className="text-sm font-medium truncate">{trip.destination_address}</p>
          </div>
        </div>
        <p className="font-heading font-bold text-primary text-base self-center">GH₵{trip.fare_estimate?.toFixed(2)}</p>
      </div>

      {/* Rider Info */}
      {trip.rider_name && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-secondary/50 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Car className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rider</p>
            <p className="text-sm font-semibold">{trip.rider_name}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {onAccept && isPending && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:bg-destructive/10 border border-destructive/30"
            disabled={processingId === trip.id}
            onClick={() => onDecline(trip)}
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            {processingId === trip.id ? "..." : "Decline"}
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-ghana-green hover:bg-ghana-green/90 text-white"
            disabled={processingId === trip.id}
            onClick={() => onAccept(trip)}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            {processingId === trip.id ? "Accepting..." : "Accept"}
          </Button>
        </div>
      )}

      {/* Status message for expired/cancelled */}
      {isExpired && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
          <AlertCircle className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">This ride was not accepted in time</p>
        </div>
      )}
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const map = {
    upcoming: { label: "Upcoming", classes: "bg-ghana-green/15 text-ghana-green" },
    cancelled: { label: "Cancelled", classes: "bg-destructive/15 text-destructive" },
    completed: { label: "Completed", classes: "bg-primary/15 text-primary" },
    expired: { label: "Expired", classes: "bg-muted text-muted-foreground" }
  };
  const { label, classes } = map[status] || map.upcoming;
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg ${classes}`}>
      {label}
    </span>
  );
}