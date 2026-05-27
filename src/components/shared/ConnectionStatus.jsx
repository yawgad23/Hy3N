import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 pt-safe px-4 pb-2 ${
        isOnline
          ? "bg-ghana-green/90 backdrop-blur-md"
          : "bg-destructive/90 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>No internet connection</span>
          </>
        )}
      </div>
    </motion.div>
  );
}