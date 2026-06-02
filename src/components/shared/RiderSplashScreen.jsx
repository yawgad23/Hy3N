import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LOGO_URL } from "@/lib/constants";

export default function RiderSplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    // Start fade-out after 2.5s, then complete after animation
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const completeTimer = setTimeout(() => {
      setShow(false);
      if (onCompleteRef.current) onCompleteRef.current();
    }, 3100);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Subtle radial glow behind logo */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <div className="w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)]" />
          </motion.div>

          {/* New Professional Logo - Centered and clean */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 1, 
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <div className="w-64 h-64 flex items-center justify-center">
              <img
                src={LOGO_URL}
                alt="HY3N"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

          {/* Bottom loading indicator - Uber/Bolt style thin line */}
          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            <div className="w-16 h-0.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#FCD116] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.1, duration: 1.4, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
