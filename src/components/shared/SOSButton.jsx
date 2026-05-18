import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SOSButton({ role = "rider", rideId = null, location = null }) {
  const [confirming, setConfirming] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSOS = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke("triggerSOS", {
        lat: location?.[0] || null,
        lng: location?.[1] || null,
        role,
        ride_id: rideId
      });
      setTriggered(true);
      setConfirming(false);
    } catch (e) {
      console.error("SOS failed", e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-dismiss success state after 5s
  if (triggered) {
    setTimeout(() => setTriggered(false), 5000);
  }

  return (
    <>
      {/* SOS Trigger Button */}
      {!confirming && !triggered && (
        <button
          onClick={() => setConfirming(true)}
          className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center shadow-lg shadow-destructive/40 active:scale-95 transition-transform"
          aria-label="SOS Emergency"
        >
          <span className="text-white font-heading font-black text-xs tracking-widest">SOS</span>
        </button>
      )}

      {/* Success State */}
      {triggered && (
        <motion.button
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-12 h-12 rounded-full bg-ghana-green flex items-center justify-center shadow-lg"
        >
          <Phone className="w-5 h-5 text-white" />
        </motion.button>
      )}

      {/* Confirmation Overlay */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setConfirming(false)}
            />

            {/* Sheet */}
            <motion.div
              className="relative w-full max-w-lg bg-card border border-destructive/50 rounded-t-3xl p-6 z-10"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <button
                onClick={() => setConfirming(false)}
                className="absolute top-4 right-4 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-destructive/20 border border-destructive/40 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="font-heading font-black text-xl text-destructive">Emergency SOS</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  This will alert admins and send your live location via SMS to emergency contacts.
                </p>
              </div>

              <button
                onClick={handleSOS}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-destructive text-white font-heading font-bold text-lg tracking-wide disabled:opacity-60 active:scale-95 transition-transform shadow-lg shadow-destructive/40 mb-3"
              >
                {loading ? "Sending Alert..." : "🚨 SEND SOS NOW"}
              </button>

              <button
                onClick={() => setConfirming(false)}
                className="w-full h-12 rounded-2xl border border-border text-muted-foreground font-medium text-sm"
              >
                Cancel — I'm Safe
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}