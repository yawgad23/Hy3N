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
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center">
      {/* Logo container */}
      <motion.div
        className="flex flex-col items-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* HY3N Logo */}
        <div className="relative">
          <motion.div
            className="flex items-center justify-center gap-0 relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* HY in white */}
            <span className="text-8xl font-black text-white leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
              HY
            </span>

            {/* 3 with Ghana flag */}
            <motion.div
              className="relative text-8xl font-black leading-none"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 120 }}
            >
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Red section */}
                <div className="absolute inset-0 top-0 h-1/3 bg-red-600 flex items-center justify-center" />
                {/* Yellow section with star */}
                <div className="absolute inset-0 top-1/3 h-1/3 bg-yellow-400 flex items-center justify-center">
                  <span className="text-black font-black text-6xl">★</span>
                </div>
                {/* Green section */}
                <div className="absolute inset-0 top-2/3 h-1/3 bg-green-600" />
                {/* 3 text overlay */}
                <span className="relative z-10 text-white font-black text-7xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                  3
                </span>
              </div>
            </motion.div>

            {/* N in yellow */}
            <span className="text-8xl font-black text-yellow-400 leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
              N
            </span>
          </motion.div>

          {/* Ghana flag curved line */}
          <motion.svg
            className="absolute -bottom-6 left-0 right-0 w-full"
            height="6"
            viewBox="0 0 400 6"
            preserveAspectRatio="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <defs>
              <linearGradient id="flagGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#DC143C" />
                <stop offset="30%" stopColor="#FCD34D" />
                <stop offset="70%" stopColor="#16A34A" />
              </linearGradient>
            </defs>
            <path
              d="M 0 3 Q 200 0 400 3"
              stroke="url(#flagGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </motion.svg>
        </div>

        {/* RIDER badge */}
        <motion.div
          className="mt-6 flex items-center gap-2 border-2 border-yellow-400 rounded-full px-8 py-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <User className="w-6 h-6 text-yellow-400" />
          <span className="text-xl font-black text-yellow-400 tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>
            RIDER
          </span>
        </motion.div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="absolute bottom-12 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </motion.div>
    </div>
  );
}