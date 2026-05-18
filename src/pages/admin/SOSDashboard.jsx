import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle2, XCircle, MapPin, Clock, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

const STATUS_CONFIG = {
  active: { label: "Active", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
  resolved: { label: "Resolved", color: "text-ghana-green", bg: "bg-ghana-green/10 border-ghana-green/30" },
  false_alarm: { label: "False Alarm", color: "text-muted-foreground", bg: "bg-secondary border-border" }
};

export default function SOSDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadIncidents();

    // Real-time subscription
    const unsub = base44.entities.SosIncident.subscribe((event) => {
      if (event.type === "create") {
        setIncidents((prev) => [event.data, ...prev]);
      } else if (event.type === "update") {
        setIncidents((prev) => prev.map((i) => (i.id === event.id ? event.data : i)));
      }
    });
    return unsub;
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    const all = await base44.entities.SosIncident.list("-created_date", 100);
    setIncidents(all);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await base44.entities.SosIncident.update(id, { status });
  };

  const filtered = filter === "all" ? incidents : incidents.filter((i) => i.status === filter);
  const activeCount = incidents.filter((i) => i.status === "active").length;

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="font-heading font-bold text-xl">Admin Access Only</h2>
        <p className="text-muted-foreground text-sm mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg">SOS Dashboard</h1>
              <p className="text-xs text-muted-foreground">Emergency incidents</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-destructive text-white text-xs font-bold animate-pulse">
                {activeCount} Active
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={loadIncidents}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {["active", "resolved", "false_alarm", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {f === "false_alarm" ? "False Alarm" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-ghana-green mx-auto mb-3" />
            <p className="font-heading font-semibold">No {filter !== "all" ? filter : ""} incidents</p>
            <p className="text-sm text-muted-foreground mt-1">All clear!</p>
          </div>
        )}

        {filtered.map((incident) => {
          const cfg = STATUS_CONFIG[incident.status] || STATUS_CONFIG.active;
          return (
            <div
              key={incident.id}
              className={`bg-card border rounded-2xl p-4 ${incident.status === "active" ? "border-destructive/40 shadow-destructive/10 shadow-lg" : "border-border"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-full">
                      {incident.user_role}
                    </span>
                    {incident.sms_sent && (
                      <span className="text-xs text-ghana-green bg-ghana-green/10 px-2 py-0.5 rounded-full">
                        SMS Sent
                      </span>
                    )}
                  </div>
                  <p className="font-heading font-bold">{incident.user_name || "Unknown User"}</p>
                  {incident.lat && (
                    <a
                      href={`https://maps.google.com/?q=${incident.lat},${incident.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary mt-1"
                    >
                      <MapPin className="w-3 h-3" />
                      {incident.lat.toFixed(5)}, {incident.lng.toFixed(5)} — View on Map
                    </a>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {incident.created_date
                        ? format(parseISO(incident.created_date), "MMM d, yyyy 'at' h:mm a")
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              {incident.status === "active" && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 bg-ghana-green hover:bg-ghana-green/90 text-white h-9"
                    onClick={() => updateStatus(incident.id, "resolved")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Resolved
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border h-9"
                    onClick={() => updateStatus(incident.id, "false_alarm")}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> False Alarm
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}