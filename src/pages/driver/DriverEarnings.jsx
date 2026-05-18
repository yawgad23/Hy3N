import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Wallet, TrendingUp, ArrowDownToLine, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import BottomNav from "@/components/shared/BottomNav";
import Logo from "@/components/shared/Logo";

export default function DriverEarnings() {
  const [earnings, setEarnings] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [driver, setDriver] = useState(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [tab, setTab] = useState("earnings");

  useEffect(() => {
    async function load() {
      const user = await base44.auth.me();
      if (user) {
        const drivers = await base44.entities.DriverProfile.filter({ user_id: user.id });
        if (drivers.length > 0) setDriver(drivers[0]);
        const earns = await base44.entities.Earning.filter({ driver_id: user.id }, "-created_date", 50);
        setEarnings(earns);
        const wds = await base44.entities.Withdrawal.filter({ driver_id: user.id }, "-created_date", 20);
        setWithdrawals(wds);
      }
    }
    load();
  }, []);

  const totalAvailable = earnings
    .filter(e => e.status === "available")
    .reduce((sum, e) => sum + (e.net_amount || 0), 0);

  const totalEarned = earnings.reduce((sum, e) => sum + (e.net_amount || 0), 0);

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawPhone) return;
    const user = await base44.auth.me();
    await base44.entities.Withdrawal.create({
      driver_id: user.id,
      amount: parseFloat(withdrawAmount),
      phone_number: withdrawPhone,
      method: "mobile_money"
    });
    setShowWithdraw(false);
    setWithdrawAmount("");
    setWithdrawPhone("");
    const wds = await base44.entities.Withdrawal.filter({ driver_id: user.id }, "-created_date", 20);
    setWithdrawals(wds);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 pt-6 flex items-center gap-3 border-b border-border">
        <Logo size="sm" />
        <h1 className="font-heading font-bold text-xl">Earnings</h1>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <Wallet className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="font-heading font-bold text-xl text-primary">GH₵{totalAvailable.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <TrendingUp className="w-5 h-5 text-ghana-green mb-2" />
          <p className="text-xs text-muted-foreground">Total Earned</p>
          <p className="font-heading font-bold text-xl text-ghana-green">GH₵{totalEarned.toFixed(2)}</p>
        </div>
      </div>

      {/* Withdraw */}
      <div className="px-4 mb-4">
        {showWithdraw ? (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <Input
              type="number"
              placeholder="Amount (GH₵)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-secondary border-none"
            />
            <Input
              placeholder="Mobile Money Number"
              value={withdrawPhone}
              onChange={(e) => setWithdrawPhone(e.target.value)}
              className="bg-secondary border-none"
            />
            <div className="flex gap-2">
              <Button onClick={handleWithdraw} className="flex-1 bg-ghana-green hover:bg-ghana-green/90 text-white">
                Withdraw
              </Button>
              <Button onClick={() => setShowWithdraw(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowWithdraw(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" /> Withdraw Funds
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-2 mb-4">
        <button
          onClick={() => setTab("earnings")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "earnings" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          Earnings
        </button>
        <button
          onClick={() => setTab("withdrawals")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "withdrawals" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          Withdrawals
        </button>
      </div>

      {/* List */}
      <div className="px-4 space-y-2">
        {tab === "earnings" && earnings.map((earn) => (
          <div key={earn.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ride Earning</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(earn.created_date), "MMM d, h:mm a")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-ghana-green">+GH₵{earn.net_amount?.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{earn.status}</p>
            </div>
          </div>
        ))}

        {tab === "withdrawals" && withdrawals.map((wd) => (
          <div key={wd.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Withdrawal</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(wd.created_date), "MMM d, h:mm a")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-primary">GH₵{wd.amount?.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{wd.status}</p>
            </div>
          </div>
        ))}

        {((tab === "earnings" && earnings.length === 0) || (tab === "withdrawals" && withdrawals.length === 0)) && (
          <div className="text-center py-12">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No {tab} yet</p>
          </div>
        )}
      </div>

      <BottomNav role="driver" />
    </div>
  );
}