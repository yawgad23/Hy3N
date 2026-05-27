import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Car, DollarSign, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { subDays, startOfDay, format } from "date-fns";
import { Button } from "@/components/ui/button";

const COLORS = ["#D4AF37", "#006B3F", "#CE1126", "#6B7280", "#A8865A"];

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-heading font-bold text-2xl">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name === "amount" ? `GH₵${p.value}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminOverview({ onNavigate }) {
  const [rides, setRides] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [r, e, i] = await Promise.all([
      base44.entities.Ride.list("-created_date", 500),
      base44.entities.Earning.list("-created_date", 500),
      base44.entities.SosIncident.list("-created_date", 100),
    ]);
    setRides(r); setEarnings(e); setIncidents(i);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const totalEarnings = earnings.reduce((s, e) => s + (e.net_amount || 0), 0);
  const activeRides = rides.filter(r => ["matched", "driver_arriving", "in_progress"].includes(r.status)).length;
  const activeIncidents = incidents.filter(i => i.status === "active").length;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 86400000;
    return {
      label: format(day, "EEE"),
      count: rides.filter(r => { const t = r.created_date ? new Date(r.created_date).getTime() : 0; return t >= dayStart && t < dayEnd; }).length,
      amount: parseFloat(earnings.filter(e => { const t = e.created_date ? new Date(e.created_date).getTime() : 0; return t >= dayStart && t < dayEnd; }).reduce((s, e) => s + (e.net_amount || 0), 0).toFixed(2)),
    };
  });

  const categoryMap = {};
  rides.forEach(r => { const c = r.category || "standard"; categoryMap[c] = (categoryMap[c] || 0) + 1; });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const statusMap = {};
  rides.forEach(r => { statusMap[r.status] = (statusMap[r.status] || 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  const destMap = {};
  rides.forEach(r => { if (r.destination_address) destMap[r.destination_address] = (destMap[r.destination_address] || 0) + 1; });
  const topDests = Object.entries(destMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([address, count]) => ({ address, count }));

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform-wide performance at a glance</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Car} label="Total Rides" value={rides.length} sub={`${activeRides} active now`} />
        <StatCard icon={DollarSign} label="Net Earnings" value={`GH₵${totalEarnings.toFixed(0)}`} sub="All time" color="text-green-500" />
        <StatCard icon={TrendingUp} label="Active Rides" value={activeRides} sub="In progress" color="text-yellow-500" />
        <StatCard
          icon={AlertTriangle}
          label="SOS Alerts"
          value={activeIncidents}
          sub={activeIncidents > 0 ? "Needs attention" : "All clear"}
          color={activeIncidents > 0 ? "text-destructive" : "text-muted-foreground"}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-heading font-semibold text-sm mb-4">Rides — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last7} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="label" tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Rides" stroke="#D4AF37" strokeWidth={2} fill="url(#rG)" dot={{ fill: "#D4AF37", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-heading font-semibold text-sm mb-4">Net Earnings — Last 7 Days (GH₵)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last7} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="eG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006B3F" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#006B3F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="label" tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" name="amount" stroke="#006B3F" strokeWidth={2} fill="url(#eG)" dot={{ fill: "#006B3F", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie charts + Top destinations */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-heading font-semibold text-sm mb-3">By Category</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {categoryData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-muted-foreground capitalize flex-1">{d.name}</span>
                <span className="text-xs font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-heading font-semibold text-sm mb-3">By Status</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-muted-foreground flex-1 capitalize">{d.name.replace(/_/g, " ")}</span>
                <span className="text-xs font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-heading font-semibold text-sm mb-3">Top Destinations</p>
          {topDests.length === 0 ? <p className="text-xs text-muted-foreground">No data yet</p> : (
            <div className="space-y-3">
              {topDests.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary w-4">{i + 1}</span>
                  <p className="text-xs flex-1 truncate">{d.address}</p>
                  <span className="text-xs font-bold text-primary">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}