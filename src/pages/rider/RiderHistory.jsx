import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Calendar, Star } from "lucide-react";
import { format } from "date-fns";
import BottomNav from "@/components/shared/BottomNav";
import Logo from "@/components/shared/Logo";

const statusColors = {
  completed: "text-ghana-green",
  cancelled: "text-destructive",
  in_progress: "text-primary",
  requested: "text-muted-foreground"
};

export default function RiderHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = await base44.auth.me();
      if (user) {
        const data = await base44.entities.Ride.filter(
          { rider_id: user.id },
          "-created_date",
          50
        );
        setRides(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 pt-6 flex items-center gap-3 border-b border-border">
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
            <p className="text-muted-foreground">No rides yet</p>
            <p className="text-sm text-muted-foreground mt-1">Your ride history will appear here</p>
          </div>
        ) : (
          rides.map((ride) => (
            <div key={ride.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-heading font-semibold text-sm capitalize">
                    HY3N {ride.category?.replace("_", " ")}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ride.created_date), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-primary">
                    GH₵{ride.final_fare || ride.fare_estimate}
                  </p>
                  <p className={`text-xs font-medium capitalize ${statusColors[ride.status] || "text-muted-foreground"}`}>
                    {ride.status}
                  </p>
                </div>
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
              {ride.rating && (
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= ride.rating ? "text-primary fill-primary" : "text-muted"}`} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <BottomNav role="rider" />
    </div>
  );
}