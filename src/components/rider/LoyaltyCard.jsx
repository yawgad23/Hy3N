import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Trophy, Gift, ChevronRight, Zap, Crown, Shield, Award } from "lucide-react";
import { motion } from "framer-motion";

const TIERS = {
  bronze: {
    label: "Bronze",
    icon: Shield,
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    border: "border-amber-600/30",
    gradient: "from-amber-800 to-amber-600",
    minPoints: 0,
    nextAt: 500,
  },
  silver: {
    label: "Silver",
    icon: Award,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/30",
    gradient: "from-slate-500 to-slate-300",
    minPoints: 500,
    nextAt: 1500,
  },
  gold: {
    label: "Gold",
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    gradient: "from-yellow-700 to-primary",
    minPoints: 1500,
    nextAt: 4000,
  },
  platinum: {
    label: "Platinum",
    icon: Crown,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    gradient: "from-cyan-700 to-cyan-400",
    minPoints: 4000,
    nextAt: null,
  },
};

const REWARDS = [
  { id: "discount_10", name: "10% Ride Discount", points: 200, discount: 0.10, icon: "🎟️", description: "10% off your next ride" },
  { id: "discount_20", name: "20% Ride Discount", points: 400, discount: 0.20, icon: "🎫", description: "20% off your next ride" },
  { id: "free_ride_10", name: "GH₵10 Free Ride", points: 500, discount: 10, icon: "🚗", description: "GH₵10 credit on next ride" },
  { id: "free_ride_25", name: "GH₵25 Free Ride", points: 1000, discount: 25, icon: "✨", description: "GH₵25 credit on next ride" },
  { id: "free_ride_50", name: "GH₵50 Free Ride", points: 2000, discount: 50, icon: "👑", description: "GH₵50 credit on next ride" },
];

