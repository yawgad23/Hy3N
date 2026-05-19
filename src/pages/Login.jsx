import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Fingerprint } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");

  // Check if biometric auth is available and if user has saved credentials
  useEffect(() => {
    // Check for WebAuthn support
    if (window.PublicKeyCredential) {
      setBiometricAvailable(true);
      // Check for saved email
      const saved = localStorage.getItem("biometricEmail");
      if (saved) setSavedEmail(saved);
    }
  }, []);

  const handleBiometricLogin = async () => {
  setError("");
  setLoading(true);
  try {
  // Get challenge from backend
  const challengeRes = await base44.functions.invoke("getLoginChallenge", { email: savedEmail });
  const challenge = challengeRes.data.challenge;

  // Request biometric authentication
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: new Uint8Array(challenge),
      rpId: window.location.hostname,
      allowCredentials: [],
      userVerification: "required"
    }
  });

  // Verify with backend
  const verifyRes = await base44.functions.invoke("verifyBiometricLogin", {
    email: savedEmail,
    credential: Array.from(new Uint8Array(assertion.response.signature))
  });

  if (verifyRes.data.success) {
    await base44.auth.loginViaEmailPassword(savedEmail, verifyRes.data.tempPassword);
    localStorage.setItem("rememberMe", "true");
    window.location.href = "/";
  } else {
    setError("Biometric verification failed");
  }
  } catch (err) {
  console.error("Biometric login error:", err);
  setError(err.message || "Biometric login failed");
  } finally {
  setLoading(false);
  }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      // Save email for future biometric login and remember me
      if (window.PublicKeyCredential) {
        localStorage.setItem("biometricEmail", email);
      }
      // Token is automatically saved by the SDK
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
  // Mark session as persistent before redirect
  localStorage.setItem("rememberMe", "true");
  base44.auth.loginWithProvider("google", "/");
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-4"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      {biometricAvailable && savedEmail && (
        <Button
          variant="outline"
          className="w-full h-12 text-sm font-medium mb-4 border-primary/40"
          onClick={handleBiometricLogin}
          disabled={loading}
        >
          <Fingerprint className="w-5 h-5 mr-2 text-primary" />
          Use Biometric Login
        </Button>
      )}

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">Remember me</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>

        {biometricAvailable && !savedEmail && (
          <p className="text-xs text-center text-muted-foreground mt-4">
            Log in with email to enable biometric authentication
          </p>
        )}
      </form>
    </AuthLayout>
  );
}