import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, CreditCard, LogOut, ChevronRight, Shield, Trash2, Star, Wallet, Users, Trophy, Fingerprint } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BottomNav from "@/components/shared/BottomNav";
import Logo from "@/components/shared/Logo";
import ReferFriendModal from "@/components/rider/ReferFriendModal";
import LoyaltyCard from "@/components/rider/LoyaltyCard";

export default function RiderProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      if (me) {
        const profiles = await base44.entities.RiderProfile.filter({ user_id: me.id });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          setForm({ full_name: profiles[0].full_name, phone: profiles[0].phone, email: profiles[0].email || "" });
        } else {
          setForm({ full_name: me.full_name || "", phone: "", email: me.email || "" });
        }
        
        // Check biometric status
        try {
          const keys = await base44.entities.BiometricKey.filter({ user_id: me.id });
          if (keys.length > 0 && keys[0].enabled) {
            setBiometricEnabled(true);
          }
        } catch (e) {
          // Entity might not exist
        }
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (profile) {
      await base44.entities.RiderProfile.update(profile.id, form);
    } else {
      await base44.entities.RiderProfile.create({ ...form, user_id: user.id });
    }
    setEditing(false);
  };

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  const handleDeleteAccount = async () => {
    if (profile) await base44.entities.RiderProfile.delete(profile.id);
    base44.auth.logout("/");
  };

  const handleSetupBiometric = async () => {
    try {
      // Get registration challenge
      const res = await base44.functions.invoke("generateBiometricKey", {});
      
      // Request biometric authentication from device
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(res.data.challenge),
          rp: {
            name: "HY3N",
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(user.id.split('').map(c => c.charCodeAt(0))),
            name: user.email,
            displayName: user.full_name,
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: false,
            userVerification: "required",
          },
          timeout: 60000,
        }
      });

      // Verify and save
      const verifyRes = await base44.functions.invoke("verifyBiometricKey", {
        credential: credential
      });

      if (verifyRes.data.success) {
        setBiometricEnabled(true);
        localStorage.setItem("biometricEmail", user.email);
        toast({
          title: "Biometric enabled!",
          description: "You can now use biometric login.",
        });
      }
    } catch (err) {
      console.error("Biometric setup error:", err);
      toast({
        title: "Setup failed",
        description: err.message || "Could not enable biometric authentication",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 pt-6 flex items-center gap-3 border-b border-border" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
        <Logo size="sm" />
        <h1 className="font-heading font-bold text-xl">Profile</h1>
      </div>

      <div className="p-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-primary">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-heading font-bold text-lg mt-3">{user?.full_name || "Rider"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {profile?.rating > 0 && (
            <div className="flex items-center gap-1.5 mt-2 bg-primary/10 px-3 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-sm font-semibold text-primary">{profile.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">avg rating</span>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-4 bg-card border border-border rounded-xl p-4">
            <div>
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="bg-secondary border-none mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-secondary border-none mt-1"
                placeholder="+233..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-secondary border-none mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 bg-ghana-green hover:bg-ghana-green/90 text-white">
                Save
              </Button>
              <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => setEditing(true)}
              className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm">Edit Profile</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate("/wallet")}
              className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
            >
              <Wallet className="w-5 h-5 text-primary" />
              <span className="flex-1 text-left text-sm font-medium">My Wallet</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setShowLoyalty(!showLoyalty)}
              className="w-full flex items-center gap-3 p-4 bg-card border border-primary/30 rounded-xl"
            >
              <Trophy className="w-5 h-5 text-primary" />
              <span className="flex-1 text-left text-sm font-medium text-primary">Loyalty Rewards</span>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showLoyalty ? "rotate-90" : ""}`} />
            </button>
            {showLoyalty && user && (
              <div className="mt-1">
                <LoyaltyCard userId={user.id} />
              </div>
            )}
            <button
              onClick={handleSetupBiometric}
              disabled={!window.PublicKeyCredential}
              className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl disabled:opacity-50"
            >
              <Fingerprint className={`w-5 h-5 ${biometricEnabled ? 'text-ghana-green' : 'text-muted-foreground'}`} />
              <span className="flex-1 text-left text-sm font-medium">
                {biometricEnabled ? 'Biometric Enabled' : 'Enable Biometric Login'}
              </span>
              {biometricEnabled ? (
                <Shield className="w-4 h-4 text-ghana-green" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={() => setShowReferModal(true)}
              className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
            >
              <Users className="w-5 h-5 text-ghana-green" />
              <span className="flex-1 text-left text-sm font-medium">Refer a Friend</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm">Payment Methods</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm">Safety</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 bg-card border border-destructive/30 rounded-xl mt-4"
            >
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="flex-1 text-left text-sm text-destructive">Log Out</span>
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl mt-2"
            >
              <Trash2 className="w-5 h-5 text-destructive" />
              <span className="flex-1 text-left text-sm text-destructive">Delete Account</span>
            </button>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all ride history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReferFriendModal isOpen={showReferModal} onClose={() => setShowReferModal(false)} />

      <BottomNav role="rider" />
    </div>
  );
}