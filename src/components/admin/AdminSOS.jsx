import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const STATUS_COLORS = {
  active: "bg-destructive/20 text-destructive border-destructive/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  false_alarm: "bg-secondary text-muted-foreground border-border",
};

export default function AdminSOS() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.SosIncident.list("-created_date", 200);
    setIncidents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    setUpdating(id);
    await base44.entities.SosIncident.update(id, { status });
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    setUpdating(null);
  };

  const active = incidents.filter(i => i.status === "active");
  const resolved = incidents.filter(i => i.status !== "active");

  const Section = ({ title, items }) => (
    <div className="space-y-3">
      <h2 className="font-heading font-semibold text-base text-muted-foreground">{title} ({items.length})</h2>
      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">No incidents</div>
      ) : items.map(i => (
        <div key={i.id} className={`bg-card border rounded-2xl p-5 ${i.status === "active" ? "border-destructive/30" : "border-border"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${i.status === "active" ? "bg-destructive/20" : "bg-secondary"}`}>
                <AlertTriangle className={`w-4 h-4 ${i.status === "active" ? "text-destructive" : "text-muted-foreground"}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{i.user_name || "Unknown User"}</p>
                  <span className={`text-xs capitalize px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[i.status]}`}>
                    {i.status?.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{i.user_role} · {i.address || `${i.lat?.toFixed(4)}, ${i.lng?.toFixed(4)}`}</p>
                {i.notes && <p className="text-sm mt-1">{i.notes}</p>}
                <p className="text-xs text-muted-foreground mt-1">{i.created_date ? format(new Date(i.created_date), "MMM d, yyyy HH:mm") : "—"}</p>
              </div>
            </div>
            {i.status === "active" && (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => update(i.id, "resolved")} disabled={updating === i.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Resolved
                </button>
                <button onClick={() => update(i.id, "false_alarm")} disabled={updating === i.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-xs font-medium hover:text-foreground transition-colors disabled:opacity-50">
                  <XCircle className="w-3.5 h-3.5" />
                  False Alarm
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">SOS Incidents</h1>
          <p className="text-muted-foreground text-sm mt-1">{active.length} active · {incidents.length} total</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Section title="🚨 Active Alerts" items={active} />
      <Section title="Past Incidents" items={resolved} />
    </div>
  );
}