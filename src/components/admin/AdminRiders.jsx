import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function AdminRiders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.RiderProfile.list("-created_date", 500);
    setRiders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = riders.filter(r => {
    const q = search.toLowerCase();
    return !q || r.full_name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.phone?.includes(q);
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Riders</h1>
          <p className="text-muted-foreground text-sm mt-1">{riders.length} registered riders</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search name, email, phone..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rider</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Total Rides</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rating</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Payment Pref</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {r.profile_photo_url
                      ? <img src={r.profile_photo_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                      : <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{r.full_name?.[0]}</div>
                    }
                    <p className="font-medium">{r.full_name}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs">{r.email}</p>
                  <p className="text-xs text-muted-foreground">{r.phone}</p>
                </td>
                <td className="px-4 py-3 font-medium">{r.total_rides || 0}</td>
                <td className="px-4 py-3 text-primary font-medium">★ {(r.rating || 5).toFixed(1)}</td>
                <td className="px-4 py-3 capitalize text-xs text-muted-foreground">{r.preferred_payment?.replace(/_/g, " ") || "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.created_date ? format(new Date(r.created_date), "MMM d, yyyy") : "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No riders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}