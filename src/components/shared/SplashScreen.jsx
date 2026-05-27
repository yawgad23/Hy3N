import { motion } from "framer-motion";
import Logo from "./Logo";
import React, { useState } from "react";

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Logo size="xl" />
      </motion.div>

      <motion.div
        className="mt-8 text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
          Akwaaba to HY3N
        </h1>
        <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">
          Ride Ghana Forward
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </motion.div>


    </motion.div>
  );
}