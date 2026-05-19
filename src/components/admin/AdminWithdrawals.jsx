import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-400",
  processing: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  failed: "bg-destructive/20 text-destructive",
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Withdrawal.list("-created_date", 300);
    setWithdrawals(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await base44.entities.Withdrawal.update(id, { status });
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status } : w));
    setUpdating(null);
  };

  const filtered = filter === "all" ? withdrawals : withdrawals.filter(w => w.status === filter);
  const totalPending = withdrawals.filter(w => w.status === "pending").reduce((s, w) => s + (w.amount || 0), 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Withdrawals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {withdrawals.filter(w => w.status === "pending").length} pending · GH₵{totalPending.toFixed(2)} to process
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "processing", "completed", "failed"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Driver ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Method</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Reference</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground">{w.created_date ? format(new Date(w.created_date), "MMM d, HH:mm") : "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.driver_id?.slice(0, 12)}…</td>
                <td className="px-4 py-3 font-bold text-primary">GH₵{(w.amount || 0).toFixed(2)}</td>
                <td className="px-4 py-3 capitalize text-xs">{w.method || "mobile_money"}</td>
                <td className="px-4 py-3 text-xs">{w.phone_number || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.reference || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[w.status] || "bg-secondary text-muted-foreground"}`}>
                    {w.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {w.status === "pending" && (
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(w.id, "processing")} disabled={updating === w.id}
                        className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50">
                        Process
                      </button>
                      <button onClick={() => updateStatus(w.id, "completed")} disabled={updating === w.id}
                        className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50">
                        Complete
                      </button>
                    </div>
                  )}
                  {w.status === "processing" && (
                    <button onClick={() => updateStatus(w.id, "completed")} disabled={updating === w.id}
                      className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50">
                      Mark Done
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No withdrawals found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}