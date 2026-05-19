import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show if user hasn't installed before
      const hasInstalled = localStorage.getItem("pwa_installed");
      if (!hasInstalled) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      localStorage.setItem("pwa_installed", "true");
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_installed", "true");
  };

  if (!showPrompt) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-20 left-4 right-4 z-50 bg-card border border-border rounded-2xl p-4 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-bold text-sm">Install HY3N App</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Add to your home screen for quick access and a better experience
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-lg"
            >
              Install Now
            </button>
            <button
              onClick={handleClose}
              className="px-3 py-2.5 border border-border rounded-lg text-xs text-muted-foreground"
            >
              Later
            </button>
          </div>
        </div>
        <button onClick={handleClose} className="text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}