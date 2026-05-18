import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, User, ArrowRight } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { motion } from "framer-motion";

export default function RoleSelect() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole) {
      navigate(selectedRole === "rider" ? "/rider" : "/driver");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-center">
        <Logo size="md" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-heading font-bold text-foreground mb-3">
            Welcome to HY3N
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose how you want to use HY3N
          </p>
        </motion.div>

        <div className="w-full max-w-sm space-y-4">
          {/* Rider Option */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setSelectedRole("rider")}
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 ${
              selectedRole === "rider"
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                selectedRole === "rider" ? "bg-primary" : "bg-secondary"
              }`}>
                <User className={`w-7 h-7 ${
                  selectedRole === "rider" ? "text-primary-foreground" : "text-muted-foreground"
                }`} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-heading font-semibold text-lg text-foreground">
                  Rider
                </h3>
                <p className="text-sm text-muted-foreground">
                  Book rides & get picked up
                </p>
              </div>
              {selectedRole === "rider" && (
                <ArrowRight className="w-6 h-6 text-primary" />
              )}
            </div>
          </motion.button>

          {/* Driver Option */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setSelectedRole("driver")}
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 ${
              selectedRole === "driver"
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                selectedRole === "driver" ? "bg-primary" : "bg-secondary"
              }`}>
                <Car className={`w-7 h-7 ${
                  selectedRole === "driver" ? "text-primary-foreground" : "text-muted-foreground"
                }`} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-heading font-semibold text-lg text-foreground">
                  Driver
                </h3>
                <p className="text-sm text-muted-foreground">
                  Drive & earn money
                </p>
              </div>
              {selectedRole === "driver" && (
                <ArrowRight className="w-6 h-6 text-primary" />
              )}
            </div>
          </motion.button>
        </div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full max-w-sm mt-8 py-4 bg-primary text-primary-foreground rounded-xl font-heading font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          Continue
        </motion.button>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}