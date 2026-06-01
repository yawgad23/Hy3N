import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, MapPin, Car, Users, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLiveMap() {
  const [drivers, setDrivers] = useState([]);
  const [activeRides, setActiveRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [d, r] = await Promise.all([
        base44.entities.DriverProfile.list("-created_date", 500),
        base44.entities.Ride.list("-created_date", 200),
      ]);
      setDrivers(d);
      setActiveRides(r.filter(ride => ["matched", "driver_arriving", "in_progress"].includes(ride.status)));
    } catch (err) {
      console.error("Failed to load live data:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  const onlineDrivers = drivers.filter(d => d.is_online);
  const offlineDrivers = drivers.filter(d => !d.is_online);
  const driversWithLocation = onlineDrivers.filter(d => d.current_lat && d.current_lng);

  // Find active ride for a driver
  const getDriverRide = (driverId) => activeRides.find(r => r.driver_id === driverId);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Live Map</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time driver locations and active rides</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-border"
            />
            Auto-refresh (15s)
          </label>
          <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Circle className="w-5 h-5 text-green-500 fill-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Online Drivers</p>
            <p className="font-heading font-bold text-xl text-green-500">{onlineDrivers.length}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Circle className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Offline Drivers</p>
            <p className="font-heading font-bold text-xl text-red-500">{offlineDrivers.length}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Rides</p>
            <p className="font-heading font-bold text-xl">{activeRides.length}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">With GPS Location</p>
            <p className="font-heading font-bold text-xl text-blue-500">{driversWithLocation.length}</p>
          </div>
        </div>
      </div>

      {/* Map + Driver List */}
      <div className="grid grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="col-span-2 bg-card border border-border rounded-2xl overflow-hidden" style={{ height: "500px" }}>
          <div id="admin-live-map" className="w-full h-full relative">
            {/* Google Map will be rendered here */}
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {driversWithLocation.length} drivers with active GPS
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Map renders in production with Google Maps API
                </p>
                {/* Coordinate grid display */}
                <div className="mt-4 max-h-60 overflow-y-auto">
                  {driversWithLocation.map(d => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDriver(d)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-left transition-colors ${
                        selectedDriver?.id === d.id ? "bg-primary/20" : "hover:bg-secondary"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${getDriverRide(d.user_id) ? "bg-yellow-500" : "bg-green-500"}`} />
                      <span className="text-xs font-medium truncate flex-1">{d.full_name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {d.current_lat?.toFixed(4)}, {d.current_lng?.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Details Panel */}
        <div className="bg-card border border-border rounded-2xl p-5 overflow-y-auto" style={{ maxHeight: "500px" }}>
          <p className="font-heading font-semibold text-sm mb-4">
            {selectedDriver ? "Driver Details" : "Online Drivers"}
          </p>

          {selectedDriver ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-xs text-primary hover:underline"
              >
                ← Back to list
              </button>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{selectedDriver.full_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDriver.phone}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium ${selectedDriver.is_online ? "text-green-500" : "text-red-500"}`}>
                      {selectedDriver.is_online ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Vehicle</span>
                    <span className="font-medium">{selectedDriver.vehicle_make} {selectedDriver.vehicle_model}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Color</span>
                    <span className="font-medium">{selectedDriver.vehicle_color}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Plate</span>
                    <span className="font-medium font-mono">{selectedDriver.license_plate}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium">⭐ {selectedDriver.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Total Rides</span>
                    <span className="font-medium">{selectedDriver.total_rides || 0}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">MoMo</span>
                    <span className="font-medium">{selectedDriver.momo_number || "Not set"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">MoMo Provider</span>
                    <span className="font-medium capitalize">{selectedDriver.momo_provider || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-mono text-xs">
                      {selectedDriver.current_lat?.toFixed(5)}, {selectedDriver.current_lng?.toFixed(5)}
                    </span>
                  </div>

                  {/* Active Ride */}
                  {getDriverRide(selectedDriver.user_id) && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <p className="text-xs font-bold text-yellow-600 mb-1">Active Ride</p>
                      <p className="text-xs">From: {getDriverRide(selectedDriver.user_id).pickup_address || "N/A"}</p>
                      <p className="text-xs">To: {getDriverRide(selectedDriver.user_id).destination_address || "N/A"}</p>
                      <p className="text-xs mt-1">
                        Status: <span className="capitalize font-medium">{getDriverRide(selectedDriver.user_id).status?.replace(/_/g, " ")}</span>
                      </p>
                      <p className="text-xs">Fare: GH₵{getDriverRide(selectedDriver.user_id).fare_estimate || 0}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {onlineDrivers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No drivers online</p>
              ) : (
                onlineDrivers.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDriver(d)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getDriverRide(d.user_id) ? "bg-yellow-500" : "bg-green-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.full_name}</p>
                      <p className="text-xs text-muted-foreground">{d.vehicle_make} {d.vehicle_model} • {d.license_plate}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-muted-foreground">
                        {getDriverRide(d.user_id) ? "On trip" : "Available"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
