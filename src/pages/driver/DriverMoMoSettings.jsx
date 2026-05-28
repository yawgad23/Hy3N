import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Smartphone, ArrowLeft, CheckCircle2, AlertCircle, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Logo from "@/components/shared/Logo";
import { toast } from "sonner";

const PROVIDERS = [
  {
    id: "mtn",
    name: "MTN MoMo",
    color: "#FFCC00",
    textColor: "#1A1A1A",
    logo: "MTN",
    prefix: ["024", "054", "055", "059"],
    description: "MTN Mobile Money"
  },
  {
    id: "vodafone",
    name: "Telecel Cash",
    color: "#E60000",
    textColor: "#FFFFFF",
    logo: "TCash",
    prefix: ["020", "050"],
    description: "Telecel (Vodafone) Cash"
  },
  {
    id: "airteltigo",
    name: "AirtelTigo Money",
    color: "#FF6600",
    textColor: "#FFFFFF",
    logo: "AT",
    prefix: ["026", "056", "027", "057"],
    description: "AirtelTigo Money"
  }
];

function detectProvider(phone) {
  const clean = phone.replace(/\s/g, "").replace(/^\+233/, "0");
  return PROVIDERS.find(p => p.prefix.some(pfx => clean.startsWith(pfx))) || null;
}

function formatPhone(phone) {
  const clean = phone.replace(/\s/g, "").replace(/[^0-9+]/g, "");
  return clean;
}

