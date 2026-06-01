import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, MapPin, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/shared/BottomNav";
import { format, isPast, parseISO } from "date-fns";
import ConnectionStatus from "@/components/shared/ConnectionStatus";
import EmptyState from "@/components/shared/EmptyState";

const CATEGORY_LABELS = {
  standard: "Standard",
  xl: "XL",
  executive: "Executive",
  kantanka: "Kantanka",
  okada: "Okada",
  express_delivery: "Express Delivery"
};

export default function ScheduledTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      loadTrips(u.id);
    });
  }, []);

  const loadTrips = async (userId) => {
    setLoading(true);
    const all = await base44.entities.ScheduledRide.filter({ rider_id: userId }, "-scheduled_for");
    setTrips(all);
    setLoading(false);
  };

  const handleCancel = async (trip) => {
    setCancellingId(trip.id);
    await base44.entities.ScheduledRide.update(trip.id, { status: "cancelled" });
    setTrips((prev) => prev.map((t) => t.id === trip.id ? { ...t, status: "cancelled" } : t));
    setCancellingId(null);
  };

  const upcoming = trips.filter((t) => t.status === "pending" && t.scheduled_for && !isPast(parseISO(t.scheduled_for)));
  const past = trips.filter((t) => t.status !== "pending" || (t.scheduled_for && isPast(parseISO(t.scheduled_for))));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-heading font-bold text-lg leading-tight">Scheduled Trips</h1>
          <p className="text-xs text-muted-foreground">Your upcoming reservations</p>
        </div>
      </div>

      <ConnectionStatus />

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
                <EmptyState
                  type="scheduled"
                  onAction={() => navigate("/")}
                />
              ) : (
                <div className="space-y-3">
                  {upcoming.map((trip) => (
                    <TripCard key={trip.id} trip={trip} onCancel={handleCancel} cancellingId={cancellingId} />
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
                    <TripCard key={trip.id} trip={trip} onCancel={null} cancellingId={cancellingId} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <BottomNav role="rider" />
    </div>
  );
}

function TripCard({ trip, onCancel, cancellingId }) {
  const isCancelled = trip.status === "cancelled";
  const isTriggered = trip.status === "triggered";
  const isExpired = trip.scheduled_for && isPast(parseISO(trip.scheduled_for)) && trip.status === "pending";

  return (
    <div className={`bg-card border rounded-2xl p-4 ${isCancelled ? "border-border opacity-60" : "border-border"}`}>
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
        <StatusBadge status={isCancelled ? "cancelled" : isTriggered ? "triggered" : isExpired ? "expired" : "upcoming"} />
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

      {/* Cancel button */}
      {onCancel && !isCancelled && !isTriggered && !isExpired && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-destructive hover:bg-destructive/10 border border-destructive/30"
          disabled={cancellingId === trip.id}
          onClick={() => onCancel(trip)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          {cancellingId === trip.id ? "Cancelling..." : "Cancel Trip"}
        </Button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    upcoming: { label: "Upcoming", classes: "bg-ghana-green/15 text-ghana-green" },
    cancelled: { label: "Cancelled", classes: "bg-destructive/15 text-destructive" },
    expired: { label: "Expired", classes: "bg-muted text-muted-foreground" },
    triggered: { label: "Ride Requested", classes: "bg-primary/15 text-primary" }
  };
  const { label, classes } = map[status] || map.upcoming;
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg ${classes}`}>
      {label}
    </span>
  );
}