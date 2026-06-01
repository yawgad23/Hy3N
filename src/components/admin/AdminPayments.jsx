import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, DollarSign, Smartphone, Banknote, CreditCard, Wallet, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const PAYMENT_STATUS_COLORS = {
  paid: "bg-green-500/10 text-green-500 border-green-500/30",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  failed: "bg-red-500/10 text-red-500 border-red-500/30",
  refunded: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

const METHOD_ICONS = {
  mobile_money: Smartphone,
  cash: Banknote,
  card: CreditCard,
  wallet: Wallet,
};

export default function AdminPayments() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const r = await base44.entities.Ride.list("-created_date", 500);
      // Only show rides that have been completed or have payment info
      setRides(r.filter(ride => ride.status === "completed" || ride.payment_status || ride.payment_method));
    } catch (err) {
      console.error("Failed to load payments:", err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Filter rides
  const filtered = rides.filter(r => {
    if (filterMethod !== "all" && r.payment_method !== filterMethod) return false;
    if (filterStatus !== "all" && (r.payment_status || "pending") !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (r.rider_name || "").toLowerCase().includes(s) ||
        (r.driver_name || "").toLowerCase().includes(s) ||
        (r.payment_reference || "").toLowerCase().includes(s) ||
        (r.pickup_address || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  // Stats
  const totalRevenue = filtered.reduce((s, r) => s + (r.final_fare || r.fare_estimate || 0), 0);
  const momoPayments = filtered.filter(r => r.payment_method === "mobile_money");
  const cashPayments = filtered.filter(r => r.payment_method === "cash");
  const paidCount = filtered.filter(r => r.payment_status === "paid").length;
  const pendingCount = filtered.filter(r => !r.payment_status || r.payment_status === "pending").length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Payments & MoMo</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor all payment transactions across both apps</p>
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
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
          <p className="font-heading font-bold text-xl">GH₵{totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{filtered.length} transactions</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">MoMo Payments</span>
          </div>
          <p className="font-heading font-bold text-xl">{momoPayments.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            GH₵{momoPayments.reduce((s, r) => s + (r.final_fare || r.fare_estimate || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Cash Payments</span>
          </div>
          <p className="font-heading font-bold text-xl">{cashPayments.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            GH₵{cashPayments.reduce((s, r) => s + (r.final_fare || r.fare_estimate || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Payment Status</span>
          </div>
          <p className="font-heading font-bold text-xl text-green-500">{paidCount} <span className="text-sm text-muted-foreground font-normal">paid</span></p>
          <p className="text-xs text-yellow-500 mt-1">{pendingCount} pending</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by rider, driver, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground"
        >
          <option value="all">All Methods</option>
          <option value="cash">Cash</option>
          <option value="mobile_money">MoMo</option>
          <option value="card">Card</option>
          <option value="wallet">Wallet</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rider</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Driver</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Method</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Waiting Fee</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Promo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-muted-foreground">
                    No payment records found
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 100).map((ride) => {
                  const MethodIcon = METHOD_ICONS[ride.payment_method] || Banknote;
                  const status = ride.payment_status || "pending";
                  return (
                    <tr key={ride.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {ride.created_date ? format(new Date(ride.created_date), "MMM d, HH:mm") : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium truncate max-w-[120px]">
                        {ride.rider_name || ride.rider_id?.slice(0, 8) || "—"}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[120px]">
                        {ride.driver_name || ride.driver_id?.slice(0, 8) || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MethodIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs capitalize">{(ride.payment_method || "cash").replace("_", " ")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">
                        GH₵{(ride.final_fare || ride.fare_estimate || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {ride.waiting_fee > 0 ? (
                          <span className="text-yellow-500">+GH₵{ride.waiting_fee.toFixed(2)}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {ride.promo_code ? (
                          <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold">
                            {ride.promo_code} (-{ride.promo_discount}%)
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground truncate max-w-[100px]">
                        {ride.payment_reference || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${PAYMENT_STATUS_COLORS[status] || PAYMENT_STATUS_COLORS.pending}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <div className="px-4 py-3 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">Showing 100 of {filtered.length} records</p>
          </div>
        )}
      </div>
    </div>
  );
}
