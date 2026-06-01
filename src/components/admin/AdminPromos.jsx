import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Tag, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: "", discount: 10, max_uses: 100, expires: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, r] = await Promise.all([
        base44.entities.PromoCode ? base44.entities.PromoCode.list("-created_date", 100) : Promise.resolve([]),
        base44.entities.Ride.list("-created_date", 500),
      ]);
      setPromos(p);
      setRides(r);
    } catch (err) {
      console.error("Failed to load promos:", err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Count usage per promo code from rides
  const getUsageCount = (code) => rides.filter(r => r.promo_code === code).length;
  const getTotalDiscount = (code) => {
    return rides
      .filter(r => r.promo_code === code)
      .reduce((s, r) => {
        const fare = r.final_fare || r.fare_estimate || 0;
        const discount = r.promo_discount || 0;
        return s + (fare * discount / (100 - discount)); // approximate original discount amount
      }, 0);
  };

  // Built-in promo codes (from constants)
  const builtInPromos = [
    { code: "FIRSTRIDE", discount: 20, status: "active", type: "built-in" },
    { code: "HY3N10", discount: 10, status: "active", type: "built-in" },
    { code: "WELCOME", discount: 15, status: "active", type: "built-in" },
    { code: "WEEKEND", discount: 10, status: "active", type: "built-in" },
  ];

  const allPromos = [...builtInPromos, ...promos.map(p => ({ ...p, type: "custom" }))];

  const handleAddPromo = async () => {
    if (!newPromo.code || !newPromo.discount) return;
    try {
      if (base44.entities.PromoCode) {
        await base44.entities.PromoCode.create({
          code: newPromo.code.toUpperCase(),
          discount: newPromo.discount,
          max_uses: newPromo.max_uses,
          expires_at: newPromo.expires || null,
          status: "active",
        });
      }
      setShowAdd(false);
      setNewPromo({ code: "", discount: 10, max_uses: 100, expires: "" });
      loadData();
    } catch (err) {
      console.error("Failed to create promo:", err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl">Promo Codes</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage discount codes and track usage</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Promo
          </Button>
          <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Add Promo Form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <p className="font-heading font-semibold text-sm">Create New Promo Code</p>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Code</label>
              <Input
                placeholder="e.g. SUMMER25"
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                className="bg-secondary border-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Discount %</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={newPromo.discount}
                onChange={(e) => setNewPromo({ ...newPromo, discount: parseInt(e.target.value) || 0 })}
                className="bg-secondary border-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Uses</label>
              <Input
                type="number"
                min={1}
                value={newPromo.max_uses}
                onChange={(e) => setNewPromo({ ...newPromo, max_uses: parseInt(e.target.value) || 100 })}
                className="bg-secondary border-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Expires</label>
              <Input
                type="date"
                value={newPromo.expires}
                onChange={(e) => setNewPromo({ ...newPromo, expires: e.target.value })}
                className="bg-secondary border-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddPromo} size="sm" className="bg-primary text-primary-foreground">
              Create Promo Code
            </Button>
            <Button onClick={() => setShowAdd(false)} size="sm" variant="ghost">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Active Promos</span>
          </div>
          <p className="font-heading font-bold text-xl">{allPromos.filter(p => p.status === "active").length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Total Uses</span>
          </div>
          <p className="font-heading font-bold text-xl">
            {rides.filter(r => r.promo_code).length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Total Discounts Given</span>
          </div>
          <p className="font-heading font-bold text-xl">
            GH₵{rides.filter(r => r.promo_code).reduce((s, r) => {
              const fare = r.final_fare || r.fare_estimate || 0;
              const disc = r.promo_discount || 0;
              return s + (fare * disc / 100);
            }, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Promos Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Discount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Uses</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Revenue Impact</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {allPromos.map((promo) => {
                const uses = getUsageCount(promo.code);
                const impact = getTotalDiscount(promo.code);
                return (
                  <tr key={promo.code} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary">{promo.code}</span>
                    </td>
                    <td className="px-4 py-3 font-medium">{promo.discount}%</td>
                    <td className="px-4 py-3">{uses}</td>
                    <td className="px-4 py-3 text-red-400">
                      {impact > 0 ? `-GH₵${impact.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        promo.type === "built-in"
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/30"
                          : "bg-purple-500/10 text-purple-500 border border-purple-500/30"
                      }`}>
                        {promo.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        promo.status === "active"
                          ? "bg-green-500/10 text-green-500 border border-green-500/30"
                          : "bg-red-500/10 text-red-500 border border-red-500/30"
                      }`}>
                        {promo.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