export default function DriverMoMoSettings() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNumber, setShowNumber] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [momoNumber, setMomoNumber] = useState("");
  const [momoProvider, setMomoProvider] = useState("mtn");
  const [momoName, setMomoName] = useState("");
  const [detectedProvider, setDetectedProvider] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await base44.auth.me();
        if (me) {
          const profiles = await base44.entities.DriverProfile.filter({ user_id: me.id });
          if (profiles.length > 0) {
            const profile = profiles[0];
            setDriver(profile);
            setMomoNumber(profile.momo_number || "");
            setMomoProvider(profile.momo_provider || "mtn");
            setMomoName(profile.momo_name || profile.full_name || "");
            if (profile.momo_number) {
              setDetectedProvider(detectProvider(profile.momo_number));
            }
          }
        }
      } catch (err) {
        console.error("Error loading driver profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePhoneChange = (value) => {
    const formatted = formatPhone(value);
    setMomoNumber(formatted);
    const detected = detectProvider(formatted);
    setDetectedProvider(detected);
    if (detected) {
      setMomoProvider(detected.id);
    }
  };

  const isValidNumber = () => {
    const clean = momoNumber.replace(/\s/g, "").replace(/^\+233/, "0");
    return clean.length === 10 && /^0\d{9}$/.test(clean);
  };

  const handleSave = async () => {
    if (!driver || !momoNumber || !momoProvider) return;
    
    if (!isValidNumber()) {
      toast.error("Please enter a valid 10-digit Ghana phone number");
      return;
    }

    setSaving(true);
    try {
      const updated = await base44.entities.DriverProfile.update(driver.id, {
        momo_number: momoNumber,
        momo_provider: momoProvider,
        momo_name: momoName || driver.full_name
      });
      setDriver(updated);
      setSaved(true);
      toast.success("MoMo details updated successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving MoMo details:", err);
      toast.error("Failed to save MoMo details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMoMo = async () => {
    if (!driver) return;
    if (!confirm("Are you sure you want to remove your MoMo details? Riders won't be able to pay you directly via Mobile Money.")) return;
    
    setSaving(true);
    try {
      const updated = await base44.entities.DriverProfile.update(driver.id, {
        momo_number: "",
        momo_provider: "mtn",
        momo_name: ""
      });
      setDriver(updated);
      setMomoNumber("");
      setMomoProvider("mtn");
      setMomoName("");
      setDetectedProvider(null);
      toast.success("MoMo details removed");
    } catch (err) {
      toast.error("Failed to remove MoMo details");
    } finally {
      setSaving(false);
    }
  };

  const selectedProviderInfo = PROVIDERS.find(p => p.id === momoProvider) || PROVIDERS[0];
  const hasExistingMoMo = driver?.momo_number && driver.momo_number.length > 0;
  const hasChanges = momoNumber !== (driver?.momo_number || "") || 
                     momoProvider !== (driver?.momo_provider || "mtn") ||
                     momoName !== (driver?.momo_name || driver?.full_name || "");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/driver-app/profile")} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-lg">MoMo Payment Settings</h1>
            <p className="text-xs text-muted-foreground">Accept direct payments from riders</p>
          </div>
          <Logo size="sm" variant="driver" />
        </div>
      </div>

      <div className="p-4 space-y-6 pb-32">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-sm">Direct MoMo Payments</h3>
              <p className="text-xs text-muted-foreground mt-1">
                When riders choose Mobile Money as their payment method, your MoMo number will be displayed to them so they can send payment directly to you after the trip.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current Status */}
        {hasExistingMoMo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-ghana-green/10 border border-ghana-green/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-ghana-green" />
              <span className="text-sm font-semibold text-ghana-green">MoMo Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Riders can see your MoMo number and pay you directly after completing a trip.
            </p>
          </motion.div>
        )}

        {!hasExistingMoMo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">MoMo Not Configured</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Set up your MoMo details below so riders can pay you directly via Mobile Money.
            </p>
          </motion.div>
        )}

        {/* Provider Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Select Your MoMo Provider
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {PROVIDERS.map((prov) => (
              <button
                key={prov.id}
                type="button"
                onClick={() => setMomoProvider(prov.id)}
                className={`relative rounded-2xl p-4 border-2 transition-all ${
                  momoProvider === prov.id
                    ? "border-primary scale-[1.02] shadow-lg"
                    : "border-border hover:border-border/80"
                }`}
                style={momoProvider === prov.id ? { backgroundColor: prov.color + "15" } : {}}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-xs font-bold shadow-sm"
                  style={{ backgroundColor: prov.color, color: prov.textColor }}
                >
                  {prov.logo}
                </div>
                <p className="text-xs font-semibold text-center leading-tight">{prov.name}</p>
                {momoProvider === prov.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* MoMo Number Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            MoMo Phone Number
          </Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-lg">🇬🇭</span>
              <span className="text-sm font-medium text-muted-foreground">+233</span>
            </div>
            <Input
              type="tel"
              placeholder="024 000 0000"
              value={momoNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="pl-[5.5rem] pr-20 bg-secondary border-none h-14 text-lg font-mono tracking-wider"
              maxLength={12}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {momoNumber && (
                <button
                  onClick={() => setShowNumber(!showNumber)}
                  className="p-1.5 rounded-lg hover:bg-background/50 transition-colors"
                >
                  {showNumber ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              )}
              {detectedProvider && (
                <div
                  className="px-2 py-1 rounded-lg text-[10px] font-bold"
                  style={{ backgroundColor: detectedProvider.color, color: detectedProvider.textColor }}
                >
                  {detectedProvider.logo}
                </div>
              )}
            </div>
          </div>
          {momoNumber && !isValidNumber() && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Enter a valid 10-digit Ghana phone number (e.g., 024XXXXXXX)
            </p>
          )}
          {momoNumber && isValidNumber() && (
            <p className="text-xs text-ghana-green flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Valid {selectedProviderInfo.name} number
            </p>
          )}
        </motion.div>

        {/* Account Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            MoMo Account Name (shown to riders)
          </Label>
          <Input
            type="text"
            placeholder="Your registered MoMo name"
            value={momoName}
            onChange={(e) => setMomoName(e.target.value)}
            className="bg-secondary border-none h-14 text-base"
          />
          <p className="text-[11px] text-muted-foreground">
            This name will be displayed to riders when they make a payment. Use the name registered on your MoMo account.
          </p>
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-secondary rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Security Note</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Your MoMo number is only shown to riders after they have been matched with you and the trip is completed. 
                It is never shared publicly or with other drivers.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Preview Card */}
        {momoNumber && isValidNumber() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Preview — What Riders Will See
            </Label>
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Recipient Driver</p>
                  <p className="font-semibold text-sm">{momoName || driver?.full_name || "Driver"}</p>
                </div>
                <div
                  className="px-2 py-1 rounded text-[10px] font-bold uppercase"
                  style={{ backgroundColor: selectedProviderInfo.color, color: selectedProviderInfo.textColor }}
                >
                  {selectedProviderInfo.name}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">MoMo Phone Number</p>
                <p className="font-mono font-bold text-lg text-foreground tracking-wider">
                  {showNumber ? momoNumber : momoNumber.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 pb-safe z-20">
        <div className="space-y-3 max-w-md mx-auto">
          <Button
            onClick={handleSave}
            disabled={!momoNumber || !isValidNumber() || saving || !hasChanges}
            className="w-full h-14 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold text-base rounded-xl disabled:opacity-40"
          >
            {saving ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
            ) : saved ? (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            ) : (
              <Smartphone className="w-5 h-5 mr-2" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : hasChanges ? "Save MoMo Details" : "No Changes"}
          </Button>

          {hasExistingMoMo && (
            <button
              onClick={handleRemoveMoMo}
              disabled={saving}
              className="w-full text-sm text-destructive hover:text-destructive/80 py-2 font-medium transition-colors"
            >
              Remove MoMo Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
