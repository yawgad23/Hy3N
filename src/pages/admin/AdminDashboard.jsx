import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { format, parseISO, subDays, startOfDay } from "date-fns";
import {
  Car, TrendingUp, DollarSign, Users, AlertTriangle, Shield,
  RefreshCw, ChevronRight, MapPin, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";

const COLORS = ["#D4AF37", "#006B3F", "#CE1126", "#6B7280", "#A8865A"];

function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-heading font-bold text-xl">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [r, e, i] = await Promise.all([
      base44.entities.Ride.list("-created_date", 200),
      base44.entities.Earning.list("-created_date", 200),
      base44.entities.SosIncident.list("-created_date", 50),
    ]);
    setRides(r);
    setEarnings(e);
    setIncidents(i);
    setLoading(false);
  };

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="font-heading font-bold text-xl">Admin Access Only</h2>
        <p className="text-muted-foreground text-sm mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  // ── Derived metrics ──────────────────────────────────────────────
  const totalEarnings = earnings.reduce((s, e) => s + (e.net_amount || 0), 0);
  const totalRides = rides.length;
  const activeRides = rides.filter((r) => ["matched", "driver_arriving", "in_progress"].includes(r.status)).length;
  const activeIncidents = incidents.filter((i) => i.status === "active").length;

  // Rides per day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const label = format(day, "EEE");
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 86400000;
    const count = rides.filter((r) => {
      const t = r.created_date ? new Date(r.created_date).getTime() : 0;
      return t >= dayStart && t < dayEnd;
    }).length;
    return { label, count };
  });

  // Earnings per day (last 7 days)
  const earningsByDay = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const label = format(day, "EEE");
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 86400000;
    const amount = earnings
      .filter((e) => {
        const t = e.created_date ? new Date(e.created_date).getTime() : 0;
        return t >= dayStart && t < dayEnd;
      })
      .reduce((s, e) => s + (e.net_amount || 0), 0);
    return { label, amount: parseFloat(amount.toFixed(2)) };
  });

  // Ride category breakdown
  const categoryMap = {};
  rides.forEach((r) => {
    const c = r.category || "standard";
    categoryMap[c] = (categoryMap[c] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Status breakdown
  const statusMap = {};
  rides.forEach((r) => { statusMap[r.status] = (statusMap[r.status] || 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Peak hours (rides per hour of day)
  const hourMap = Array(24).fill(0);
  rides.forEach((r) => {
    if (r.created_date) {
      const h = new Date(r.created_date).getHours();
      hourMap[h]++;
    }
  });
  const peakHours = hourMap.map((count, h) => ({
    label: h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`,
    count
  })).filter((_, i) => i % 2 === 0); // every 2 hours for readability

  // Top destinations
  const destMap = {};
  rides.forEach((r) => {
    if (r.destination_address) destMap[r.destination_address] = (destMap[r.destination_address] || 0) + 1;
  });
  const topDests = Object.entries(destMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([address, count]) => ({ address, count }));

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <h1 className="font-heading font-bold text-base leading-tight">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Platform Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeIncidents > 0 && (
            <button
              onClick={() => navigate("/admin/sos")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/20 border border-destructive/40 text-destructive text-xs font-bold animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {activeIncidents} SOS
            </button>
          )}
          <Button variant="ghost" size="icon" onClick={loadData}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 pb-10">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Car} label="Total Rides" value={totalRides} sub={`${activeRides} active now`} />
          <StatCard icon={DollarSign} label="Net Earnings" value={`GH₵${totalEarnings.toFixed(0)}`} sub="Platform total" color="text-ghana-green" />
          <StatCard icon={TrendingUp} label="Active Rides" value={activeRides} sub="Right now" color="text-ghana-gold" />
          <StatCard
            icon={AlertTriangle}
            label="SOS Incidents"
            value={activeIncidents}
            sub="Active alerts"
            color={activeIncidents > 0 ? "text-destructive" : "text-muted-foreground"}
          />
        </div>

        {/* Rides Last 7 Days */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="font-heading font-semibold text-sm mb-4">Rides — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={last7} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rideGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="label" tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Rides" stroke="#D4AF37" strokeWidth={2} fill="url(#rideGrad)" dot={{ fill: "#D4AF37", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Earnings Last 7 Days */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="font-heading font-semibold text-sm mb-4">Net Earnings — Last 7 Days (GH₵)</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={earningsByDay} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006B3F" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#006B3F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="label" tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" name="amount" stroke="#006B3F" strokeWidth={2} fill="url(#earnGrad)" dot={{ fill: "#006B3F", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Demand Hours */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="font-heading font-semibold text-sm mb-4">Peak Demand Hours</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={peakHours} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "hsl(0 0% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Rides" radius={[4, 4, 0, 0]}>
                {peakHours.map((entry, index) => (
                  <Cell key={index} fill={entry.count === Math.max(...peakHours.map(h => h.count)) ? "#D4AF37" : "hsl(0 0% 20%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 text-center">Peak hour highlighted in gold</p>
        </div>

        {/* Category & Status side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="font-heading font-semibold text-xs mb-3">By Category</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={3}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-1">
              {categoryData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-muted-foreground capitalize truncate">{d.name}</span>
                  <span className="text-xs font-medium ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="font-heading font-semibold text-xs mb-3">By Status</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-1">
              {statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-muted-foreground capitalize truncate">{d.name.replace("_", " ")}</span>
                  <span className="text-xs font-medium ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="font-heading font-semibold text-sm mb-3">Top Destinations</p>
          {topDests.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topDests.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-sm flex-1 truncate">{d.address}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.round((d.count / topDests[0].count) * 60)}px` }} />
                    <span className="text-xs font-bold text-primary w-6 text-right">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <p className="font-heading font-semibold text-sm px-4 pt-4 pb-2">Quick Actions</p>
          {[
            { label: "SOS Incident Monitor", path: "/admin/sos", icon: AlertTriangle, color: "text-destructive" },
            { label: "Ride Reports", path: "/admin/reports", icon: FileText, color: "text-primary" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 border-t border-border hover:bg-secondary/50 transition-colors"
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-sm flex-1 text-left">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}