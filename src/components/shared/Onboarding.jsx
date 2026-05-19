import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, CreditCard, Shield, Check, ChevronRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";

const slides = [
  {
    icon: MapPin,
    title: "Book a Ride Anywhere",
    description: "Enter your destination and get matched with nearby drivers instantly",
    color: "text-ghana-green"
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    description: "Track your driver's location and get accurate ETAs",
    color: "text-primary"
  },
  {
    icon: CreditCard,
    title: "Multiple Payment Options",
    description: "Pay with Mobile Money, Card, Cash, or Wallet",
    color: "text-ghana-gold"
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "SOS emergency button and verified drivers for your safety",
    color: "text-ghana-red"
  },
  {
    icon: Smartphone,
    title: "Split Fare",
    description: "Share rides and split costs with friends",
    color: "text-primary"
  }
];

export default function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (hasSeenOnboarding) {
      onComplete();
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-background z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="pt-safe px-6 pb-4 flex items-center justify-between">
        <Logo size="sm" />
        <button
        onClick={handleSkip}
        className="text-sm text-muted-foreground hover:text-foreground"
        aria-label="Skip onboarding"
        >
        Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center"
        >
          <div className={`w-32 h-32 rounded-3xl bg-secondary flex items-center justify-center mb-8`}>
            {(() => {
              const Icon = slides[currentSlide].icon;
              return <Icon className={`w-16 h-16 ${slides[currentSlide].color}`} />;
            })()}
          </div>
          
          <h2 className="font-heading font-bold text-2xl mb-4">
            {slides[currentSlide].title}
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="pb-safe px-6 py-8">
        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-border"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === currentSlide ? 'step' : undefined}
            />
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleNext}
          className="w-full h-14 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold text-lg rounded-xl"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
          {currentSlide === slides.length - 1 ? (
            <Check className="w-5 h-5 ml-2" />
          ) : (
            <ChevronRight className="w-5 h-5 ml-2" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}