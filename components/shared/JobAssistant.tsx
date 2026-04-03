"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircleIcon, XIcon, SendIcon, BotIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

const QUICK_ACTIONS = [
  "How to write a good resume?",
  "How to prepare for an interview?",
  "What are in-demand skills in 2025?",
  "Tips to get shortlisted faster?",
];

function generateResponse(userMsg: string): string {
  const msg = userMsg.toLowerCase();

  if (msg.includes("resume") || msg.includes("cv")) {
    return "📄 **Resume Tips:**\n• Keep it to 1–2 pages\n• Use bullet points with measurable results\n• Tailor keywords to each job description\n• Add skills that match the job requirements\n• Upload your resume on EkClickJob to apply in 1 click!";
  }
  if (msg.includes("interview") || msg.includes("interview prep")) {
    return "🎯 **Interview Prep:**\n• Research the company before the interview\n• Practice STAR method for behavioural questions\n• Prepare questions to ask the interviewer\n• Dress appropriately and arrive 10 mins early\n• Follow up with a thank-you email after!";
  }
  if (msg.includes("skill") || msg.includes("in-demand") || msg.includes("2025")) {
    return "🔥 **Top In-Demand Skills (2025):**\n• AI & Machine Learning\n• React / Next.js\n• Data Science & Analytics\n• Cloud (AWS/Azure/GCP)\n• Cybersecurity\n• DevOps & Kubernetes\n• Digital Marketing\n• Product Management";
  }
  if (msg.includes("shortlist") || msg.includes("callback") || msg.includes("hired")) {
    return "⚡ **Get Shortlisted Faster:**\n• Complete your profile 100%\n• Add a professional headline\n• Write a strong bio with keywords\n• Apply within 24 hours of posting\n• Personalize your cover letter\n• Set up job alerts for instant notifications";
  }
  if (msg.includes("salary") || msg.includes("pay") || msg.includes("ctc")) {
    return "💰 **Salary Tips:**\n• Research market rates on EkClickJob Insights\n• Don't reveal your current salary too early\n• Negotiate based on your market value\n• Consider total compensation (benefits + equity)\n• Ask about growth potential, not just base salary";
  }
  if (msg.includes("fresher") || msg.includes("campus") || msg.includes("graduate") || msg.includes("entry")) {
    return "🎓 **For Freshers:**\n• Check our Campus/Fresher Zone on the homepage!\n• Build projects to demonstrate skills\n• Get internships to build experience\n• Focus on certifications (AWS, Google, etc.)\n• LinkedIn optimization is key for freshers\n• Network actively at college events";
  }
  if (msg.includes("remote") || msg.includes("work from home") || msg.includes("wfh")) {
    return "🏠 **Remote Job Tips:**\n• Filter jobs by 'Remote' in our jobs filter\n• Set up a professional home office\n• Highlight remote work experience in your resume\n• Tools: Slack, Zoom, Notion, Jira\n• Time management is crucial for remote roles";
  }
  if (msg.includes("apply") || msg.includes("application")) {
    return "📬 **Applying Smart:**\n• Apply to jobs within 24 hours of posting\n• Customize your cover letter for each job\n• Follow the employer on social media\n• Use our 1-click apply feature by completing your profile\n• Track your applications in the 'Applications' tab";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "👋 Hi there! I'm your **EkClickJob Assistant**. I can help you with:\n• Resume tips\n• Interview preparation\n• In-demand skills\n• Salary negotiation\n• Job search strategies\n\nWhat would you like to know?";
  }
  if (msg.includes("thank")) {
    return "😊 You're welcome! All the best with your job search. Feel free to ask me anything anytime!";
  }
  return "🤔 I'm not sure about that specific question. Here's what I can help with:\n\n• **Resume** tips\n• **Interview** preparation\n• **Skills** in demand\n• Getting **shortlisted** faster\n• **Salary** negotiation\n• **Fresher** / campus jobs\n• **Remote** jobs\n\nTry one of the quick questions below!";
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

export function JobAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "👋 Hi! I'm your **EkClickJob Assistant**. Ask me anything about job search, resume tips, or interview prep!",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, open]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: generateId(), role: "user", text };
    const botMsg: Message = { id: generateId(), role: "bot", text: generateResponse(text) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function renderText(text: string) {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i} className="block">
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </span>
      );
    });
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
          open
            ? "bg-muted text-muted-foreground rotate-0 scale-90"
            : "bg-primary text-primary-foreground hover:scale-110 hover:shadow-primary/40"
        )}
        aria-label="Toggle Job Assistant"
      >
        {open ? <XIcon className="h-6 w-6" /> : <MessageCircleIcon className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white animate-pulse">
            AI
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[340px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:w-[380px]"
          style={{ height: "500px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Job Assistant</p>
              <p className="text-[10px] text-white/70">Powered by EkClickJob AI</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "bot" && (
                  <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <BotIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted text-foreground"
                  )}
                >
                  {renderText(msg.text)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          <div className="border-t px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="shrink-0 rounded-full border px-3 py-1 text-[11px] text-muted-foreground hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t px-3 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
              placeholder="Ask anything..."
              className="flex-1 rounded-full border bg-muted px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
