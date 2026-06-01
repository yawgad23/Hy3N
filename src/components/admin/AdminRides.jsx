import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Search, ChevronDown, ChevronUp, Smartphone, Banknote, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const STATUS_COLORS = {
  requested: "bg-yellow-500/20 text-yellow-400",
  scheduled: "bg-blue-500/20 text-blue-400",
  matched: "bg-purple-500/20 text-purple-400",
  driver_arriving: "bg-orange-500/20 text-orange-400",
  in_progress: "bg-primary/20 text-primary",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-destructive/20 text-destructive",
};

const METHOD_ICONS = {
  mobile_money: Smartphone,
  cash: Banknote,
  card: CreditCard,
  wallet: Wallet,
};

export default function AdminRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRide, setExpandedRide] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Ride.list("-created_date", 500);
    setRides(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const statuses = ["all", "requested", "scheduled", "matched", "driver_arriving", "in_progress", "completed", "cancelled"];

  const filtered = rides.filter(r => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.rider_name?.toLowerCase().includes(q) || r.driver_name?.toLowerCase().includes(q)
      || r.pickup_address?.toLowerCase().includes(q) || r.destination_address?.toLowerCase().includes(q)
      || r.payment_method?.toLowerCase().includes(q) || r.promo_code?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Rides</h1>
          <p className="text-muted-foreground text-sm mt-1">{rides.length} total rides • {rides.filter(r => ["matched", "driver_arriving", "in_progress"].includes(r.status)).length} active now</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search rider, driver, address, promo..." className="pl-9 w-80" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-6"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rider</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Route</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Fare</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const MethodIcon = METHOD_ICONS[r.payment_method] || Banknote;
                const isExpanded = expandedRide === r.id;
                return (
                  <>
                    <tr
                      key={r.id}
                      onClick={() => setExpandedRide(isExpanded ? null : r.id)}
                      className="border-b border-border/50 hover:bg-secondary/20 transition-colors cursor-pointer"
                    >
                      <td className="px-2 py-3">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {r.created_date ? format(new Date(r.created_date), "MMM d, HH:mm") : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-xs">{r.rider_name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.driver_name || <span className="italic">Unassigned</span>}</td>
                      <td className="px-4 py-3 max-w-[200px] text-xs">
                        <p className="truncate">{r.pickup_address || "—"}</p>
                        <p className="truncate text-muted-foreground">→ {r.destination_address || "—"}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-xs">{r.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <MethodIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs capitalize">{(r.payment_method || "cash").replace("_", " ")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-primary text-xs">GH₵{(r.final_fare || r.fare_estimate || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${STATUS_COLORS[r.status] || "bg-secondary text-muted-foreground"}`}>
                          {r.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr key={`${r.id}-details`} className="bg-secondary/10">
                        <td colSpan={9} className="px-8 py-4">
                          <div className="grid grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-1 font-medium">Fare Breakdown</p>
                              <p>Base Fare: <span className="font-medium">GH₵{(r.fare_estimate || 0).toFixed(2)}</span></p>
                              {r.waiting_fee > 0 && <p>Waiting Fee: <span className="font-medium text-yellow-500">+GH₵{r.waiting_fee.toFixed(2)}</span></p>}
                              {r.promo_discount > 0 && <p>Promo ({r.promo_code}): <span className="font-medium text-green-500">-{r.promo_discount}%</span></p>}
                              {r.tip_amount > 0 && <p>Tip: <span className="font-medium text-primary">+GH₵{r.tip_amount.toFixed(2)}</span></p>}
                              {r.cancellation_fee > 0 && <p>Cancel Fee: <span className="font-medium text-red-500">GH₵{r.cancellation_fee.toFixed(2)}</span></p>}
                              <p className="mt-1 font-bold">Final: GH₵{(r.final_fare || r.fare_estimate || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1 font-medium">Trip Details</p>
                              <p>Distance: <span className="font-medium">{r.distance_km ? `${r.distance_km.toFixed(1)} km` : "—"}</span></p>
                              <p>Duration: <span className="font-medium">{r.duration_min ? `${r.duration_min} min` : "—"}</span></p>
                              {r.waiting_minutes > 0 && <p>Wait Time: <span className="font-medium">{r.waiting_minutes} min</span></p>}
                              {r.driver_arrived_at && <p>Driver Arrived: <span className="font-medium">{format(new Date(r.driver_arrived_at), "HH:mm:ss")}</span></p>}
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1 font-medium">Payment</p>
                              <p>Method: <span className="font-medium capitalize">{(r.payment_method || "cash").replace("_", " ")}</span></p>
                              <p>Status: <span className="font-medium capitalize">{r.payment_status || "pending"}</span></p>
                              {r.payment_reference && <p>Ref: <span className="font-mono font-medium">{r.payment_reference}</span></p>}
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1 font-medium">Other</p>
                              {r.cancel_reason && <p>Cancel Reason: <span className="font-medium capitalize">{r.cancel_reason.replace(/_/g, " ")}</span></p>}
                              {r.rating && <p>Rating: <span className="font-medium">⭐ {r.rating}/5</span></p>}
                              {r.safety_check_enabled && <p>Safety: <span className="font-medium text-green-500">Enabled</span></p>}
                              <p>Ride ID: <span className="font-mono text-[10px]">{r.id}</span></p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground text-sm">No rides found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
