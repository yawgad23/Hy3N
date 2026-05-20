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
        className="flex items-center justify-center gap-0"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* HY in white */}
        <span className="text-8xl md:text-9xl font-black text-white leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
          HY
        </span>

        {/* 3 with Ghana flag colors */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
          {/* Red section (top third) */}
          <div className="absolute inset-0 top-0 h-[33%] bg-red-600" />
          {/* Yellow section with black star (middle third) */}
          <div className="absolute inset-0 top-[33%] h-[34%] bg-yellow-400 flex items-center justify-center">
            <span className="text-black text-5xl font-black">★</span>
          </div>
          {/* Green section (bottom third) */}
          <div className="absolute inset-0 top-[67%] h-[33%] bg-green-600" />
          {/* 3 text overlay */}
          <span className="relative z-10 text-white font-black text-8xl md:text-9xl drop-shadow-2xl">
            3
          </span>
        </div>

        {/* N in yellow */}
        <span className="text-8xl md:text-9xl font-black text-yellow-400 leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
          N
        </span>
      </motion.div>
    </div>
  );
}