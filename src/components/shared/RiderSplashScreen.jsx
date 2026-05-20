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

        {/* 3 in red (Ghana flag color) */}
        <span className="text-8xl md:text-9xl font-black text-red-600 leading-none relative" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
          3
          {/* Black star above the 3 */}
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl text-black">★</span>
        </span>

        {/* N in white */}
        <span className="text-8xl md:text-9xl font-black text-white leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
          N
        </span>
      </motion.div>
    </div>
  );
}