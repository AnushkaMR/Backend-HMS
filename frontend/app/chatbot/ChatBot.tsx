"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Stethoscope,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import API_BASE_URL from "@/src/lib/apiConfig";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  options?: string[];
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  image?: string;
  rating?: number;
  availability?: { day: string; times: string[] }[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/doctors`);
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (err) {
        console.error("ChatBot: Failed to fetch doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setPulse(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "👋 Hello! I'm SmartCare Assistant. How can I help you today?",
        [
          "How to book an appointment?",
          "Show me the doctors",
          "What services do you offer?",
          "Contact information",
        ],
      );
    }
  }, [isOpen]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addBotMessage = (text: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(
      () => {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            text,
            sender: "bot",
            timestamp: new Date(),
            options,
          },
        ]);
        setIsTyping(false);
      },
      600 + Math.random() * 400,
    );
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        text: msg,
        sender: "user",
        timestamp: new Date(),
      },
    ]);
    setInput("");

    // Process the message
    processUserMessage(msg.toLowerCase());
  };

  // Smart intent matching - scores each word against intent keywords
  const matchIntent = (msg: string): string => {
    const words = msg.replace(/[?!.,'"]/g, "").split(/\s+/);

    const intents: Record<string, string[][]> = {
      appointment: [
        ["appointment"],
        ["book"],
        ["schedule"],
        ["booking"],
        ["set", "appointment"],
        ["make", "appointment"],
        ["want", "appointment"],
        ["need", "appointment"],
        ["get", "appointment"],
        ["take", "appointment"],
        ["want", "book"],
        ["want", "set"],
        ["how", "book"],
        ["how", "appointment"],
        ["set", "up"],
        ["make", "booking"],
        ["place", "appointment"],
        ["reserve"],
        ["want", "visit"],
        ["need", "visit"],
        ["see", "doctor"],
        ["visit", "doctor"],
        ["meet", "doctor"],
        ["consult"],
        ["want", "consult"],
        ["need", "consult"],
        ["checkup"],
        ["check", "up"],
        ["want", "see"],
        ["can", "book"],
        ["where", "book"],
      ],
      doctor: [
        ["doctor"],
        ["doctors"],
        ["specialist"],
        ["specialists"],
        ["who", "doctor"],
        ["show", "doctor"],
        ["list", "doctor"],
        ["available", "doctor"],
        ["find", "doctor"],
        ["search", "doctor"],
        ["which", "doctor"],
        ["our", "doctor"],
        ["your", "doctor"],
        ["staff"],
        ["medical", "staff"],
        ["physician"],
        ["show", "me"],
        ["tell", "doctor"],
      ],
      doctorDetail: [
        ["tell", "more"],
        ["more", "about"],
        ["detail"],
        ["details"],
        ["info", "doctor"],
        ["information", "doctor"],
        ["know", "more"],
        ["learn", "more"],
      ],
      noSlots: [
        ["no", "time"],
        ["no", "slot"],
        ["not", "available"],
        ["no", "availability"],
        ["empty", "slot"],
        ["cant", "find", "time"],
        ["no", "dates"],
        ["unavailable"],
      ],
      service: [
        ["service"],
        ["services"],
        ["department"],
        ["departments"],
        ["specialty"],
        ["specialties"],
        ["offer"],
        ["treatment"],
        ["treatments"],
        ["facility"],
        ["facilities"],
        ["what", "offer"],
        ["what", "provide"],
        ["what", "have"],
        ["medical", "service"],
      ],
      contact: [
        ["contact"],
        ["phone"],
        ["call"],
        ["email"],
        ["address"],
        ["location"],
        ["where"],
        ["reach"],
        ["number"],
        ["telephone"],
        ["how", "contact"],
        ["how", "reach"],
        ["find", "us"],
      ],
      goBooking: [
        ["go", "booking"],
        ["go", "book"],
        ["booking", "page"],
        ["take", "booking"],
        ["open", "booking"],
        ["navigate", "booking"],
        ["redirect", "booking"],
        ["go", "appointment"],
      ],
      goDoctors: [
        ["go", "doctor"],
        ["doctors", "page"],
        ["open", "doctor"],
        ["navigate", "doctor"],
        ["view", "doctor"],
      ],
      register: [
        ["register"],
        ["sign", "up"],
        ["signup"],
        ["create", "account"],
        ["new", "account"],
        ["login"],
        ["log", "in"],
        ["signin"],
        ["sign", "in"],
        ["how", "login"],
        ["how", "register"],
        ["account"],
        ["password"],
        ["forgot"],
      ],
      greeting: [
        ["hello"],
        ["hi"],
        ["hey"],
        ["main", "menu"],
        ["menu"],
        ["start"],
        ["home"],
        ["help"],
        ["back", "main"],
        ["good", "morning"],
        ["good", "evening"],
        ["good", "afternoon"],
        ["howdy"],
        ["sup"],
      ],
      thanks: [
        ["thank"],
        ["thanks"],
        ["bye"],
        ["goodbye"],
        ["see", "you"],
        ["take", "care"],
        ["nice"],
        ["great"],
        ["awesome"],
        ["perfect"],
        ["ok", "thanks"],
        ["okay", "thanks"],
        ["thx"],
      ],
      cost: [
        ["cost"],
        ["price"],
        ["fee"],
        ["charge"],
        ["how", "much"],
        ["payment"],
        ["pay"],
        ["insurance"],
        ["expensive"],
        ["cheap"],
        ["afford"],
      ],
      hours: [
        ["hours"],
        ["open"],
        ["close"],
        ["timing"],
        ["when", "open"],
        ["working", "hours"],
        ["opening"],
        ["closing"],
      ],
      emergency: [
        ["emergency"],
        ["urgent"],
        ["ambulance"],
        ["critical"],
        ["serious"],
        ["accident"],
        ["immediately"],
      ],
    };

    let bestIntent = "fallback";
    let bestScore = 0;

    for (const [intent, keywordGroups] of Object.entries(intents)) {
      let intentScore = 0;

      for (const group of keywordGroups) {
        const matchCount = group.filter((keyword) =>
          words.some(
            (word) => word.includes(keyword) || keyword.includes(word),
          ),
        ).length;

        if (matchCount === group.length) {
          // Full group match - stronger signal for multi-word groups
          intentScore += group.length * 2;
        } else if (matchCount > 0) {
          intentScore += matchCount;
        }
      }

      if (intentScore > bestScore) {
        bestScore = intentScore;
        bestIntent = intent;
      }
    }

    // Need at least some confidence
    return bestScore >= 1 ? bestIntent : "fallback";
  };

  const processUserMessage = (msg: string) => {
    const intent = matchIntent(msg);

    switch (intent) {
      case "appointment":
        addBotMessage(
          "📅 **Booking an appointment is easy!** Here's how:\n\n" +
            "1️⃣ **Log in** to your patient account (or register if new)\n" +
            '2️⃣ Click **"Appointments"** from the homepage or navigation bar\n' +
            "3️⃣ **Select a doctor** from the dropdown list\n" +
            "4️⃣ **Pick a date** — available time slots will appear automatically\n" +
            "5️⃣ **Choose a time slot** and fill in your details\n" +
            '6️⃣ Click **"Confirm Appointment"** — done! ✅\n\n' +
            "Would you like to know more?",
          [
            "Show me the doctors",
            "What if no time slots appear?",
            "Go to booking page",
            "Back to main menu",
          ],
        );
        break;

      case "doctor":
        if (doctors.length > 0) {
          const doctorList = doctors
            .map(
              (doc) =>
                `🩺 **Dr. ${doc.name}** — ${doc.specialization || "General Physician"}${doc.rating ? ` ⭐ ${doc.rating}` : ""}`,
            )
            .join("\n");
          addBotMessage(
            `Here are our available doctors:\n\n${doctorList}\n\nWould you like to book an appointment with any of them?`,
            [
              "How to book an appointment?",
              "Tell me more about a doctor",
              "Back to main menu",
            ],
          );
        } else {
          addBotMessage(
            "I couldn't fetch doctor details right now. Please try visiting the **Doctors** page directly from the navigation bar.",
            ["How to book an appointment?", "Back to main menu"],
          );
        }
        break;

      case "doctorDetail":
        if (doctors.length > 0) {
          const doctorDetails = doctors
            .map((doc) => {
              let detail = `🩺 **Dr. ${doc.name}**\n   Specialization: ${doc.specialization || "General"}`;
              if (doc.availability && doc.availability.length > 0) {
                const days = doc.availability.map((a) => a.day).join(", ");
                detail += `\n   Available: ${days}`;
              }
              if (doc.rating) {
                detail += `\n   Rating: ⭐ ${doc.rating}/5`;
              }
              return detail;
            })
            .join("\n\n");
          addBotMessage(
            `Here are the details of our doctors:\n\n${doctorDetails}\n\nYou can view full profiles on the **Doctors** page!`,
            [
              "How to book an appointment?",
              "Go to doctors page",
              "Back to main menu",
            ],
          );
        } else {
          addBotMessage(
            "Sorry, I couldn't load doctor details. Please check the Doctors page.",
            ["Back to main menu"],
          );
        }
        break;

      case "noSlots":
        addBotMessage(
          "If no time slots appear, it means the doctor hasn't set their availability for that day. Here's what you can try:\n\n" +
            "• **Try a different date** — the doctor may be available on other days\n" +
            "• **Choose another doctor** with the same specialization\n" +
            "• **Contact the hospital** for manual scheduling\n\n" +
            "Doctors update their schedules regularly, so check back soon!",
          [
            "Show me the doctors",
            "How to book an appointment?",
            "Back to main menu",
          ],
        );
        break;

      case "service":
        addBotMessage(
          "🏥 **Our Hospital Services** include:\n\n" +
            "• Cardiology — Heart diagnostics & treatment\n" +
            "• Neurology — Brain & nervous system care\n" +
            "• Pediatrics — Children's healthcare\n" +
            "• Orthopedics — Bone & joint treatment\n" +
            "• General Medicine — Routine checkups & treatment\n\n" +
            "Visit our **Services** page for the full list with details!",
          [
            "Show me the doctors",
            "How to book an appointment?",
            "Back to main menu",
          ],
        );
        break;

      case "contact":
        addBotMessage(
          "📞 **Contact Information:**\n\n" +
            "🏥 SmartCare Hospital\n" +
            "📍 123 Healthcare Avenue, Medical District\n" +
            "📧 info@smartcare.com\n" +
            "📱 +94 11 234 5678\n" +
            "⏰ Open 24/7 for emergencies\n\n" +
            "For appointments, you can book directly through our website!",
          ["How to book an appointment?", "Back to main menu"],
        );
        break;

      case "goBooking":
        addBotMessage(
          "🔗 Taking you to the booking page! Make sure you're logged in as a patient first.",
          ["Back to main menu"],
        );
        setTimeout(() => {
          window.location.href = "/patient/book";
        }, 1500);
        break;

      case "goDoctors":
        addBotMessage("🔗 Taking you to the doctors page!", [
          "Back to main menu",
        ]);
        setTimeout(() => {
          window.location.href = "/doctors";
        }, 1500);
        break;

      case "register":
        addBotMessage(
          "🔐 **Account Help:**\n\n" +
            "**New Patient?**\n" +
            "→ Click **Register** in the top navigation bar\n" +
            "→ Enter your email and create a password\n" +
            "→ You'll be ready to book appointments!\n\n" +
            "**Already have an account?**\n" +
            "→ Click **Login** and enter your credentials\n\n" +
            "Only patient accounts can book appointments.",
          ["How to book an appointment?", "Back to main menu"],
        );
        break;

      case "cost":
        addBotMessage(
          "💰 **Pricing Information:**\n\n" +
            "Consultation fees vary by specialist. For detailed pricing:\n\n" +
            "• **General Checkup** — starting from LKR 1,500\n" +
            "• **Specialist Consultation** — starting from LKR 3,000\n" +
            "• **Emergency** — varies based on treatment\n\n" +
            "For insurance and payment queries, please contact our billing department.",
          [
            "Contact information",
            "How to book an appointment?",
            "Back to main menu",
          ],
        );
        break;

      case "hours":
        addBotMessage(
          "🕐 **Hospital Working Hours:**\n\n" +
            "• **OPD (Outpatient):** Mon–Sat, 8:00 AM – 8:00 PM\n" +
            "• **Emergency:** Open 24/7\n" +
            "• **Lab & Pharmacy:** Mon–Sat, 7:00 AM – 9:00 PM\n" +
            "• **Sunday:** Emergency services only\n\n" +
            "Book online anytime — even outside working hours!",
          [
            "How to book an appointment?",
            "Contact information",
            "Back to main menu",
          ],
        );
        break;

      case "emergency":
        addBotMessage(
          "🚨 **For Emergencies:**\n\n" +
            "Please call our **Emergency Hotline** immediately:\n" +
            "📱 **+94 11 234 5678** (24/7)\n\n" +
            "🚑 Our emergency department is open **24 hours, 7 days a week**.\n\n" +
            "⚠️ If this is a life-threatening emergency, please call **1990** (Ambulance) right away!",
          ["Contact information", "Back to main menu"],
        );
        break;

      case "greeting":
        addBotMessage(
          "👋 How can I help you today? Choose an option below or type your question!",
          [
            "How to book an appointment?",
            "Show me the doctors",
            "What services do you offer?",
            "Contact information",
          ],
        );
        break;

      case "thanks":
        addBotMessage(
          "😊 You're welcome! Feel free to ask anytime. Wishing you good health! 💚",
          ["Back to main menu"],
        );
        break;

      default:
        addBotMessage(
          "I'm sorry, I didn't quite catch that. Let me help you with one of these topics:",
          [
            "How to book an appointment?",
            "Show me the doctors",
            "What services do you offer?",
            "Contact information",
          ],
        );
        break;
    }
  };

  // Format text with basic markdown bold
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-extrabold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-slate-800"
            : "bg-gradient-to-br from-[#0f4c5c] to-[#1b263b]"
        }`}
        style={{ borderRadius: "50%" }}
        aria-label="Chat with SmartCare Assistant"
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            {pulse && (
              <span className="absolute inset-0 rounded-full bg-[#0f4c5c] animate-ping opacity-30" />
            )}
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e58221] rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[7px] font-black text-white">1</span>
            </span>
          </>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed z-50 transition-all duration-500 ease-out
          bottom-18 right-4 sm:bottom-22 sm:right-6
          w-[calc(100vw-2rem)] sm:w-85 md:w-92.5
          ${
            isOpen
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 translate-y-8 scale-95 pointer-events-none"
          }`}
      >
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#35838D]/40 overflow-hidden flex flex-col h-[min(480px,calc(100vh-7rem))] sm:h-[min(500px,calc(100vh-8rem))]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0f4c5c] to-[#1b263b] px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#35838D]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-extrabold text-xs sm:text-sm tracking-tight">
                SmartCare Assistant
              </h3>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[#35838D] text-[10px] font-semibold">
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-6 h-6 bg-gradient-to-br from-[#0f4c5c] to-[#1b263b] rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-3 h-3 text-[#35838D]" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] ${msg.sender === "user" ? "order-first" : ""}`}
                >
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-[#0f4c5c] to-[#1b263b] text-white rounded-br-sm shadow-sm"
                        : "bg-[#f0f9fa] text-slate-700 border border-[#35838D]/30 rounded-bl-sm"
                    }`}
                  >
                    {formatText(msg.text)}
                  </div>

                  {/* Quick reply buttons */}
                  {msg.sender === "bot" && msg.options && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {msg.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSend(option)}
                          className="text-[10px] font-semibold px-2 py-1.5 rounded-full bg-white border border-[#35838D]/40 text-[#0f4c5c] hover:bg-[#35838D]/20 hover:border-[#35838D] transition-all duration-200 flex items-center gap-0.5 shadow-sm active:scale-95"
                        >
                          <ChevronRight className="w-2.5 h-2.5" />
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    className={`text-[9px] text-slate-400 mt-1 block font-medium ${msg.sender === "user" ? "text-right" : ""}`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 items-end">
                <div className="w-6 h-6 bg-gradient-to-br from-[#0f4c5c] to-[#1b263b] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-3 h-3 text-[#35838D]" />
                </div>
                <div className="bg-[#f0f9fa] border border-[#35838D]/30 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#0f4c5c]/40 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-[#0f4c5c]/40 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-[#0f4c5c]/40 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-3 py-2.5 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-xl border-t border-[#35838D]/20 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 sm:py-2.5 rounded-full bg-[#f0f9fa] border border-[#35838D]/30 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#35838D] focus:ring-2 focus:ring-[#35838D]/20 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#0f4c5c] to-[#1b263b] rounded-full flex items-center justify-center text-white hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md active:scale-95 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[8px] sm:text-[9px] text-slate-400 font-medium text-center mt-1.5">
              SmartCare Assistant • Powered by SmartCare HMS
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
