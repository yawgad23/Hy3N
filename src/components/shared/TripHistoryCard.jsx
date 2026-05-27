import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Calendar, Clock, Navigation, User, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TripHistoryCard({ ride, currentUserRole, onViewDetails }) {
  const [expanded, setExpanded] = useState(false);

  const isRider = currentUserRole === "rider";
  const otherUserName = isRider ? ride.driver_name : ride.rider_name;
  const otherUserRole = isRider ? "Driver" : "Rider";
  const rating = isRider ? ride.rider_rating : ride.driver_rating;
  const feedback = isRider ? ride.rider_feedback : ride.driver_feedback;

  const statusColors = {
    completed: "bg-ghana-green/10 text-ghana-green border-ghana-green/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/30",
    in_progress: "bg-primary/10 text-primary border-primary/30"
  };

  const statusLabels = {
    completed: "Completed",
    cancelled: "Cancelled",
    in_progress: "In Progress"
  };

  return (
    <>
      <motion.div
        layout
        className={cn(
          "bg-card border border-border rounded-2xl p-4 mb-3 cursor-pointer transition-all",
          expanded && "border-primary/50"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm">{otherUserName || "Unknown"}</p>
              <p className="text-xs text-muted-foreground">{otherUserRole}</p>
            </div>
          </div>
          <div className={cn("px-3 py-1 rounded-full text-xs font-medium border", statusColors[ride.status])}>
            {statusLabels[ride.status] || ride.status}
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-ghana-green mt-1.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground flex-1">{ride.pickup_address}</p>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground flex-1">{ride.destination_address}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(ride.created_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{ride.duration_minutes ? `${ride.duration_minutes} min` : "N/A"}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-heading font-bold text-primary">
              GH₵{(ride.final_fare || ride.fare_estimate || 0).toFixed(2)}
            </p>
            {rating > 0 && (
              <div className="flex items-center gap-1 justify-end mt-1">
                <Star className="w-3 h-3 text-primary fill-primary" />
                <span className="text-xs text-primary">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
          <span>Tap for details</span>
        </div>
      </motion.div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border border-primary/30 rounded-2xl p-4 mb-3 overflow-hidden"
        >
          <div className="space-y-4">
            {/* Trip Details */}
            <div>
              <h4 className="font-heading font-semibold text-sm mb-2">Trip Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Date & Time</p>
                  <p className="font-medium">
                    {new Date(ride.created_date).toLocaleDateString()} {new Date(ride.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Distance</p>
                  <p className="font-medium">{ride.distance_km ? `${ride.distance_km.toFixed(1)} km` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Duration</p>
                  <p className="font-medium">{ride.duration_minutes ? `${ride.duration_minutes} minutes` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Ride Type</p>
                  <p className="font-medium capitalize">{ride.category || "Standard"}</p>
                </div>
              </div>
            </div>

            {/* Route Map Placeholder */}
            <div className="bg-secondary rounded-xl h-32 flex items-center justify-center border border-border">
              <div className="text-center">
                <Navigation className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Route visualization</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {ride.pickup_address} → {ride.destination_address}
                </p>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div>
              <h4 className="font-heading font-semibold text-sm mb-2">Fare Breakdown</h4>
              <div className="bg-secondary rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span className="font-medium">GH₵{(ride.fare_estimate || 0).toFixed(2)}</span>
                </div>
                {ride.final_fare && ride.final_fare !== ride.fare_estimate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Final Fare</span>
                    <span className="font-medium">GH₵{ride.final_fare.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="font-semibold">Total Paid</span>
                  <span className="font-heading font-bold text-primary">
                    GH₵{(ride.final_fare || ride.fare_estimate || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Payment Method</span>
                  <span className="capitalize">{ride.payment_method || "Cash"}</span>
                </div>
              </div>
            </div>

            {/* Rating & Feedback */}
            {ride.status === "completed" && (
              <div>
                <h4 className="font-heading font-semibold text-sm mb-2">Rating & Feedback</h4>
                <div className="bg-secondary rounded-xl p-3">
                  {rating > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-4 h-4",
                                star <= rating ? "text-primary fill-primary" : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                      </div>
                      {feedback && (
                        <p className="text-sm text-muted-foreground italic">"{feedback}"</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No rating given for this trip</p>
                  )}
                </div>
              </div>
            )}

            {/* Contact Options */}
            {ride.status === "completed" && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-10 border-border">
                  <Phone className="w-4 h-4 mr-2" /> Call
                </Button>
                <Button variant="outline" className="flex-1 h-10 border-border">
                  <MessageSquare className="w-4 h-4 mr-2" /> Message
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {onViewDetails && (
                <Button 
                  onClick={(e) => { e.stopPropagation(); onViewDetails(ride); }} 
                  variant="outline" 
                  className="flex-1 border-border"
                >
                  View on Map
                </Button>
              )}
              <Button 
                onClick={(e) => { e.stopPropagation(); setExpanded(false); }} 
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}