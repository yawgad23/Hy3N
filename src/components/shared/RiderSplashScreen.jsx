import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

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
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center h-screen-safe">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Logo container - centered full screen */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* HY3N Logo - Large and centered */}
        <motion.div
          className="flex items-center justify-center gap-0 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* HY in white */}
          <span className="text-9xl font-black text-white leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
            HY
          </span>

          {/* 3 with Ghana flag - Animated reveal */}
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Red section (top third) */}
              <div className="absolute inset-0 top-0 h-[33%] bg-red-600" />
              {/* Yellow section with black star (middle third) */}
              <div className="absolute inset-0 top-[33%] h-[34%] bg-yellow-400 flex items-center justify-center">
                <motion.span
                  className="text-black text-5xl font-black"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                >
                  ★
                </motion.span>
              </div>
              {/* Green section (bottom third) */}
              <div className="absolute inset-0 top-[67%] h-[33%] bg-green-600" />
              {/* 3 text overlay with shadow */}
              <span className="relative z-10 text-white font-black text-8xl drop-shadow-2xl" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
                3
              </span>
            </div>
          </motion.div>

          {/* N in yellow */}
          <span className="text-9xl font-black text-yellow-400 leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
            N
          </span>
        </motion.div>

        {/* RIDER badge - Animated slide up */}
        <motion.div
          className="flex items-center gap-3 border-2 border-yellow-400/80 rounded-full px-10 py-3 bg-yellow-400/10 backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <User className="w-7 h-7 text-yellow-400" strokeWidth={2.5} />
          <span className="text-2xl font-black text-yellow-400 tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>
            RIDER
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="mt-6 text-gray-400 text-sm font-medium tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          Your ride, your way
        </motion.p>
      </motion.div>

      {/* Loading indicator - Bottom center */}
      <motion.div
        className="absolute bottom-20 left-0 right-0 flex justify-center gap-3 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="w-3 h-3 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
      </motion.div>

      {/* Ghana flag accent line - Bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1.5 flex z-10"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1, originX: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <motion.div
          className="flex-1 bg-red-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        />
        <motion.div
          className="flex-1 bg-yellow-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        />
        <motion.div
          className="flex-1 bg-green-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        />
      </motion.div>
    </div>
  );
}