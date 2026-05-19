import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export default function AdminRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      || r.pickup_address?.toLowerCase().includes(q) || r.destination_address?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Rides</h1>
          <p className="text-muted-foreground text-sm mt-1">{rides.length} total rides</p>
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
          <Input placeholder="Search rider, driver, address..." className="pl-9 w-72" value={search} onChange={e => setSearch(e.target.value)} />
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rider</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Pickup</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Destination</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Fare</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {r.created_date ? format(new Date(r.created_date), "MMM d, HH:mm") : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">{r.rider_name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.driver_name || <span className="text-xs italic">Unassigned</span>}</td>
                  <td className="px-4 py-3 max-w-[160px] truncate text-muted-foreground text-xs">{r.pickup_address}</td>
                  <td className="px-4 py-3 max-w-[160px] truncate text-xs">{r.destination_address}</td>
                  <td className="px-4 py-3 capitalize text-xs">{r.category}</td>
                  <td className="px-4 py-3 font-medium text-primary">GH₵{(r.final_fare || r.fare_estimate || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[r.status] || "bg-secondary text-muted-foreground"}`}>
                      {r.status?.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No rides found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}