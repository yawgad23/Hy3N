import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, Car, Star, LogOut, ChevronRight, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/shared/BottomNav";
import Logo from "@/components/shared/Logo";

export default function DriverProfile() {
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      if (me) {
        const profiles = await base44.entities.DriverProfile.filter({ user_id: me.id });
        if (profiles.length > 0) setDriver(profiles[0]);
      }
    }
    load();
  }, []);

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 pt-6 flex items-center gap-3 border-b border-border">
        <Logo size="sm" />
        <h1 className="font-heading font-bold text-xl">Profile</h1>
      </div>

      <div className="p-4">
        {/* Avatar & Stats */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-primary">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-heading font-bold text-lg mt-3">{driver?.full_name || user?.full_name || "Driver"}</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-medium">{driver?.rating?.toFixed(1) || "5.0"}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{driver?.total_rides || 0} rides</span>
          </div>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            driver?.approval_status === "approved"
              ? "bg-ghana-green/20 text-ghana-green"
              : driver?.approval_status === "rejected"
              ? "bg-destructive/20 text-destructive"
              : "bg-primary/20 text-primary"
          }`}>
            {driver?.approval_status === "approved" ? "Approved" :
             driver?.approval_status === "rejected" ? "Rejected" : "Pending Approval"}
          </div>
        </div>

        {/* Vehicle Info */}
        {driver && (
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold text-sm">Vehicle</span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Make</span>
              <span>{driver.vehicle_make}</span>
              <span className="text-muted-foreground">Model</span>
              <span>{driver.vehicle_model}</span>
              <span className="text-muted-foreground">Color</span>
              <span>{driver.vehicle_color}</span>
              <span className="text-muted-foreground">Plate</span>
              <span>{driver.license_plate}</span>
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="space-y-2">
          <div className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-left text-sm">Documents</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <button
            onClick={() => navigate("/driver/support")}
            className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-left text-sm">Support</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 bg-card border border-destructive/30 rounded-xl mt-4"
          >
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="flex-1 text-left text-sm text-destructive">Log Out</span>
          </button>
        </div>
      </div>

      <BottomNav role="driver" />
    </div>
  );
}