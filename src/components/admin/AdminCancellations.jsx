import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, XCircle, TrendingDown, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = ["#D4AF37", "#006B3F", "#CE1126", "#6B7280", "#A8865A", "#3B82F6", "#8B5CF6", "#EC4899"];

const CANCEL_REASONS_MAP = {
  "driver_too_far": "Driver too far",
  "wait_too_long": "Wait too long",
  "changed_plans": "Changed plans",
  "wrong_address": "Wrong address",
  "found_other_ride": "Found other ride",
  "price_too_high": "Price too high",
  "driver_asked_cancel": "Driver asked to cancel",
  "safety_concern": "Safety concern",
};

export default function AdminCancellations() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const r = await base44.entities.Ride.list("-created_date", 500);
      setRides(r);
    } catch (err) {
      console.error("Failed to load rides:", err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const cancelledRides = rides.filter(r => r.status === "cancelled");
  const completedRides = rides.filter(r => r.status === "completed");
  const totalTrips = completedRides.length + cancelledRides.length;
  const cancellationRate = totalTrips > 0 ? ((cancelledRides.length / totalTrips) * 100).toFixed(1) : 0;
  const totalCancellationFees = cancelledRides.reduce((s, r) => s + (r.cancellation_fee || 0), 0);

  // Reasons breakdown
  const reasonMap = {};
  cancelledRides.forEach(r => {
    const reason = r.cancel_reason || "unknown";
    reasonMap[reason] = (reasonMap[reason] || 0) + 1;
  });
  const reasonData = Object.entries(reasonMap)
    .map(([name, value]) => ({ name: CANCEL_REASONS_MAP[name] || name, value }))
    .sort((a, b) => b.value - a.value);

  // Cancellations per day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 86400000;
    const cancelled = cancelledRides.filter(r => {
      const t = r.created_date ? new Date(r.created_date).getTime() : 0;
      return t >= dayStart && t < dayEnd;
    }).length;
    const total = rides.filter(r => {
      const t = r.created_date ? new Date(r.created_date).getTime() : 0;
      return t >= dayStart && t < dayEnd && (r.status === "completed" || r.status === "cancelled");
    }).length;
    return {
      label: format(day, "EEE"),
      cancelled,
      rate: total > 0 ? parseFloat(((cancelled / total) * 100).toFixed(1)) : 0,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}{p.name === "rate" ? "%" : ""}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Cancellations</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor ride cancellation patterns and reasons</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Total Cancellations</span>
          </div>
          <p className="font-heading font-bold text-xl text-red-500">{cancelledRides.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Cancellation Rate</span>
          </div>
          <p className="font-heading font-bold text-xl">{cancellationRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">of {totalTrips} total trips</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Top Reason</span>
          </div>
          <p className="font-heading font-bold text-sm">{reasonData[0]?.name || "N/A"}</p>
          <p className="text-xs text-muted-foreground mt-1">{reasonData[0]?.value || 0} times</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Cancellation Fees</span>
          </div>
          <p className="font-heading font-bold text-xl">GH₵{totalCancellationFees.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Cancellations per day */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-heading font-semibold text-sm mb-4">Cancellations — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cancelled" name="cancelled" fill="#CE1126" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reasons pie chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-heading font-semibold text-sm mb-4">Cancellation Reasons</p>
          {reasonData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No cancellation data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={reasonData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {reasonData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {reasonData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
                    <span className="text-xs font-bold">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Cancellations Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="font-heading font-semibold text-sm">Recent Cancellations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rider</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Driver</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Route</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee</th>
              </tr>
            </thead>
            <tbody>
              {cancelledRides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">No cancellations yet</td>
                </tr>
              ) : (
                cancelledRides.slice(0, 50).map(ride => (
                  <tr key={ride.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {ride.created_date ? format(new Date(ride.created_date), "MMM d, HH:mm") : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium truncate max-w-[100px]">
                      {ride.rider_name || ride.rider_id?.slice(0, 8) || "—"}
                    </td>
                    <td className="px-4 py-3 truncate max-w-[100px]">
                      {ride.driver_name || ride.driver_id?.slice(0, 8) || "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-xs truncate max-w-[180px]">
                      {ride.pickup_address || "—"} → {ride.destination_address || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                        {CANCEL_REASONS_MAP[ride.cancel_reason] || ride.cancel_reason || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {ride.cancellation_fee > 0 ? `GH₵${ride.cancellation_fee.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
