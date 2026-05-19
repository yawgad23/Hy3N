import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function RiderSplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background z-[9999] flex flex-col items-center justify-center">
      {/* Logo container */}
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* HY3N Logo */}
        <div className="relative">
          <motion.div
            className="flex items-center justify-center text-7xl font-black tracking-tighter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-white">HY</span>
            <motion.span
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
            >
              <span className="block relative">
                <span className="text-destructive block">3</span>
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <rect x="0" y="0" width="100" height="40" fill="currentColor" className="text-destructive" />
                  <rect x="0" y="40" width="100" height="30" fill="currentColor" className="text-yellow-400" />
                  <rect x="0" y="70" width="100" height="30" fill="currentColor" className="text-ghana-green" />
                </svg>
              </span>
            </motion.span>
            <span className="text-yellow-400">N</span>
          </motion.div>

          {/* Ghana flag accent line */}
          <motion.div
            className="absolute -bottom-4 left-0 right-0 h-1.5 rounded-full overflow-hidden"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1, originX: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex h-full">
              <div className="flex-1 bg-destructive" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-ghana-green" />
            </div>
          </motion.div>
        </div>

        {/* RIDER badge */}
        <motion.div
          className="mt-8 flex items-center gap-3 border-2 border-yellow-400 rounded-full px-6 py-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
          <span className="text-2xl font-black text-yellow-400 tracking-wider">RIDER</span>
        </motion.div>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        className="absolute bottom-16 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
        />
      </motion.div>
    </div>
  );
}