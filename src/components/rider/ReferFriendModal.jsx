import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Share2, Users, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ReferFriendModal({ isOpen, onClose }) {
  const [inviteCode, setInviteCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, credited: 0, earnings: 0 });

  useEffect(() => {
    if (isOpen && !inviteCode) {
      loadInviteCode();
    }
  }, [isOpen]);

  const loadInviteCode = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateInviteCode", {});
      setInviteCode(res.data);

      // Load referral stats
      const referrals = await base44.entities.Referral.filter({});
      const credited = referrals.filter(r => r.status === "credited");
      const earnings = credited.reduce((sum, r) => sum + (r.referrer_reward || 0), 0);

      setStats({
        total: referrals.length,
        credited: credited.length,
        earnings
      });
    } catch (error) {
      toast.error("Failed to load invite code");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode.invite_code);
      toast.success("Invite code copied!");
    }
  };

  const handleShare = async () => {
    if (inviteCode) {
      const shareText = `Join HY3N with my invite code ${inviteCode.invite_code} and get GH₵10 bonus on your first ride! I'll also get GH₵15 when you complete it. 🚗💨`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'HY3N Referral',
            text: shareText,
          });
        } catch (error) {
          if (error.name !== 'AbortError') {
            navigator.clipboard.writeText(shareText);
            toast.success("Share text copied!");
          }
        }
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success("Share text copied!");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 bottom-4 md:inset-0 md:m-auto md:max-w-md md:h-fit bg-card border border-border rounded-3xl z-50 overflow-hidden"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg">Refer a Friend</h3>
                    <p className="text-xs text-muted-foreground">Earn GH₵15 per friend</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reward Info */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <p className="text-sm font-bold text-primary">How it works</p>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Share your unique invite code</li>
                  <li>• Friend signs up and completes first ride</li>
                  <li>• You get GH₵15, they get GH₵10 bonus</li>
                </ul>
              </div>

              {/* Invite Code Display */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : inviteCode ? (
                <div className="mb-6">
                  <p className="text-xs text-muted-foreground mb-2">Your Invite Code</p>
                  <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl p-4">
                    <code className="flex-1 font-heading font-bold text-lg tracking-wider">
                      {inviteCode.invite_code}
                    </code>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleShare}
                    className="w-full mt-3 bg-ghana-green hover:bg-ghana-green/90 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Share Invite
                  </Button>
                </div>
              ) : null}

              {/* Stats */}
              {stats.total > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-3">Your Referrals</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="font-heading font-bold text-lg text-primary">{stats.total}</p>
                      <p className="text-[10px] text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="font-heading font-bold text-lg text-ghana-green">{stats.credited}</p>
                      <p className="text-[10px] text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="font-heading font-bold text-lg text-primary">GH₵{stats.earnings}</p>
                      <p className="text-[10px] text-muted-foreground">Earned</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}