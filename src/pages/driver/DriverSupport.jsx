import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/shared/Logo";

export default function DriverSupport() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const user = await base44.auth.me();
      if (user) {
        const data = await base44.entities.SupportTicket.filter(
          { user_id: user.id, user_role: "driver" },
          "-created_date",
          20
        );
        setTickets(data);
      }
    }
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.subject || !form.message) return;
    setSubmitting(true);
    const user = await base44.auth.me();
    await base44.entities.SupportTicket.create({
      user_id: user.id,
      user_role: "driver",
      subject: form.subject,
      message: form.message
    });
    setForm({ subject: "", message: "" });
    setShowForm(false);
    setSubmitting(false);
    const data = await base44.entities.SupportTicket.filter(
      { user_id: user.id, user_role: "driver" },
      "-created_date",
      20
    );
    setTickets(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 pt-6 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/driver-app/profile")}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <Logo size="sm" />
        <h1 className="font-heading font-bold text-xl">Support</h1>
        <div className="flex-1" />
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-ghana-green hover:bg-ghana-green/90 text-white"
        >
          New Ticket
        </Button>
      </div>

      <div className="p-4">
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
            <Input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="bg-secondary border-none"
            />
            <Textarea
              placeholder="Describe your issue..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-secondary border-none min-h-[100px]"
            />
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-ghana-green hover:bg-ghana-green/90 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Sending..." : "Submit"}
            </Button>
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No support tickets</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-heading font-semibold text-sm">{ticket.subject}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    ticket.status === "open" ? "bg-primary/20 text-primary" :
                    ticket.status === "in_progress" ? "bg-ghana-green/20 text-ghana-green" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.message}</p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {format(new Date(ticket.created_date), "MMM d, yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}