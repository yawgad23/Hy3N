import { useNavigate, useLocation } from "react-router-dom";
import { Home, Clock, User, Wallet, CalendarClock } from "lucide-react";

const riderTabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/history", icon: Clock, label: "Activity" },
  { path: "/wallet", icon: Wallet, label: "Wallet" },
  { path: "/profile", icon: User, label: "Account" },
];

const driverTabs = [
  { path: "/driver-app", icon: Home, label: "Home" },
  { path: "/driver-app/scheduled", icon: CalendarClock, label: "Scheduled" },
  { path: "/driver-app/earnings", icon: Wallet, label: "Earnings" },
  { path: "/driver-app/history", icon: Clock, label: "History" },
  { path: "/driver-app/profile", icon: User, label: "Profile" },
];

// Persist last visited path per tab in sessionStorage
function getTabKey(tabPath) {
  return `tab_last_path:${tabPath}`;
}

export default function BottomNav({ role = "rider" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = role === "rider" ? riderTabs : driverTabs;

  // Save current path under its root tab key
  const activeTab = tabs.find((tab) =>
    tab.path === "/"
      ? location.pathname === "/"
      : location.pathname === tab.path || location.pathname.startsWith(tab.path + "/")
  );
  if (activeTab) {
    sessionStorage.setItem(getTabKey(activeTab.path), location.pathname);
  }

  const handleTabPress = (tab) => {
    const isActive =
      tab.path === "/"
        ? location.pathname === "/"
        : location.pathname === tab.path || location.pathname.startsWith(tab.path + "/");

    if (isActive) return; // already here

    // Restore last visited sub-path within this tab, or fall back to root
    const lastPath = sessionStorage.getItem(getTabKey(tab.path)) || tab.path;
    navigate(lastPath);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-screen-sm mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.path === "/"
              ? location.pathname === "/"
              : location.pathname === tab.path ||
                location.pathname.startsWith(tab.path + "/");
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => handleTabPress(tab)}
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
              <span className={`text-[10px] font-medium text-center ${isActive ? "font-semibold" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}