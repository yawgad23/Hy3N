import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Upload, Camera, Car, FileText, Shield, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/shared/Logo";

const STEPS = ["profile", "vehicle", "documents"];

const DOCUMENTS = [
  { key: "ghana_card_url", label: "Ghana Card", icon: FileText },
  { key: "drivers_license_url", label: "Driver's License", icon: FileText },
  { key: "vehicle_registration_url", label: "Vehicle Registration", icon: Car },
  { key: "insurance_url", label: "Insurance", icon: Shield },
  { key: "roadworthy_url", label: "Roadworthy Certificate", icon: CheckCircle2 }
];

export default function DriverSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    vehicle_color: "",
    license_plate: "",
    ghana_card_url: "",
    drivers_license_url: "",
    vehicle_registration_url: "",
    insurance_url: "",
    roadworthy_url: ""
  });

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      if (me) {
        setForm(prev => ({
          ...prev,
          full_name: me.full_name || "",
          email: me.email || ""
        }));
        // Check if driver profile exists
        const profiles = await base44.entities.DriverProfile.filter({ user_id: me.id });
        if (profiles.length > 0) {
          navigate("/driver");
        }
      }
    }
    load();
  }, [navigate]);

  const handleFileUpload = async (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, [key]: file_url }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    await base44.entities.DriverProfile.create({
      ...form,
      user_id: user.id,
      approval_status: "pending"
    });
    setLoading(false);
    navigate("/driver");
  };

  const canProceed = () => {
    if (step === 0) return form.full_name && form.phone;
    if (step === 1) return form.vehicle_make && form.license_plate;
    if (step === 2) return form.ghana_card_url && form.drivers_license_url;
    return false;
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="flex justify-center mb-8">
        <Logo size="md" />
      </div>

      <h1 className="font-heading font-bold text-2xl text-center">Driver Setup</h1>
      <p className="text-muted-foreground text-sm text-center mt-1">
        Step {step + 1} of 3 — {STEPS[step].charAt(0).toUpperCase() + STEPS[step].slice(1)}
      </p>

      {/* Progress */}
      <div className="flex gap-2 mt-6 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full ${
              i <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Step: Profile */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="bg-card border-border mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Phone Number</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+233..."
              className="bg-card border-border mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-card border-border mt-1"
            />
          </div>
        </div>
      )}

      {/* Step: Vehicle */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Make</Label>
              <Input
                value={form.vehicle_make}
                onChange={(e) => setForm({ ...form, vehicle_make: e.target.value })}
                placeholder="Toyota"
                className="bg-card border-border mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Model</Label>
              <Input
                value={form.vehicle_model}
                onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })}
                placeholder="Corolla"
                className="bg-card border-border mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Year</Label>
              <Input
                value={form.vehicle_year}
                onChange={(e) => setForm({ ...form, vehicle_year: e.target.value })}
                placeholder="2020"
                className="bg-card border-border mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Color</Label>
              <Input
                value={form.vehicle_color}
                onChange={(e) => setForm({ ...form, vehicle_color: e.target.value })}
                placeholder="Black"
                className="bg-card border-border mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">License Plate</Label>
            <Input
              value={form.license_plate}
              onChange={(e) => setForm({ ...form, license_plate: e.target.value })}
              placeholder="GR-0000-00"
              className="bg-card border-border mt-1"
            />
          </div>
        </div>
      )}

      {/* Step: Documents */}
      {step === 2 && (
        <div className="space-y-3">
          {DOCUMENTS.map((doc) => (
            <div key={doc.key} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <doc.icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{doc.label}</p>
                  {form[doc.key] ? (
                    <p className="text-xs text-ghana-green mt-0.5">Uploaded ✓</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">Required</p>
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(doc.key, e)}
                  />
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    form[doc.key]
                      ? "bg-ghana-green/20 text-ghana-green"
                      : "bg-secondary text-foreground"
                  }`}>
                    {form[doc.key] ? "Replace" : "Upload"}
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button onClick={() => setStep(step - 1)} variant="outline" className="flex-1">
            Back
          </Button>
        )}
        {step < 2 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex-1 bg-ghana-green hover:bg-ghana-green/90 text-white"
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? "Submitting..." : "Submit for Approval"}
          </Button>
        )}
      </div>
    </div>
  );
}