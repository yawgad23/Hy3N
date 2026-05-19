import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  const icons = {
    success: Check,
    error: X,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: "bg-ghana-green",
    error: "bg-destructive",
    warning: "bg-amber-500",
    info: "bg-primary"
  };

  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.9 }}
        animate={{ y: 80, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.9 }}
        className={`fixed top-0 left-4 right-4 z-50 ${colors[type]} text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3`}
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}