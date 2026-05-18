import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, RefreshCw, Plus, ArrowUpRight, ArrowDownLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import BottomNav from "@/components/shared/BottomNav";
import WalletTopUpModal from "@/components/rider/WalletTopUpModal";

const TX_ICONS = {
  top_up: ArrowDownLeft,
  ride_payment: ArrowUpRight,
  refund: RotateCcw
};

const TX_COLORS = {
  top_up: "text-ghana-green",
  ride_payment: "text-destructive",
  refund: "text-primary"
};

const TX_LABELS = {
  top_up: "Top-Up",
  ride_payment: "Ride Payment",
  refund: "Refund"
};

export default function RiderWallet() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);
    const [wallets, txs] = await Promise.all([
      base44.entities.Wallet.filter({ user_id: me.id }),
      base44.entities.WalletTransaction.filter({ user_id: me.id }, "-created_date", 50)
    ]);
    setWallet(wallets[0] || { balance: 0, total_topped_up: 0, total_spent: 0 });
    setTransactions(txs);
    setLoading(false);
  }

  const handleTopUpSuccess = (newBalance) => {
    setWallet(prev => ({ ...prev, balance: newBalance }));
    setShowTopUp(false);
    loadData();
  };

  const balance = wallet?.balance || 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading font-bold text-xl flex-1">My Wallet</h1>
        <button onClick={loadData} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-2xl p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Wallet className="w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
          <p className="font-heading font-bold text-4xl text-foreground">
            GH₵{balance.toFixed(2)}
          </p>
          <Button
            onClick={() => setShowTopUp(true)}
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" /> Top Up
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-ghana-green" />
              <span className="text-xs text-muted-foreground">Total Added</span>
            </div>
            <p className="font-heading font-bold text-lg text-foreground">
              GH₵{(wallet?.total_topped_up || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Total Spent</span>
            </div>
            <p className="font-heading font-bold text-lg text-foreground">
              GH₵{(wallet?.total_spent || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Transaction History</p>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Top up to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const Icon = TX_ICONS[tx.type] || ArrowUpRight;
                const colorClass = TX_COLORS[tx.type] || "text-foreground";
                const isCredit = tx.type === "top_up" || tx.type === "refund";
                return (
                  <div key={tx.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCredit ? "bg-ghana-green/10" : "bg-destructive/10"}`}>
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{TX_LABELS[tx.type]}</p>
                      <p className="text-xs text-muted-foreground truncate">{tx.description || ""}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.created_date ? format(new Date(tx.created_date), "MMM d, h:mm a") : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-heading font-bold ${colorClass}`}>
                        {isCredit ? "+" : "-"}GH₵{Math.abs(tx.amount).toFixed(2)}
                      </p>
                      {tx.balance_after != null && (
                        <p className="text-xs text-muted-foreground">Bal: GH₵{tx.balance_after.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <WalletTopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={handleTopUpSuccess}
        currentBalance={balance}
      />

      <BottomNav role="rider" />
    </div>
  );
}