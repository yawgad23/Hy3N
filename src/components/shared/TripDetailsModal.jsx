import { motion } from "framer-motion";
import { X, MapPin, Navigation, Star, Calendar, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoogleTrackingMap from "@/components/shared/GoogleTrackingMap";

export default function TripDetailsModal({ ride, isOpen, onClose, currentUserRole, onReportIssue }) {
  if (!isOpen || !ride) return null;

  const isRider = currentUserRole === "rider";
  const otherUserName = isRider ? ride.driver_name : ride.rider_name;
  const rating = isRider ? ride.rider_rating : ride.driver_rating;
  const feedback = isRider ? ride.rider_feedback : ride.driver_feedback;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card w-full max-h-[90vh] overflow-y-auto rounded-t-3xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-lg">Trip Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Map */}
          <div className="h-48 bg-secondary rounded-xl overflow-hidden border border-border">
            <GoogleTrackingMap
              pickupPos={ride.pickup_lat ? [ride.pickup_lat, ride.pickup_lng] : null}
              destPos={ride.destination_lat ? [ride.destination_lat, ride.destination_lng] : null}
              userPos={ride.pickup_lat ? [ride.pickup_lat, ride.pickup_lng] : [5.6037, -0.187]}
              status="completed"
              height="100%"
            />
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Date</span>
              </div>
              <p className="font-medium text-sm">
                {new Date(ride.created_date).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Time</span>
              </div>
              <p className="font-medium text-sm">
                {new Date(ride.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Distance</span>
              </div>
              <p className="font-medium text-sm">
                {ride.distance_km ? `${ride.distance_km.toFixed(1)} km` : "N/A"}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Fare</span>
              </div>
              <p className="font-heading font-bold text-primary">
                GH₵{(ride.final_fare || ride.fare_estimate || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="bg-secondary rounded-xl p-4 border border-border">
            <h3 className="font-heading font-semibold text-sm mb-3">Route</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ghana-green mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Pickup</p>
                  <p className="text-sm font-medium">{ride.pickup_address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Destination</p>
                  <p className="text-sm font-medium">{ride.destination_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Other User Info */}
          <div className="bg-secondary rounded-xl p-4 border border-border">
            <h3 className="font-heading font-semibold text-sm mb-3">
              {isRider ? "Driver" : "Rider"}
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-heading font-semibold">{otherUserName || "Unknown"}</p>
                {rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-sm text-primary">{rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating & Feedback */}
          {ride.status === "completed" && (
            <div className="bg-secondary rounded-xl p-4 border border-border">
              <h3 className="font-heading font-semibold text-sm mb-3">Rating & Feedback</h3>
              {rating > 0 ? (
                <>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= rating ? "text-primary fill-primary" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  {feedback && (
                    <p className="text-sm text-muted-foreground italic">"{feedback}"</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No rating given for this trip</p>
              )}
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-secondary rounded-xl p-4 border border-border">
            <h3 className="font-heading font-semibold text-sm mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{ride.payment_method || "Cash"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className={`font-medium capitalize ${
                  ride.payment_status === "paid" ? "text-ghana-green" : "text-muted-foreground"
                }`}>
                  {ride.payment_status || "pending"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold">Total Amount</span>
                <span className="font-heading font-bold text-primary">
                  GH₵{(ride.final_fare || ride.fare_estimate || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Report Issue Button - Only for completed rides */}
          {ride.status === "completed" && isRider && onReportIssue && (
            <Button
              onClick={() => {
                onClose();
                onReportIssue(ride);
              }}
              variant="outline"
              className="w-full border-ghana-red/40 text-ghana-red hover:bg-ghana-red/10"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report an Issue
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}