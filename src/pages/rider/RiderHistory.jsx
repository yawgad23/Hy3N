import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/shared/BottomNav";
import Logo from "@/components/shared/Logo";
import TripHistoryCard from "@/components/shared/TripHistoryCard";
import TripDetailsModal from "@/components/shared/TripDetailsModal";
import RideReportModal from "@/components/rider/RideReportModal";
import ConnectionStatus from "@/components/shared/ConnectionStatus";
import EmptyState from "@/components/shared/EmptyState";

const PULL_THRESHOLD = 70;

export default function RiderHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [reportRide, setReportRide] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const touchStartY = useRef(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const handleBookAgain = (ride) => {
    navigate("/", {
      state: {
        bookAgain: {
          address: ride.destination_address,
          lat: ride.destination_lat,
          lng: ride.destination_lng,
        }
      }
    });
  };

  const handleViewDetails = (ride) => {
    setSelectedRide(ride);
    setShowDetails(true);
  };

  const handleReportIssue = (ride) => {
    setReportRide(ride);
    setShowReportModal(true);
  };

  const loadRides = useCallback(async () => {
    const user = await base44.auth.me();
    if (user) {
      const data = await base44.entities.Ride.filter({ rider_id: user.id }, "-created_date", 50);
      setRides(data);
    }
  }, []);

  useEffect(() => {
    loadRides().finally(() => setLoading(false));
  }, [loadRides]);

  const handleTouchStart = (e) => {
    if (scrollRef.current?.scrollTop === 0) touchStartY.current = e.touches[0].clientY;
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
      <div
        className="flex justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: pullY > 0 ? `${pullY}px` : refreshing ? "48px" : "0px" }}
      >
        <RefreshCw className={`w-5 h-5 text-primary ${refreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${pullY * 2}deg)` }} />
      </div>

      <div className="p-4 flex items-center gap-3 border-b border-border" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
        <Logo size="sm" />
        <div>
          <h1 className="font-heading font-bold text-xl">Ride History</h1>
          <p className="text-xs text-muted-foreground">{rides.length} trips</p>
        </div>
      </div>

      <ConnectionStatus />

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rides.length === 0 ? (
          <EmptyState
            type="rides"
            onAction={() => navigate("/")}
          />
        ) : (
          rides.map((ride) => (
            <TripHistoryCard
              key={ride.id}
              ride={ride}
              currentUserRole="rider"
              onBookAgain={handleBookAgain}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>

      <TripDetailsModal
        ride={selectedRide}
        isOpen={showDetails}
        onClose={() => { setShowDetails(false); setSelectedRide(null); }}
        currentUserRole="rider"
        onReportIssue={handleReportIssue}
      />

      <RideReportModal
        ride={reportRide}
        isOpen={showReportModal}
        onClose={() => { setShowReportModal(false); setReportRide(null); }}
      />

      <BottomNav role="rider" />
    </div>
  );
}