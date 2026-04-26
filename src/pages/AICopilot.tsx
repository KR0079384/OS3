import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import cyberBgVideo from "@/assets/cyber-bg-video.mp4";
import PageTransition from "@/components/PageTransition";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STREAM_URL = "http://localhost:8000/api/copilot/ask-stream";

const suggestions = [
  "Is lodash safe to use?",
  "What is CVE-2022-23529?",
  "What does OS3 do?",
  "How do I fix prototype pollution?",
];

const AICopilot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 I'm your OS3 AI Security Copilot.\n\nAsk me about:\n• Vulnerable packages\n• CVEs\n• Fix recommendations\n• OS3 insights",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🚀 STREAMING FUNCTION
  const askCopilot = async (question: string) => {
    if (!question.trim() || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    // Add empty assistant message (for streaming)
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(STREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Server error");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // Stream tokens
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const token = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content:
              updated[updated.length - 1].content + token,
          };
          return updated;
        });
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content:
            "❌ Unable to reach AI backend.\n\nMake sure:\n1. FastAPI running → uvicorn main:app --reload --port 8000\n2. Ollama running → ollama serve",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    askCopilot(input);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={cyberBgVideo}
        />
        <div className="absolute inset-0 bg-background/80 z-[1]" />
        <div className="absolute inset-0 cyber-grid z-[2]" />

        <div className="container max-w-3xl relative z-[3]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                AI Security <span className="text-accent">Copilot</span>
              </h1>
            </div>

            <p className="text-foreground/60 text-sm mb-6">
              Real-time AI-powered security guidance (Streaming enabled ⚡)
            </p>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 mb-6">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => askCopilot(s)}
                  className="px-3 py-1.5 text-xs rounded-full border border-accent/20 bg-accent/5 text-foreground/70 hover:border-accent/50 hover:text-accent hover:bg-accent/10 transition-all"
                >
                  <Sparkles className="w-3 h-3 inline mr-1 text-accent/70" />
                  {s}
                </button>
              ))}
            </div>

            {/* Chat */}
            <Card className="bg-card/30 backdrop-blur-sm border-border/50 mb-4">
              <CardContent className="p-4 h-[450px] overflow-y-auto space-y-4">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-accent" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === "user"
                          ? "bg-primary/10 border border-primary/25"
                          : "bg-accent/5 border border-accent/15"
                          }`}
                      >
                        {msg.content}

                        {/* Blinking cursor */}
                        {loading &&
                          i === messages.length - 1 &&
                          msg.role === "assistant" && (
                            <span className="inline-block w-1.5 h-4 bg-accent ml-1 animate-pulse" />
                          )}
                      </div>

                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div ref={bottomRef} />
              </CardContent>
            </Card>

            {/* Input */}
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about vulnerabilities, CVEs, or packages..."
              />
              <Button onClick={handleSend} disabled={loading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AICopilot;