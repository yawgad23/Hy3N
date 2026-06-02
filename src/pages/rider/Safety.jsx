import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Phone, MapPin, Share2, AlertTriangle, CheckCircle2, UserCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Safety() {
  const navigate = useNavigate();

  const safetyFeatures = [
    {
      icon: Share2,
      title: "Share Trip Status",
      desc: "Let friends or family track your ride in real-time.",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      icon: Phone,
      title: "Emergency Assistance",
      desc: "Call local emergency services directly from the app.",
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      icon: UserCheck,
      title: "Verified Drivers",
      desc: "Every driver is background checked and verified.",
      color: "text-ghana-green",
      bg: "bg-ghana-green/10"
    },
    {
      icon: MessageSquare,
      title: "24/7 Support",
      desc: "Our support team is always here to help you.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading font-bold text-xl flex-1">Safety Center</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-bold">Your safety is our priority</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            We've built tools and features to help keep you safe before, during, and after every trip.
          </p>
        </div>

        {/* Emergency Button */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-red-500">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">In case of an emergency, contact the local authorities immediately.</p>
          <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl gap-2">
            <Phone className="w-4 h-4" /> Call Emergency Services
          </Button>
        </div>

        {/* Safety Features Grid */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg">Safety Features</h3>
          <div className="grid grid-cols-1 gap-4">
            {safetyFeatures.map((feature, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${feature.bg}`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Commitment */}
        <div className="bg-secondary rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-ghana-green" />
            <h3 className="font-heading font-bold">Our Commitment</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            At HY3N, we are committed to providing a safe environment for both riders and drivers. 
            All our partners follow strict safety protocols, and we continuously monitor trip 
            data to ensure a professional experience.
          </p>
        </div>
      </div>
    </div>
  );
}
