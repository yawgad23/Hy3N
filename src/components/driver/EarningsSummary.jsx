import { useMemo } from "react";
import { startOfDay, startOfWeek, startOfMonth, isAfter } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function getPeriodStart(period) {
  const now = new Date();
  if (period === "daily") return startOfDay(now);
  if (period === "weekly") return startOfWeek(now, { weekStartsOn: 1 });
  return startOfMonth(now);
}

function buildChartData(earnings, period) {
  const now = new Date();
  if (period === "daily") {
    // Last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const start = startOfDay(d);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      const net = earnings
        .filter(e => new Date(e.created_date) >= start && new Date(e.created_date) < end)
        .reduce((s, e) => s + (e.net_amount || 0), 0);
      days.push({ label, net: parseFloat(net.toFixed(2)) });
    }
    return days;
  }
  if (period === "weekly") {
    // Last 6 weeks
    const weeks = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const wStart = startOfWeek(d, { weekStartsOn: 1 });
      const wEnd = new Date(wStart); wEnd.setDate(wEnd.getDate() + 7);
      const label = "Wk " + wStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const net = earnings
        .filter(e => new Date(e.created_date) >= wStart && new Date(e.created_date) < wEnd)
        .reduce((s, e) => s + (e.net_amount || 0), 0);
      weeks.push({ label, net: parseFloat(net.toFixed(2)) });
    }
    return weeks;
  }
  // Monthly — last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = startOfMonth(d);
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const net = earnings
      .filter(e => new Date(e.created_date) >= mStart && new Date(e.created_date) < mEnd)
      .reduce((s, e) => s + (e.net_amount || 0), 0);
    months.push({ label, net: parseFloat(net.toFixed(2)) });
  }
  return months;
}

const PERIODS = ["daily", "weekly", "monthly"];
const PERIOD_LABELS = { daily: "Today", weekly: "This Week", monthly: "This Month" };

export default function EarningsSummary({ earnings, period, onPeriodChange }) {
  const periodStart = getPeriodStart(period);

  const periodEarnings = useMemo(
    () => earnings.filter(e => isAfter(new Date(e.created_date), periodStart)),
    [earnings, period]
  );

  const net = useMemo(
    () => periodEarnings.reduce((s, e) => s + (e.net_amount || 0), 0),
    [periodEarnings]
  );
  const gross = useMemo(
    () => periodEarnings.reduce((s, e) => s + (e.amount || 0), 0),
    [periodEarnings]
  );
  const commission = gross - net;
  const trips = periodEarnings.length;

  const chartData = useMemo(() => buildChartData(earnings, period), [earnings, period]);

  // Trend vs previous period
  const prevStart = useMemo(() => {
    const s = getPeriodStart(period);
    if (period === "daily") { const d = new Date(s); d.setDate(d.getDate() - 1); return d; }
    if (period === "weekly") { const d = new Date(s); d.setDate(d.getDate() - 7); return d; }
    const d = new Date(s); d.setMonth(d.getMonth() - 1); return d;
  }, [period]);

  const prevNet = useMemo(() => {
    return earnings
      .filter(e => new Date(e.created_date) >= prevStart && new Date(e.created_date) < periodStart)
      .reduce((s, e) => s + (e.net_amount || 0), 0);
  }, [earnings, period]);

  const trendPct = prevNet > 0 ? ((net - prevNet) / prevNet) * 100 : null;
  const TrendIcon = trendPct === null ? Minus : trendPct >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trendPct === null ? "text-muted-foreground" : trendPct >= 0 ? "text-ghana-green" : "text-destructive";

  return (
    <div className="px-4 mb-4">
      {/* Period Toggle */}
      <div className="flex gap-1 mb-4 bg-secondary rounded-xl p-1">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
              period === p ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Main stat card */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-3">
        <p className="text-xs text-muted-foreground mb-1">{PERIOD_LABELS[period]} — Net Earnings</p>
        <div className="flex items-end justify-between">
          <p className="font-heading font-bold text-3xl text-primary">GH₵{net.toFixed(2)}</p>
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            {trendPct !== null ? `${Math.abs(trendPct).toFixed(0)}%` : "—"}
          </div>
        </div>

        <div className="flex gap-4 mt-4 pt-3 border-t border-border">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Gross</p>
            <p className="text-sm font-semibold">GH₵{gross.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Commission</p>
            <p className="text-sm font-semibold text-destructive">-GH₵{commission.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Trips</p>
            <p className="text-sm font-semibold">{trips}</p>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs text-muted-foreground mb-3">
          {period === "daily" ? "Last 7 Days" : period === "weekly" ? "Last 6 Weeks" : "Last 6 Months"}
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`GH₵${v}`, "Net"]}
              contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: "#aaa" }}
            />
            <Bar dataKey="net" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}