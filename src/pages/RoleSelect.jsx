import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Briefcase, ChevronRight, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/shared/Logo";
import SplashScreen from "@/components/shared/SplashScreen";

export default function RoleSelect() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then((u) => { if (u?.role === "admin") setIsAdmin(true); }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" />
      ) : (
        <motion.div
          key="content"
          className="min-h-screen bg-background flex flex-col items-center px-6 pt-16 pb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="lg" />

          <motion.h1
            className="text-2xl font-heading font-bold text-foreground mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Akwaaba to HY3N
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-sm mt-2 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Choose how you want to use HY3N
          </motion.p>

          <div className="w-full max-w-sm mt-12 space-y-4">
            <motion.button
              onClick={() => navigate("/rider")}
              className="w-full bg-card border border-border rounded-2xl p-6 flex items-center gap-4 hover:border-primary/50 transition-all group"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-14 h-14 rounded-xl bg-ghana-green/20 flex items-center justify-center">
                <Car className="w-7 h-7 text-ghana-green" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-heading font-semibold text-lg text-foreground">Ride with HY3N</h3>
                <p className="text-muted-foreground text-sm">Book rides across Ghana</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.button>

            <motion.button
              onClick={() => navigate("/driver")}
              className="w-full bg-card border border-border rounded-2xl p-6 flex items-center gap-4 hover:border-primary/50 transition-all group"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-heading font-semibold text-lg text-foreground">Drive with HY3N</h3>
                <p className="text-muted-foreground text-sm">Earn money as a driver</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.button>
          </div>

          {isAdmin && (
            <motion.button
              onClick={() => navigate("/admin")}
              className="w-full max-w-sm mt-4 bg-card border border-primary/30 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/60 transition-all group"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-heading font-semibold text-lg text-foreground">Admin Dashboard</h3>
                <p className="text-muted-foreground text-sm">Platform analytics & ops</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.button>
          )}

          <div className="mt-auto pt-10">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-ghana-red" />
              <div className="h-1 w-8 rounded-full bg-ghana-gold" />
              <div className="h-1 w-8 rounded-full bg-ghana-green" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}