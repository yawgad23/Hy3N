import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const REPORT_TYPES = [
  { value: "driver_behavior", label: "Driver Behavior" },
  { value: "lost_item", label: "Lost & Found" },
  { value: "cheating", label: "Cheating / Overcharging" },
  { value: "other", label: "Other Issue" }
];

const BEHAVIOR_CATEGORIES = [
  { value: "rude_behavior", label: "Rude or Unprofessional Behavior" },
  { value: "unsafe_driving", label: "Unsafe Driving" },
  { value: "wrong_route", label: "Took Wrong Route" },
  { value: "harassment", label: "Harassment" },
  { value: "discrimination", label: "Discrimination" },
  { value: "vehicle_condition", label: "Poor Vehicle Condition" },
  { value: "other", label: "Other" }
];

const LOST_ITEM_CATEGORIES = [
  { value: "lost_phone", label: "Phone" },
  { value: "lost_wallet", label: "Wallet / Money" },
  { value: "lost_bag", label: "Bag / Backpack" },
  { value: "lost_other", label: "Other Item" }
];

const CHEATING_CATEGORIES = [
  { value: "overcharging", label: "Overcharging / Wrong Fare" },
  { value: "wrong_route", label: "Intentionally Took Longer Route" }
];

const SEVERITY_LEVELS = [
  { value: "low", label: "Low - Minor Issue" },
  { value: "medium", label: "Medium - Concerning" },
  { value: "high", label: "High - Serious" },
  { value: "critical", label: "Critical - Urgent Attention Needed" }
];

export default function RideReportModal({ ride, isOpen, onClose }) {
  const [reportType, setReportType] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const getCategories = () => {
    switch (reportType) {
      case "driver_behavior":
        return BEHAVIOR_CATEGORIES;
      case "lost_item":
        return LOST_ITEM_CATEGORIES;
      case "cheating":
        return CHEATING_CATEGORIES;
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    if (!reportType || !category || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await base44.functions.invoke("submitRideReport", {
        ride_id: ride.id,
        report_type: reportType,
        category: category,
        description: description.trim(),
        severity
      });

      toast({
        title: "Report submitted",
        description: "Our team will review your report shortly.",
      });

      onClose();
      // Reset form
      setReportType("");
      setCategory("");
      setDescription("");
      setSeverity("medium");
    } catch (err) {
      console.error("Report submission error:", err);
      toast({
        title: "Submission failed",
        description: err.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setReportType("");
    setCategory("");
    setDescription("");
    setSeverity("medium");
  };

  return (
    <AnimatePresence>
      {isOpen && ride && (
        <Sheet open={isOpen} onOpenChange={handleClose}>
          <SheetContent className="bg-card border-border flex flex-col max-h-[90vh]">
            <SheetHeader className="border-b border-border pb-4">
              <SheetTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-ghana-red" />
                Report an Issue
              </SheetTitle>
              <SheetDescription>
                Trip: {ride.pickup_address?.slice(0, 30)}... → {ride.destination_address?.slice(0, 30)}...
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">What type of issue?</Label>
                <Select value={reportType} onValueChange={(v) => { setReportType(v); setCategory(""); }}>
                  <SelectTrigger className="bg-secondary border-none">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reportType && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-secondary border-none">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategories().map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

              {category && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger className="bg-secondary border-none">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

              {category && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide details about what happened..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-secondary border-none min-h-[120px]"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your report will be reviewed by our support team. All reports are confidential.
                  </p>
                </motion.div>
              )}

              {reportType === "lost_item" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-primary/10 border border-primary/30 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5" />
                    <p className="text-xs text-primary">
                      For lost items, we'll contact the driver and coordinate retrieval. Please include contact details in your description if different from your profile.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <SheetFooter className="border-t border-border pt-4 gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reportType || !category || !description.trim() || loading}
                className="flex-1 bg-ghana-red hover:bg-ghana-red/90"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </AnimatePresence>
  );
}