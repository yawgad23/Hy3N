import { LayoutDashboard, Car, UserCheck, Users, AlertTriangle, Banknote, LogOut } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { base44 } from "@/api/base44Client";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "rides", label: "Rides", icon: Car },
  { id: "drivers", label: "Drivers", icon: UserCheck },
  { id: "riders", label: "Riders", icon: Users },
  { id: "sos", label: "SOS Incidents", icon: AlertTriangle },
  { id: "withdrawals", label: "Withdrawals", icon: Banknote },
];

export default function AdminSidebar({ active, onNavigate }) {
  return (
    <aside className="w-60 flex-shrink-0 bg-card border-r border-border flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border">
        <Logo size="sm" />
        <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase">Admin Portal</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={() => base44.auth.logout("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}