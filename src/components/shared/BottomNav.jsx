import { Link, useLocation } from "react-router-dom";
import { Home, Clock, User, HelpCircle, Wallet } from "lucide-react";

const riderTabs = [
  { path: "/rider", icon: Home, label: "Home" },
  { path: "/rider/history", icon: Clock, label: "History" },
  { path: "/rider/profile", icon: User, label: "Profile" },
  { path: "/rider/support", icon: HelpCircle, label: "Support" }
];

const driverTabs = [
  { path: "/driver", icon: Home, label: "Home" },
  { path: "/driver/earnings", icon: Wallet, label: "Earnings" },
  { path: "/driver/history", icon: Clock, label: "History" },
  { path: "/driver/profile", icon: User, label: "Profile" }
];

export default function BottomNav({ role = "rider" }) {
  const location = useLocation();
  const tabs = role === "rider" ? riderTabs : driverTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}