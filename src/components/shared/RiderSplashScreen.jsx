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
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center h-screen-safe">
      {/* HY3N Logo - Centered, minimal like Uber/Bolt */}
      <motion.div
        className="flex flex-col items-center justify-center gap-0"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Main logo row */}
        <svg viewBox="0 0 240 100" className="w-72 h-auto" style={{ maxWidth: '90vw' }}>
          <defs>
            <linearGradient id="threeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CE1126" />
              <stop offset="33%" stopColor="#CE1126" />
              <stop offset="33%" stopColor="#FCD116" />
              <stop offset="66%" stopColor="#FCD116" />
              <stop offset="66%" stopColor="#006B3F" />
              <stop offset="100%" stopColor="#006B3F" />
            </linearGradient>
          </defs>
          {/* HY in white */}
          <text x="0" y="65" fontFamily="Outfit, sans-serif" fontSize="72" fontWeight="900" fill="#FFFFFF" letterSpacing="-2">
            HY
          </text>
          {/* 3 with Ghana flag gradient */}
          <text x="90" y="65" fontFamily="Outfit, sans-serif" fontSize="72" fontWeight="900" fill="url(#threeGradient)" letterSpacing="-2">
            3
          </text>
          {/* Star on the 3 */}
          <text x="120" y="25" fontFamily="Arial" fontSize="24" fill="#000000">
            ★
          </text>
          {/* N in gold */}
          <text x="145" y="65" fontFamily="Outfit, sans-serif" fontSize="72" fontWeight="900" fill="#FCD116" letterSpacing="-2">
            N
          </text>
        </svg>

        {/* Decorative curved Ghana-colored lines */}
        <div className="mt-4 flex gap-0 w-48 h-2">
          <svg viewBox="0 0 200 10" className="w-full" preserveAspectRatio="none">
            <path d="M 0,5 Q 50,2 100,5 Q 150,8 200,5" stroke="#CE1126" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 0,7 Q 50,4 100,7 Q 150,10 200,7" stroke="#FCD116" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 0,9 Q 50,6 100,9 Q 150,12 200,9" stroke="#006B3F" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}