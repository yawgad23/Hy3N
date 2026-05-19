import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MapPin, Clock, ChevronDown, Check, CheckCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { showNotification } from "@/lib/notificationService";

const QUICK_REPLIES = [
  { icon: MapPin, text: "I'm at the pickup point" },
  { icon: Clock, text: "I'll be there in 2 minutes" },
  { icon: MapPin, text: "I'm waiting outside the gate" },
  { icon: Clock, text: "Almost there, 1 min away" },
  { icon: MapPin, text: "Can you move forward a bit?" },
  { icon: Clock, text: "On my way, 5 mins" },
];

function ChatBubble({ msg, isMine, currentRole }) {
  const time = msg.created_date
    ? format(new Date(msg.created_date), "h:mm a")
    : "";

  // Check read status
  const isRead = currentRole === 'rider' ? msg.read_by_driver : msg.read_by_rider;
  const readTime = currentRole === 'rider' ? msg.read_at_driver : msg.read_at_rider;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
      <div className={`max-w-[78%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        {!isMine && (
          <span className="text-[10px] font-semibold text-muted-foreground capitalize px-1 mb-1">
            {msg.sender_name || msg.sender_role}
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isMine
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-secondary text-foreground rounded-bl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed">{msg.message}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {isMine && (
            <span className="text-[10px] flex items-center gap-0.5">
              {isRead ? (
                <>
                  <CheckCheck className="w-3 h-3 text-primary" />
                  <span className="text-primary font-medium">Read</span>
                </>
              ) : (
                <Check className="w-3 h-3 text-muted-foreground" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RideChatModal({ isOpen, onClose, rideId, currentUserId, currentUserRole, currentUserName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [lastReadIndex, setLastReadIndex] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !rideId) return;
    setMessages([]);
    setShowQuickReplies(true);
    setLastReadIndex(-1);

    const load = async () => {
      const msgs = await base44.entities.RideMessage.filter({ ride_id: rideId }, "created_date", 100);
      setMessages(msgs);
    };
    load();

    const unsubscribe = base44.entities.RideMessage.subscribe((event) => {
      if (event.data?.ride_id !== rideId) return;
      if (event.type === "create") {
        const newMsg = event.data;
        setMessages(prev => {
          if (newMsg.sender_id !== currentUserId) {
            showNotification(
              `New message from ${newMsg.sender_name || (currentUserRole === 'rider' ? 'Driver' : 'Rider')}`,
              newMsg.message,
              "info"
            );
          }
          return [...prev, newMsg];
        });
      } else if (event.type === "update") {
        // Live read-receipt update — refresh the affected message
        setMessages(prev => prev.map(m => m.id === event.id ? { ...m, ...event.data } : m));
      }
    });

    return () => unsubscribe();
  }, [isOpen, rideId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Mark messages as read when viewing
    if (messages.length > 0 && lastReadIndex !== messages.length - 1) {
      const now = new Date().toISOString();
      const updateField = currentUserRole === 'rider' ? 'read_by_rider' : 'read_by_driver';
      const timeField = currentUserRole === 'rider' ? 'read_at_rider' : 'read_at_driver';
      
      // Mark all unread messages from other party as read
      messages.forEach((msg) => {
        if (msg.sender_id !== currentUserId && !msg[updateField]) {
          base44.entities.RideMessage.update(msg.id, {
            [updateField]: true,
            [timeField]: now
          });
        }
      });
      setLastReadIndex(messages.length - 1);
    }
  }, [messages, currentUserRole, currentUserId, lastReadIndex]);

  const sendMessage = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || sending) return;
    setSending(true);
    await base44.entities.RideMessage.create({
      ride_id: rideId,
      sender_id: currentUserId,
      sender_role: currentUserRole,
      sender_name: currentUserName || currentUserRole,
      message: trimmed
    });
    setText("");
    setSending(false);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  const handleSend = () => sendMessage(text);
  const handleKey = (e) => { if (e.key === "Enter") handleSend(); };
  const handleQuickReply = (qText) => sendMessage(qText);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-3xl flex flex-col"
            style={{ maxHeight: "80vh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <div>
                <h3 className="font-heading font-bold text-base">Ride Chat</h3>
                <p className="text-[11px] text-muted-foreground">Coordinate safely without sharing numbers</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="text-center pt-6 pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-heading font-semibold text-sm">Start coordinating</p>
                  <p className="text-muted-foreground text-xs mt-1">Use quick replies or type a message</p>
                </div>
              )}
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  isMine={msg.sender_id === currentUserId}
                  currentRole={currentUserRole}
                />
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick Replies */}
            <AnimatePresence>
              {showQuickReplies && (
                <motion.div
                  className="flex-shrink-0 border-t border-border"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between px-4 pt-2 pb-1">
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Quick Replies</span>
                    <button onClick={() => setShowQuickReplies(false)}>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
                    {QUICK_REPLIES.map((qr, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickReply(qr.text)}
                        className="flex-shrink-0 flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium px-3 py-2 rounded-xl border border-border transition-colors"
                      >
                        <qr.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {qr.text}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-t border-border flex-shrink-0"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
              {!showQuickReplies && (
                <button
                  onClick={() => setShowQuickReplies(true)}
                  className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground rotate-180" />
                </button>
              )}
              <Input
                ref={inputRef}
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
        </>
      )}
    </AnimatePresence>
  );
}