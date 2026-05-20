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
        <div className="flex items-center justify-center gap-0">
          {/* HY in white */}
          <span className="text-8xl md:text-9xl font-black text-white leading-none" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
            HY
          </span>

          {/* 3 with Ghana flag colors (red, yellow, green stripes) */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
            {/* Red stripe (top) */}
            <div className="absolute inset-0 top-0 h-[33%] bg-[#CE1126]" />
            {/* Yellow stripe with black star (middle) */}
            <div className="absolute inset-0 top-[33%] h-[34%] bg-[#FCD116] flex items-center justify-center">
              <span className="absolute -top-8 text-4xl text-black">★</span>
            </div>
            {/* Green stripe (bottom) */}
            <div className="absolute inset-0 top-[67%] h-[33%] bg-[#006B3F]" />
            {/* 3 text overlay */}
            <span className="relative z-10 text-white font-black text-8xl md:text-9xl drop-shadow-2xl">
              3
            </span>
          </div>

          {/* N in gold */}
          <span className="text-8xl md:text-9xl font-black" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', color: '#FCD116' }}>
            N
          </span>
        </div>

        {/* Decorative Ghana-colored lines */}
        <div className="mt-2 flex gap-1">
          <div className="h-1 w-12 bg-[#CE1126] rounded-full"></div>
          <div className="h-1 w-12 bg-[#FCD116] rounded-full"></div>
          <div className="h-1 w-12 bg-[#006B3F] rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );
}