import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminRides from "@/components/admin/AdminRides";
import AdminDrivers from "@/components/admin/AdminDrivers";
import AdminRiders from "@/components/admin/AdminRiders";
import AdminSOS from "@/components/admin/AdminSOS";
import AdminWithdrawals from "@/components/admin/AdminWithdrawals";
import AdminLiveMap from "@/components/admin/AdminLiveMap";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminCancellations from "@/components/admin/AdminCancellations";
import AdminPromos from "@/components/admin/AdminPromos";
import AdminRideReports from "@/components/admin/AdminRideReports";
import { Shield, Lock, Eye, EyeOff, AlertTriangle, LogOut } from "lucide-react";

import { base44 } from "@/api/base44Client";

// ============================================================
// ADMIN SECURITY CONFIGURATION
// ============================================================
const MASTER_ACCESS_CODE = "HY3N-ADMIN-2024";
const ADMIN_EMAILS = [
  "yawgad23@gmail.com",
  // Add more admin emails here
];
// ============================================================

export default function AdminPortal() {
  const [section, setSection] = useState("overview");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [accessVerified, setAccessVerified] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setAuthChecked(true);
      // Check if already verified this session
      if (u && sessionStorage.getItem(`admin_verified_${u.email}`) === "true") {
        setAccessVerified(true);
      }
    }).catch(() => setAuthChecked(true));
  }, []);

  const verifyCode = () => {
    if (accessCode === MASTER_ACCESS_CODE) {
      setAccessVerified(true);
      setCodeError("");
      if (user?.email) {
        sessionStorage.setItem(`admin_verified_${user.email}`, "true");
      }
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 4) {
        setCodeError("Too many failed attempts. Please try again later.");
      } else {
        setCodeError("Invalid access code. Please try again.");
      }
    }
  };

  if (!authChecked) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  // Check if user is in the admin whitelist
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase());

  if (!user || !isAdmin) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Shield className="w-16 h-16 text-muted-foreground" />
      <h2 className="font-heading font-bold text-2xl">Admin Access Only</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        {user ? `${user.email} is not authorized to access the admin panel.` : "You need to log in first."}
      </p>
      <button
        onClick={() => base44.auth.logout("/login")}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition"
      >
        {user ? "Switch Account" : "Log In"}
      </button>
    </div>
  );

  // Access code verification screen
  if (!accessVerified) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-heading font-bold text-xl">Admin Verification</h2>
          <p className="text-muted-foreground text-sm mt-2">Enter the access code to continue</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="relative">
            <input
              type={showCode ? "text" : "password"}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyCode()}
              placeholder="Enter access code"
              disabled={attempts >= 5}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50 transition"
            />
            <button
              onClick={() => setShowCode(!showCode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            >
              {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {codeError && (
            <p className="text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {codeError}
            </p>
          )}

          <button
            onClick={verifyCode}
            disabled={attempts >= 5 || !accessCode}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {attempts >= 5 ? "Locked" : "Verify Access"}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-muted-foreground text-xs">{user?.email}</p>
          <button
            onClick={() => base44.auth.logout("/login")}
            className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 transition"
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar active={section} onNavigate={setSection} />
      <main className="flex-1 overflow-y-auto">
        {section === "overview" && <AdminOverview onNavigate={setSection} />}
        {section === "live-map" && <AdminLiveMap />}
        {section === "rides" && <AdminRides />}
        {section === "drivers" && <AdminDrivers />}
        {section === "riders" && <AdminRiders />}
        {section === "payments" && <AdminPayments />}
        {section === "cancellations" && <AdminCancellations />}
        {section === "promos" && <AdminPromos />}
        {section === "sos" && <AdminSOS />}
        {section === "withdrawals" && <AdminWithdrawals />}
        {section === "reports" && <AdminRideReports />}
      </main>
    </div>
  );
}
