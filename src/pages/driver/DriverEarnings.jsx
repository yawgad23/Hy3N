import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, DollarSign, Car, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";
import BottomNav from "@/components/shared/BottomNav";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#D4AF37", "#006B3F", "#CE1126", "#0A0A0A", "#94a3b8"];

const TIME_PERIODS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" }
];

export default function DriverEarnings() {
  const [user, setUser] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: earnings = [], isLoading: earningsLoading } = useQuery({
    queryKey: ["driver-earnings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const allEarnings = await base44.entities.Earning.filter({ driver_id: user.id });
      return allEarnings.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user?.id
  });

  const { data: rides = [], isLoading: ridesLoading } = useQuery({
    queryKey: ["driver-rides", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const allRides = await base44.entities.Ride.filter({ driver_id: user.id });
      return allRides.filter(r => r.status === "completed").sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user?.id
  });

  // Calculate earnings metrics
  const calculateMetrics = () => {
    const now = new Date();
    let filteredEarnings = earnings;

    if (selectedPeriod === "daily") {
      filteredEarnings = earnings.filter(e => {
        const eDate = new Date(e.created_date);
        return eDate.toDateString() === now.toDateString();
      });
    } else if (selectedPeriod === "weekly") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredEarnings = earnings.filter(e => new Date(e.created_date) >= weekAgo);
    } else if (selectedPeriod === "monthly") {
      filteredEarnings = earnings.filter(e => {
        const eDate = new Date(e.created_date);
        return eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear();
      });
    }

    const totalEarnings = filteredEarnings.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalCommission = filteredEarnings.reduce((sum, e) => sum + (e.commission || 0), 0);
    const netEarnings = filteredEarnings.reduce((sum, e) => sum + (e.net_amount || 0), 0);
    const completedTrips = rides.filter(r => {
      const rDate = new Date(r.created_date);
      if (selectedPeriod === "daily") return rDate.toDateString() === now.toDateString();
      if (selectedPeriod === "weekly") return rDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (selectedPeriod === "monthly") return rDate.getMonth() === now.getMonth();
      return true;
    }).length;

    const previousPeriodEarnings = earnings.reduce((sum, e) => sum + (e.net_amount || 0), 0) - netEarnings;
    const growthRate = previousPeriodEarnings > 0 ? ((netEarnings - previousPeriodEarnings) / previousPeriodEarnings) * 100 : 0;

    return {
      totalEarnings,
      totalCommission,
      netEarnings,
      completedTrips,
      growthRate,
      averagePerTrip: completedTrips > 0 ? netEarnings / completedTrips : 0
    };
  };

  // Prepare chart data
  const getChartData = () => {
    if (selectedPeriod === "daily") {
      const hours = Array.from({ length: 24 }, (_, i) => i);
      return hours.map(hour => {
        const hourEarnings = earnings.filter(e => {
          const eDate = new Date(e.created_date);
          return eDate.getHours() === hour && eDate.toDateString() === new Date().toDateString();
        });
        return {
          name: `${hour}:00`,
          earnings: hourEarnings.reduce((sum, e) => sum + (e.net_amount || 0), 0)
        };
      });
    } else if (selectedPeriod === "weekly") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days.map((day, index) => {
        const today = new Date();
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() - today.getDay() + index);
        const dayEarnings = earnings.filter(e => {
          const eDate = new Date(e.created_date);
          return eDate.toDateString() === dayDate.toDateString();
        });
        return {
          name: day,
          earnings: dayEarnings.reduce((sum, e) => sum + (e.net_amount || 0), 0)
        };
      });
    } else {
      const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);
      return monthDays.map(day => {
        const dayEarnings = earnings.filter(e => {
          const eDate = new Date(e.created_date);
          return eDate.getDate() === day && 
                 eDate.getMonth() === new Date().getMonth() && 
                 eDate.getFullYear() === new Date().getFullYear();
        });
        return {
          name: `Day ${day}`,
          earnings: dayEarnings.reduce((sum, e) => sum + (e.net_amount || 0), 0)
        };
      });
    }
  };

  const metrics = calculateMetrics();
  const chartData = getChartData();

  if (earningsLoading || ridesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <h1 className="font-heading font-bold text-xl">Earnings Dashboard</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="p-4">
        <div className="flex gap-2 bg-secondary p-1 rounded-xl">
          {TIME_PERIODS.map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Net Earnings</span>
            </div>
            <p className="font-heading font-bold text-2xl text-primary">
              GH₵{metrics.netEarnings.toFixed(2)}
            </p>
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              metrics.growthRate >= 0 ? "text-ghana-green" : "text-destructive"
            }`}>
              {metrics.growthRate >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{Math.abs(metrics.growthRate).toFixed(1)}% vs last period</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-4 h-4 text-ghana-green" />
              <span className="text-xs text-muted-foreground">Completed Trips</span>
            </div>
            <p className="font-heading font-bold text-2xl text-ghana-green">
              {metrics.completedTrips}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              GH₵{metrics.averagePerTrip.toFixed(2)} avg/trip
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-4 mt-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-ghana-green" />
              <span className="text-xs text-muted-foreground">Gross Earnings</span>
            </div>
            <span className="text-xs text-muted-foreground">Platform Commission</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-heading font-bold text-xl">GH₵{metrics.totalEarnings.toFixed(2)}</p>
            <p className="font-heading font-bold text-xl text-destructive">-GH₵{metrics.totalCommission.toFixed(2)}</p>
          </div>
        </motion.div>
      </div>

      {/* Earnings Chart */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Earnings Trend</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: "#888" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: "#888" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `GH₵${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px"
                  }}
                  formatter={(value) => [`GH₵${value.toFixed(2)}`, "Earnings"]}
                />
                <Bar dataKey="earnings" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Earnings */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Recent Earnings</h3>
          </div>
          <div className="space-y-3">
            {earnings.slice(0, 5).map((earning, index) => (
              <div
                key={earning.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium">Trip #{earning.ride_id?.slice(-6) || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(earning.created_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-sm text-ghana-green">
                    +GH₵{earning.net_amount?.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    GH₵{earning.amount?.toFixed(2)} - GH₵{earning.commission?.toFixed(2)} comm.
                  </p>
                </div>
              </div>
            ))}
            {earnings.length === 0 && (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">No earnings yet</p>
                <p className="text-xs text-muted-foreground mt-1">Complete trips to start earning</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <BottomNav role="driver" />
    </div>
  );
}