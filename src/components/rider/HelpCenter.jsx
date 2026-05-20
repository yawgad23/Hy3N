import { useState } from "react";
import { HelpCircle, Phone, MessageCircle, FileText, ChevronRight, Shield, CreditCard, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I book a ride?",
    answer: "Enter your destination in the search bar on the home screen, select your ride type, choose payment method, and tap 'Book Now'."
  },
  {
    question: "How do I cancel a ride?",
    answer: "Go to your active trip, scroll down and tap 'Cancel Ride'. Free cancellation is available within 2 minutes of booking."
  },
  {
    question: "How does surge pricing work?",
    answer: "During high demand, prices increase to connect you with more drivers. You'll see the multiplier before booking."
  },
  {
    question: "How do I add a saved place?",
    answer: "Go to Account > Saved Places, tap 'Add Place', enter the name and address. You can save Home, Work, or any frequent location."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept Mobile Money (MTN, Vodafone Cash), cash, card payments, and HY3N wallet balance."
  },
  {
    question: "How do I contact my driver?",
    answer: "Once matched, tap the phone or message icon in the trip tracker to call or chat with your driver."
  },
  {
    question: "What if I left something in a ride?",
    answer: "Go to the trip in Activity, tap 'Report Issue', select 'Lost Item'. We'll contact the driver to help recover it."
  },
  {
    question: "How do loyalty points work?",
    answer: "Earn 1 point per GH₵1 spent. Bronze (0-499), Silver (500-1999), Gold (2000-4999), Platinum (5000+). Redeem for ride discounts!"
  }
];

const supportOptions = [
  {
    icon: Phone,
    title: "Emergency",
    description: "24/7 safety support",
    color: "text-destructive",
    action: "tel:+233244000000"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with support",
    color: "text-primary",
    action: "/support"
  },
  {
    icon: FileText,
    title: "Report Issue",
    description: "Submit a complaint",
    color: "text-ghana-green",
    action: "/support"
  },
  {
    icon: Shield,
    title: "Safety",
    description: "Safety tools & tips",
    color: "text-ghana-gold",
    action: "/support"
  }
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-secondary border border-border rounded-xl py-3 px-4 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {/* Quick Support */}
      <div>
        <h3 className="font-heading font-bold text-lg mb-3">Get Help</h3>
        <div className="grid grid-cols-2 gap-3">
          {supportOptions.map((option, idx) => {
            const Icon = option.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(option.action)}
                className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full bg-secondary flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <span className="text-xs font-semibold text-center">{option.title}</span>
                <span className="text-[10px] text-muted-foreground text-center">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h3 className="font-heading font-bold text-lg mb-3">Frequently Asked Questions</h3>
        <Accordion type="single" collapsible className="space-y-2">
          {filteredFaqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="bg-card border border-border rounded-xl px-4">
              <AccordionTrigger className="text-sm font-semibold py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}