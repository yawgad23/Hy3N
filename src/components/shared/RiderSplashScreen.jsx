import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function RiderSplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onCompleteRef.current) onCompleteRef.current();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-[9999] flex items-center justify-center h-screen-safe">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_70%)]" />
      
      {/* HY3N Logo - Premium centered design */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Main logo */}
        <svg viewBox="0 0 200 80" className="w-80 h-auto drop-shadow-2xl">
          <defs>
            {/* Ghana flag gradient for the 3 */}
            <linearGradient id="ghanaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CE1126" />
              <stop offset="33%" stopColor="#CE1126" />
              <stop offset="33%" stopColor="#FCD116" />
              <stop offset="66%" stopColor="#FCD116" />
              <stop offset="66%" stopColor="#006B3F" />
              <stop offset="100%" stopColor="#006B3F" />
            </linearGradient>
            {/* Gold gradient for shine */}
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD116" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
          
          {/* HY in crisp white */}
          <text x="0" y="58" fontFamily="Outfit, sans-serif" fontSize="52" fontWeight="900" fill="#FFFFFF" letterSpacing="-1.5">
            HY
          </text>
          
          {/* 3 with horizontal Ghana flag stripes */}
          <text x="68" y="58" fontFamily="Outfit, sans-serif" fontSize="52" fontWeight="900" fill="url(#ghanaGradient)" letterSpacing="-1">
            3
          </text>
          
          {/* Black star centered above the 3 */}
          <text x="92" y="22" fontSize="18" fill="#000000" fontWeight="bold">
            ★
          </text>
          
          {/* N in premium gold */}
          <text x="112" y="58" fontFamily="Outfit, sans-serif" fontSize="52" fontWeight="900" fill="url(#goldGradient)" letterSpacing="-1">
            N
          </text>
        </svg>

        {/* Elegant curved underline with Ghana colors */}
        <motion.svg 
          viewBox="0 0 180 30" 
          className="w-64 h-12 mt-2"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <path 
            d="M 10,15 Q 50,8 90,15 Q 130,22 170,15" 
            stroke="url(#goldGradient)" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
            className="drop-shadow-lg"
          />
        </motion.svg>

        {/* Tagline */}
        <motion.p
          className="text-gray-400 text-sm mt-4 font-light tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Ghana's Ride
        </motion.p>
      </motion.div>
    </div>
  );
}