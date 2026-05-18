import { Calendar, MapPin, Star, User, Navigation, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const statusColors = {
  completed: "text-ghana-green bg-ghana-green/10",
  cancelled: "text-destructive bg-destructive/10",
  in_progress: "text-primary bg-primary/10",
  requested: "text-muted-foreground bg-secondary",
  scheduled: "text-primary bg-primary/10",
};

function StarRow({ rating, label }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3 h-3 ${s <= rating ? "text-primary fill-primary" : "text-muted-foreground"}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function TripHistoryCard({ ride, role, onBookAgain }) {
  const fare = ride.final_fare || ride.fare_estimate;
  const statusLabel = ride.status?.replace("_", " ") || "unknown";
  const statusStyle = statusColors[ride.status] || "text-muted-foreground bg-secondary";

  // From the rider's POV: they gave rider_rating (for the driver), received driver_rating (from the driver)
  // From the driver's POV: they gave driver_rating (for the rider), received rider_rating (from the rider)
  const ratingGiven = role === "rider" ? ride.rider_rating : ride.driver_rating;
  const ratingReceived = role === "rider" ? ride.driver_rating : ride.rider_rating;
  const feedbackGiven = role === "rider" ? ride.rider_feedback : ride.driver_feedback;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-heading font-semibold text-sm capitalize">
            HY3N {ride.category?.replace("_", " ")}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {format(new Date(ride.created_date), "MMM d, yyyy • h:mm a")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-heading font-bold text-primary">
            GH₵{fare ? Number(fare).toFixed(2) : "—"}
          </p>
          <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full ${statusStyle}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Route */}
      <div className="space-y-1.5 pl-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-ghana-green shrink-0" />
          <p className="text-xs text-muted-foreground truncate">{ride.pickup_address || "—"}</p>
        </div>
        <div className="ml-[3px] w-px h-3 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <p className="text-xs text-muted-foreground truncate">{ride.destination_address || "—"}</p>
        </div>
      </div>

      {/* Counterpart */}
      {(role === "rider" ? ride.driver_name : ride.rider_name) && (
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {role === "rider" ? "Driver" : "Rider"}:{" "}
            <span className="text-foreground font-medium">
              {role === "rider" ? ride.driver_name : ride.rider_name}
            </span>
          </p>
          {ride.distance_km && (
            <>
              <span className="text-muted-foreground mx-1">·</span>
              <Navigation className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{ride.distance_km} km</span>
            </>
          )}
        </div>
      )}

      {/* Ratings */}
      {(ratingGiven || ratingReceived) && (
        <div className="pt-2 border-t border-border space-y-1.5">
          <StarRow rating={ratingGiven} label="You rated:" />
          <StarRow rating={ratingReceived} label="You received:" />
          {feedbackGiven && (
            <p className="text-[11px] text-muted-foreground italic mt-1">"{feedbackGiven}"</p>
          )}
        </div>
      )}

      {/* Book Again */}
      {role === "rider" && ride.status === "completed" && onBookAgain && (
        <div className="pt-2 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground h-8 text-xs"
            onClick={() => onBookAgain(ride)}
          >
            <RotateCcw className="w-3 h-3 mr-1.5" /> Book Again
          </Button>
        </div>
      )}
    </div>
  );
}