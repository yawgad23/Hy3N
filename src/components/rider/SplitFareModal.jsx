import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Users, Smartphone, Banknote, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS } from "@/lib/constants";

const paymentIcons = { Smartphone, Banknote, CreditCard };

export default function SplitFareModal({ isOpen, onClose, totalFare, onConfirm }) {
  const [participants, setParticipants] = useState([
    { name: "", phone: "", payment: "mobile_money" }
  ]);

  const addParticipant = () => {
    setParticipants([...participants, { name: "", phone: "", payment: "mobile_money" }]);
  };

  const removeParticipant = (idx) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };

  const updateParticipant = (idx, field, value) => {
    setParticipants(participants.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  // +1 for the booking rider themselves
  const totalPeople = participants.length + 1;
  const perPersonFare = (totalFare / totalPeople).toFixed(2);

  const handleConfirm = () => {
    onConfirm({ participants, perPersonFare: parseFloat(perPersonFare), totalPeople });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 bg-card border-t border-border rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-lg">Split Fare</h3>
                </div>
                <button onClick={onClose}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl mb-5">
                <div>
                  <p className="text-xs text-muted-foreground">Total fare</p>
                  <p className="font-heading font-bold text-primary">GH₵{totalFare.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{totalPeople} people</p>
                  <p className="text-xs text-muted-foreground">sharing</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Each pays</p>
                  <p className="font-heading font-bold text-ghana-green">GH₵{perPersonFare}</p>
                </div>
              </div>

              {/* You (organiser) */}
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Friends to invite</p>

              <div className="space-y-3 mb-4">
                {participants.map((p, idx) => (
                  <div key={idx} className="p-3 bg-secondary rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Person {idx + 2}</span>
                      {participants.length > 1 && (
                        <button onClick={() => removeParticipant(idx)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Name (optional)"
                      value={p.name}
                      onChange={(e) => updateParticipant(idx, "name", e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={p.phone}
                      onChange={(e) => updateParticipant(idx, "phone", e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                      {PAYMENT_METHODS.map((pm) => {
                        const Icon = paymentIcons[pm.icon];
                        return (
                          <button
                            key={pm.id}
                            onClick={() => updateParticipant(idx, "payment", pm.id)}
                            className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-lg border transition-all text-xs ${
                              p.payment === pm.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{pm.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addParticipant}
                className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors mb-5"
              >
                <Plus className="w-4 h-4" />
                Add another person
              </button>

              <Button
                onClick={handleConfirm}
                className="w-full h-12 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-bold rounded-xl"
              >
                Confirm Split — GH₵{perPersonFare} each
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}