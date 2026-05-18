import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RideChatModal({ isOpen, onClose, rideId, currentUserId, currentUserRole, currentUserName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !rideId) return;

    const load = async () => {
      const msgs = await base44.entities.RideMessage.filter({ ride_id: rideId }, "created_date", 100);
      setMessages(msgs);
    };
    load();

    const unsubscribe = base44.entities.RideMessage.subscribe((event) => {
      if (event.data?.ride_id !== rideId) return;
      if (event.type === "create") setMessages(prev => [...prev, event.data]);
    });

    return () => unsubscribe();
  }, [isOpen, rideId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await base44.entities.RideMessage.create({
      ride_id: rideId,
      sender_id: currentUserId,
      sender_role: currentUserRole,
      sender_name: currentUserName || currentUserRole,
      message: text.trim()
    });
    setText("");
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-3xl flex flex-col"
          style={{ maxHeight: "75vh" }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <h3 className="font-heading font-bold text-base">Ride Chat</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm pt-8">
                No messages yet. Say hi! 👋
              </p>
            )}
            {messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"}`}>
                    {!isMine && (
                      <p className="text-[10px] font-semibold mb-1 opacity-70 capitalize">{msg.sender_name || msg.sender_role}</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border flex-shrink-0" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              className="flex-1 bg-secondary border-border"
            />
            <Button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              size="icon"
              className="bg-primary hover:bg-primary/90 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}