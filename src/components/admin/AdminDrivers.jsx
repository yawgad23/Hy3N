import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_ICONS = {
  approved: <CheckCircle className="w-4 h-4 text-green-500" />,
  rejected: <XCircle className="w-4 h-4 text-destructive" />,
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
};

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.DriverProfile.list("-created_date", 500);
    setDrivers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await base44.entities.DriverProfile.update(id, { approval_status: status });
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, approval_status: status } : d));
    setUpdating(null);
  };

  const filtered = drivers.filter(d => {
    const matchFilter = filter === "all" || d.approval_status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || d.full_name?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q) || d.phone?.includes(q) || d.license_plate?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Drivers</h1>
          <p className="text-muted-foreground text-sm mt-1">{drivers.length} registered drivers</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, email, plate..." className="pl-9 w-72" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {["all", "pending", "approved", "rejected"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Vehicle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Plate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rides</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {d.profile_photo_url
                        ? <img src={d.profile_photo_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        : <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{d.full_name?.[0]}</div>
                      }
                      <div>
                        <p className="font-medium text-sm">{d.full_name}</p>
                        <p className="text-xs text-muted-foreground">{d.is_online ? <span className="text-green-500">● Online</span> : "Offline"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs">{d.email}</p>
                    <p className="text-xs text-muted-foreground">{d.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.vehicle_year} {d.vehicle_make} {d.vehicle_model} {d.vehicle_color ? `(${d.vehicle_color})` : ""}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold">{d.license_plate || "—"}</td>
                  <td className="px-4 py-3 font-medium">{d.total_rides || 0}</td>
                  <td className="px-4 py-3 text-primary font-medium">★ {(d.rating || 5).toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICONS[d.approval_status]}
                      <span className="text-xs capitalize">{d.approval_status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {d.approval_status !== "approved" && (
                        <button onClick={() => updateStatus(d.id, "approved")} disabled={updating === d.id}
                          className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50">
                          Approve
                        </button>
                      )}
                      {d.approval_status !== "rejected" && (
                        <button onClick={() => updateStatus(d.id, "rejected")} disabled={updating === d.id}
                          className="px-2 py-1 rounded-lg bg-destructive/20 text-destructive text-xs font-medium hover:bg-destructive/30 transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No drivers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}