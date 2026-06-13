import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, Gift, Phone, Smartphone } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [refereeId, setRefereeId] = useState(null);
  const [authMethod, setAuthMethod] = useState("email"); // "email" or "phone"
  const [sentPhone, setSentPhone] = useState("");
  const [showPhoneRegister, setShowPhoneRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setAuthMethod("email");
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      
      // Save referee ID for referral tracking
      const me = await base44.auth.me();
      if (me) {
        setRefereeId(me.id);
        
        // If invite code was provided, create referral record
        if (inviteCode.trim()) {
          try {
            // Find the referrer by invite code
            const referrals = await base44.asServiceRole.entities.Referral.filter({});
            const matchingReferral = referrals.find(r => r.invite_code === inviteCode.trim().toUpperCase());
            
            if (matchingReferral) {
              await base44.entities.Referral.create({
                referrer_id: matchingReferral.referrer_id,
                referrer_role: matchingReferral.referrer_role,
                referee_id: me.id,
                referee_email: email,
                invite_code: inviteCode.trim().toUpperCase(),
                status: "pending"
              });
              toast({
                title: "Referral applied!",
                description: "You'll get GH₵10 bonus after your first trip.",
              });
            } else {
              toast({
                title: "Invalid code",
                description: "The invite code was not found.",
                variant: "destructive",
              });
            }
          } catch (refErr) {
            console.error("Referral error:", refErr);
          }
        }
      }
      
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  const handleSendPhoneOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const result = await base44.functions.invoke("sendPhoneLoginOtp", { phone: formattedPhone });
      setSentPhone(formattedPhone);
      setAuthMethod("phone");
      setShowOtp(true);
      
      // Production mode - OTP sent via SMS
      toast({
        title: "Code sent",
        description: "Check your phone for the verification code.",
      });
    } catch (err) {
      setError(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.functions.invoke("verifyPhoneLoginOtp", {
        phone: sentPhone,
        otpCode
      });
      if (result.data?.success) {
        if (result.data?.email) {
          await base44.auth.loginViaEmailPassword(result.data.email, result.data.tempPassword);
          localStorage.setItem("rememberMe", "true");
          window.location.href = "/";
        }
      } else {
        setError("Invalid code");
      }
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    setError("");
    try {
      await base44.functions.invoke("sendPhoneLoginOtp", { phone: sentPhone });
      toast({
        title: "Code sent",
        description: "Check your phone for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  if (showOtp && authMethod === "email") {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  if (showOtp && authMethod === "phone") {
    return (
      <AuthLayout
        icon={Smartphone}
        title="Verify your phone"
        subtitle={`We sent a code to ${sentPhone}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={(value) => {
              console.log("OTP entered:", value);
              setOtpCode(value);
            }}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerifyPhoneOtp}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResendPhoneOtp} className="text-primary font-medium hover:underline">
            Resend
          </button>
        </p>
        <button
          onClick={() => { setShowOtp(false); setShowPhoneRegister(true); }}
          className="w-full text-sm text-muted-foreground mt-4 hover:text-foreground"
        >
          ← Back to registration
        </button>
      </AuthLayout>
    );
  }

  if (showPhoneRegister) {
    return (
      <AuthLayout
        icon={Phone}
        title="Sign up with phone"
        subtitle="Enter your phone number"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="phone"
                type="tel"
                autoFocus
                placeholder="+233 24 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))}
                className="pl-10 h-12"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll send you a verification code
            </p>
          </div>
          <Button
            className="w-full h-12 font-medium"
            onClick={handleSendPhoneOtp}
            disabled={loading || phone.length < 10}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending code...
              </>
            ) : (
              "Send Code"
            )}
          </Button>
          <button
            onClick={() => setShowPhoneRegister(false)}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to email sign up
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
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

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={() => { setAuthMethod("phone"); setShowPhoneRegister(true); }}
      >
        <Phone className="w-5 h-5 mr-2 text-primary" />
        Sign up with Phone
      </Button>

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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite">Invite Code (optional)</Label>
          <div className="relative">
            <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="invite"
              type="text"
              placeholder="HY3N-XXXX-XXXXXX"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="pl-10 h-12"
              autoComplete="off"
            />
          </div>
          <p className="text-xs text-muted-foreground">Get GH₵10 bonus on your first trip</p>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account with email"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}