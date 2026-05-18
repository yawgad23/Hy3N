import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Logo size="md" />
      <h1 className="font-heading font-bold text-6xl text-primary mt-8">404</h1>
      <p className="text-muted-foreground mt-2">Page not found</p>
      <Link to="/">
        <Button className="mt-6 bg-ghana-green hover:bg-ghana-green/90 text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}