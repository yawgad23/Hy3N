import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_TAGS = {
  rider: ["Friendly", "Ready on time", "Good communication", "Clean entry"],
  driver: ["Great driver", "Smooth ride", "On time", "Clean car", "Professional"]
};

export default function RatingModal({ isOpen, onClose, onSubmit, raterRole, targetName }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const tags = QUICK_TAGS[raterRole === "rider" ? "driver" : "rider"];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    const fullFeedback = [feedback, ...selectedTags].filter(Boolean).join(" · ");
    await onSubmit({ rating, feedback: fullFeedback });
    setSubmitting(false);
    // reset
    setRating(0);
    setHovered(0);
    setFeedback("");
    setSelectedTags([]);
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

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
            className="fixed inset-x-0 bottom-0 bg-card border-t border-border rounded-t-3xl z-50 pb-safe"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
          >
            <div className="p-5">
              {/* Handle */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-heading font-bold text-lg">Rate your {raterRole === "rider" ? "driver" : "rider"}</h3>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">How was your experience with {targetName || "them"}?</p>

              {/* Stars */}
              <div className="flex justify-center gap-3 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hovered || rating)
                          ? "text-primary fill-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {(hovered || rating) > 0 && (
                <p className="text-center text-sm font-medium text-primary mb-5">
                  {ratingLabels[hovered || rating]}
                </p>
              )}

              {/* Quick tags */}
              {rating > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">What went well?</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedTags.includes(tag)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary text-muted-foreground"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional text */}
              {rating > 0 && (
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add a comment (optional)..."
                  rows={2}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary mb-4 placeholder:text-muted-foreground"
                />
              )}

              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="w-full h-12 bg-ghana-green hover:bg-ghana-green/90 text-white font-heading font-semibold text-base rounded-xl"
              >
                {submitting ? "Submitting..." : "Submit Rating"}
              </Button>

              <button onClick={onClose} className="w-full text-center text-sm text-muted-foreground mt-3 py-2">
                Skip for now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}