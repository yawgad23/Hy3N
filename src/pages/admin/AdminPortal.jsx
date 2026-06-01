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
import { Shield } from "lucide-react";

import { base44 } from "@/api/base44Client";

export default function AdminPortal() {
  const [section, setSection] = useState("overview");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setAuthChecked(true); }).catch(() => setAuthChecked(true));
  }, []);

  if (!authChecked) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!user || user.role !== "admin") return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Shield className="w-16 h-16 text-muted-foreground" />
      <h2 className="font-heading font-bold text-2xl">Admin Access Only</h2>
      <p className="text-muted-foreground">You don't have permission to view this page.</p>
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
