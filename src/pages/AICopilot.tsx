import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Shield, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import cyberBgVideo from "@/assets/cyber-bg-video.mp4";
import PageTransition from "@/components/PageTransition";

interface Message {
  role: "user" | "ai";
  content: string;
}

const suggestions = [
  "Why is lodash@4.17.20 risky?",
  "What is a safer alternative to qs?",
  "Explain CVE-2024-48999",
  "How do I fix the express vulnerability?",
];

const aiResponses: Record<string, string> = {
  "Why is lodash@4.17.20 risky?": "lodash@4.17.20 is affected by **CVE-2024-48999** (CVSS 9.8 Critical). It has a Prototype Pollution vulnerability that allows attackers to inject properties into Object.prototype, potentially leading to remote code execution. **Recommended action:** Upgrade to lodash@4.17.21 which patches this vulnerability.",
  "What is a safer alternative to qs?": "Consider switching to **URLSearchParams** (built-in) for simple use cases, or **query-string@9.0.0** which has a clean security record and better maintenance. The current qs@6.11.0 has a DoS vulnerability (CVE-2024-33883) that's fixed in qs@6.12.0.",
  "Explain CVE-2024-48999": "**CVE-2024-48999** is a Critical (CVSS 9.8) Prototype Pollution vulnerability in lodash before 4.17.21. Attackers can craft malicious input to modify Object.prototype, affecting all objects in the application. This can lead to property injection, authentication bypass, or remote code execution depending on how the application uses lodash.",
  "How do I fix the express vulnerability?": "The express@4.18.2 open redirect vulnerability (CVE-2024-29041, CVSS 5.3) can be fixed by upgrading to express@4.19.2 or later. Run: `npm install express@latest`. Additionally, validate redirect URLs in your application code to only allow trusted domains.",
};

const AICopilot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "👋 I'm your AI Security Copilot. Ask me about vulnerabilities, risky packages, or safer alternatives. I've analyzed your project and I'm ready to help!" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    const aiReply = aiResponses[text] || "I've analyzed this concern. Based on your project's dependency tree, I recommend reviewing the package's security advisories on GitHub and checking for newer versions with patches. Would you like me to suggest specific alternatives?";
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", content: aiReply }]);
    }, 800);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" src={cyberBgVideo} />
        <div className="absolute inset-0 bg-background/80 z-[1]" />
        <div className="absolute inset-0 cyber-grid z-[2]" />
        <div className="container max-w-3xl relative z-[3]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-[0_0_10px_hsl(265_80%_60%/0.3)]">
                AI Security <span className="text-accent">Copilot</span>
              </h1>
            </div>
            <p className="text-foreground/60 text-sm mb-6">Ask questions about vulnerabilities and get AI-powered security guidance.</p>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 mb-6">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 text-xs rounded-full border border-accent/20 bg-accent/5 text-foreground/70 hover:border-accent/50 hover:text-accent hover:bg-accent/10 transition-all"
                >
                  <Sparkles className="w-3 h-3 inline mr-1 text-accent/70" />
                  {s}
                </button>
              ))}
            </div>

            {/* Chat area */}
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
                      {msg.role === "ai" && (
                        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-accent" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary/10 border border-primary/25 text-foreground"
                          : "bg-accent/5 border border-accent/15 text-foreground/90"
                      }`}>
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Input */}
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask about a vulnerability, package, or security concern..."
                className="bg-card/40 backdrop-blur-sm border-border/50 text-foreground placeholder:text-foreground/30"
              />
              <Button onClick={() => sendMessage(input)} className="glow-blue gap-2 px-6">
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
