import { motion } from "framer-motion";
import { Clock, MapPin, CreditCard } from "lucide-react";

export default function EmptyState({ type, onAction }) {
  const configs = {
    rides: {
      icon: MapPin,
      title: "No Rides Yet",
      description: "Book your first ride and start exploring",
      action: "Book a Ride",
      color: "text-primary"
    },
    scheduled: {
      icon: Clock,
      title: "No Scheduled Rides",
      description: "Plan ahead by scheduling your next trip",
      action: "Schedule Ride",
      color: "text-ghana-green"
    },
    payments: {
      icon: CreditCard,
      title: "No Transactions",
      description: "Top up your wallet to start using cashless payments",
      action: "Top Up",
      color: "text-ghana-gold"
    }
  };

  const config = configs[type] || configs.rides;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
      role="img"
      aria-label={config.title}
    >
      <div className={`w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-6`}>
        <Icon className={`w-12 h-12 ${config.color}`} />
      </div>
      <h3 className="font-heading font-bold text-xl mb-2">{config.title}</h3>
      <p className="text-muted-foreground mb-6 max-w-xs">{config.description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
        >
          {config.action}
        </button>
      )}
    </motion.div>
  );
}