export default function LoyaltyCard({ userId }) {
  const [loyalty, setLoyalty] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const [loyaltyData, redemptionData] = await Promise.all([
        base44.entities.LoyaltyPoints.filter({ user_id: userId }),
        base44.entities.LoyaltyRedemption.filter({ user_id: userId }),
      ]);
      setLoyalty(loyaltyData[0] || null);
      setRedemptions(redemptionData);
      setLoading(false);
    }
    load();
  }, [userId]);

  const handleRedeem = async (reward) => {
    if (!loyalty || loyalty.total_points < reward.points) return;
    setRedeeming(reward.id);
    const updated = await base44.entities.LoyaltyPoints.update(loyalty.id, {
      total_points: loyalty.total_points - reward.points,
    });
    await base44.entities.LoyaltyRedemption.create({
      user_id: userId,
      reward_id: reward.id,
      reward_name: reward.name,
      points_spent: reward.points,
      discount_amount: reward.discount,
      status: "active",
    });
    setLoyalty({ ...loyalty, total_points: loyalty.total_points - reward.points });
    const newRedemptions = await base44.entities.LoyaltyRedemption.filter({ user_id: userId });
    setRedemptions(newRedemptions);
    setRedeeming(null);
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const points = loyalty?.total_points || 0;
  const lifetimePoints = loyalty?.lifetime_points || 0;
  const totalRides = loyalty?.total_rides || 0;
  const tier = loyalty?.tier || "bronze";
  const tierInfo = TIERS[tier];
  const TierIcon = tierInfo.icon;

  const nextTierKey = { bronze: "silver", silver: "gold", gold: "platinum" }[tier];
  const nextTier = nextTierKey ? TIERS[nextTierKey] : null;
  const progressToNext = nextTier
    ? Math.min(100, ((lifetimePoints - tierInfo.minPoints) / (nextTier.minPoints - tierInfo.minPoints)) * 100)
    : 100;

  const activeRedemptions = redemptions.filter((r) => r.status === "active");

  return (
    <div className="space-y-4">
      {/* Tier Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl border ${tierInfo.border} bg-gradient-to-br ${tierInfo.gradient} p-5`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-6" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TierIcon className="w-5 h-5 text-white" />
              <span className="text-white/70 text-sm font-medium">{tierInfo.label} Member</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-sm font-bold">{points.toLocaleString()} pts</span>
            </div>
          </div>
          <div className="mb-4">
            <div className="text-white text-3xl font-heading font-bold">{totalRides}</div>
            <div className="text-white/60 text-xs">Total Rides</div>
          </div>
          {nextTier && (
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>{tierInfo.label}</span>
                <span>{nextTier.label} at {nextTier.minPoints.toLocaleString()} pts</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1">
                {Math.max(0, nextTier.minPoints - lifetimePoints).toLocaleString()} pts to {nextTier.label}
              </p>
            </div>
          )}
          {!nextTier && (
            <p className="text-xs text-white/70">🎉 You've reached the highest tier!</p>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1">
        {["overview", "rewards", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Available", value: points.toLocaleString(), sub: "points" },
              { label: "Lifetime", value: lifetimePoints.toLocaleString(), sub: "earned" },
              { label: "Redeemed", value: activeRedemptions.length, sub: "rewards" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-3 text-center">
                <div className="font-heading font-bold text-lg text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-xs text-primary">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* How to earn */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> How to Earn Points
            </h4>
            <div className="space-y-2 text-sm">
              {[
                { icon: "🚗", text: "Complete a ride", pts: "+10 pts" },
                { icon: "⭐", text: "Rate your driver", pts: "+5 pts" },
                { icon: "👥", text: "Refer a friend", pts: "+50 pts" },
                { icon: "💰", text: "Every GH₵10 spent", pts: "+2 pts" },
              ].map((item) => (
                <div key={item.text} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span>{item.icon}</span>{item.text}
                  </span>
                  <span className="text-primary font-semibold text-xs">{item.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tier Benefits */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" /> {tierInfo.label} Benefits
            </h4>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              {tier === "bronze" && ["Earn 10 pts per ride", "Access to basic rewards"].map(b => (
                <div key={b} className="flex items-center gap-2"><span className="text-primary">✓</span>{b}</div>
              ))}
              {tier === "silver" && ["All Bronze benefits", "Earn 12 pts per ride", "Priority support", "5% booking discount"].map(b => (
                <div key={b} className="flex items-center gap-2"><span className="text-primary">✓</span>{b}</div>
              ))}
              {tier === "gold" && ["All Silver benefits", "Earn 15 pts per ride", "Free cancellations", "10% booking discount"].map(b => (
                <div key={b} className="flex items-center gap-2"><span className="text-primary">✓</span>{b}</div>
              ))}
              {tier === "platinum" && ["All Gold benefits", "Earn 20 pts per ride", "Dedicated support", "15% booking discount", "Monthly free ride"].map(b => (
                <div key={b} className="flex items-center gap-2"><span className="text-primary">✓</span>{b}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <div className="space-y-3">
          {activeRedemptions.length > 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-3">
              <p className="text-xs text-primary font-semibold mb-2">🎉 Active Rewards ({activeRedemptions.length})</p>
              {activeRedemptions.map((r) => (
                <div key={r.id} className="flex justify-between items-center text-sm">
                  <span className="text-foreground">{r.reward_name}</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Active</span>
                </div>
              ))}
            </div>
          )}
          {REWARDS.map((reward) => {
            const canAfford = points >= reward.points;
            return (
              <div
                key={reward.id}
                className={`bg-card border rounded-xl p-4 flex items-center gap-3 ${
                  canAfford ? "border-border" : "border-border opacity-60"
                }`}
              >
                <span className="text-2xl">{reward.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{reward.name}</p>
                  <p className="text-xs text-muted-foreground">{reward.description}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-semibold">{reward.points} pts</span>
                  </div>
                </div>
                <button
                  onClick={() => canAfford && handleRedeem(reward)}
                  disabled={!canAfford || redeeming === reward.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    canAfford
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {redeeming === reward.id ? "..." : canAfford ? "Redeem" : "Need more"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-2">
          {redemptions.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Gift className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No rewards redeemed yet</p>
            </div>
          ) : (
            redemptions.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.reward_name}</p>
                  <p className="text-xs text-muted-foreground">-{r.points_spent} pts</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  r.status === "active" ? "bg-primary/20 text-primary" :
                  r.status === "used" ? "bg-secondary text-muted-foreground" :
                  "bg-destructive/20 text-destructive"
                }`}>
                  {r.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}