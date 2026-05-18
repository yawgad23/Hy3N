import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import DriverHome from "./DriverHome";
import DriverSetup from "./DriverSetup";

export default function DriverGateway() {
  const [hasProfile, setHasProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const user = await base44.auth.me();
      if (user) {
        const profiles = await base44.entities.DriverProfile.filter({ user_id: user.id });
        setHasProfile(profiles.length > 0);
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    }
    check();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasProfile) return <DriverSetup />;
  return <DriverHome />;
}