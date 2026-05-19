import { useState } from "react";
import { Smartphone, Download, Share, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function InstallGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-40 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-lg"
      >
        <Download className="w-4 h-4 text-foreground" />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsOpen(false)} />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-t-3xl p-6"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-heading font-bold text-xl">Install HY3N App</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Get the app experience on your phone
              </p>
            </div>

            {isIOS ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Share className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Tap Share</p>
                    <p className="text-xs text-muted-foreground">Tap the share icon in Safari</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Add to Home Screen</p>
                    <p className="text-xs text-muted-foreground">Scroll down and tap "Add to Home Screen"</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Install</p>
                    <p className="text-xs text-muted-foreground">Tap "Add" to confirm</p>
                  </div>
                </div>
              </div>
            ) : isAndroid ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Install App</p>
                    <p className="text-xs text-muted-foreground">Tap "Install" when prompted</p>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                  <p className="text-xs text-primary font-medium">
                    💡 Tip: You can also tap the menu (⋮) in Chrome and select "Install app"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  Open this app on your mobile device to install
                </p>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-6 h-12 rounded-xl border border-border font-medium text-sm"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}