import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LOGO_URL } from "@/lib/constants";

export default function RiderSplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    // Start fade-out after 2.2s, then complete after animation
    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    const completeTimer = setTimeout(() => {
      setShow(false);
      if (onCompleteRef.current) onCompleteRef.current();
    }, 2800);
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
            <div className="w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)]" />
          </motion.div>

          {/* Logo - Bolt/Uber style: centered, clean, animated */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.16, 1, 0.3, 1] // Spring-like ease
            }}
          >
            {/* Main Logo Image */}
            <motion.img
              src={LOGO_URL}
              alt="HY3N"
              className="w-48 h-48 object-contain drop-shadow-2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            />
          </motion.div>

          {/* Bottom loading indicator - Uber/Bolt style thin line */}
          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <div className="w-12 h-0.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#D4AF37] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.9, duration: 1.2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
