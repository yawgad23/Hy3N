import { Link, useLocation } from "react-router-dom";
import { Home, Clock, User, Wallet, CalendarClock } from "lucide-react";

const riderTabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/scheduled", icon: CalendarClock, label: "Scheduled" },
  { path: "/history", icon: Clock, label: "History" },
  { path: "/profile", icon: User, label: "Profile" },
];

const driverTabs = [
  { path: "/driver-app", icon: Home, label: "Home" },
  { path: "/driver-app/scheduled", icon: CalendarClock, label: "Scheduled" },
  { path: "/driver-app/earnings", icon: Wallet, label: "Earnings" },
  { path: "/driver-app/history", icon: Clock, label: "History" },
  { path: "/driver-app/profile", icon: User, label: "Profile" },
];

export default function BottomNav({ role = "rider" }) {
  const location = useLocation();
  const tabs = role === "rider" ? riderTabs : driverTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-center h-16 max-w-screen-sm mx-auto">
        {tabs.map((tab) => {
          // For root "/" use exact match only; others use startsWith
          const isActive =
            tab.path === "/"
              ? location.pathname === "/"
              : location.pathname === tab.path ||
                location.pathname.startsWith(tab.path + "/");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              replace={location.pathname === tab.path} // don't stack same page
              className={`flex flex-col items-center gap-1 px-2 py-2 transition-colors flex-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium text-center ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}