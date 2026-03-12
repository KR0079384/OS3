import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Shield, TrendingUp, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import cyberBgVideo from "@/assets/cyber-bg-video.mp4";
import PageTransition from "@/components/PageTransition";

const recommendations = [
  {
    current: { name: "lodash@4.17.20", score: 28, issues: 3 },
    suggested: { name: "lodash@4.17.21", score: 95, issues: 0 },
    reason: "Patches critical Prototype Pollution vulnerability",
    action: "npm install lodash@4.17.21",
  },
  {
    current: { name: "qs@6.11.0", score: 45, issues: 1 },
    suggested: { name: "qs@6.12.0", score: 92, issues: 0 },
    reason: "Fixes DoS vulnerability in query parsing",
    action: "npm install qs@6.12.0",
  },
  {
    current: { name: "express@4.18.2", score: 62, issues: 1 },
    suggested: { name: "express@4.19.2", score: 98, issues: 0 },
    reason: "Resolves open redirect vulnerability",
    action: "npm install express@4.19.2",
  },
  {
    current: { name: "cross-spawn@7.0.3", score: 40, issues: 1 },
    suggested: { name: "cross-spawn@7.0.5", score: 96, issues: 0 },
    reason: "Patches command injection on Windows",
    action: "npm install cross-spawn@7.0.5",
  },
];

const getScoreBg = (s: number) =>
  s >= 80 ? "bg-neon-green/15 text-neon-green border-neon-green/40"
    : s >= 50 ? "bg-neon-yellow/15 text-neon-yellow border-neon-yellow/40"
    : "bg-neon-red/15 text-neon-red border-neon-red/40";

const Recommendations = () => (
  <PageTransition>
    <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" src={cyberBgVideo} />
      <div className="absolute inset-0 bg-background/80 z-[1]" />
      <div className="absolute inset-0 cyber-grid z-[2]" />
      <div className="container max-w-4xl relative z-[3]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp className="w-6 h-6 text-neon-green" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-[0_0_10px_hsl(145_80%_50%/0.3)]">
              Smart <span className="text-neon-green">Recommendations</span>
            </h1>
          </div>
          <p className="text-foreground/60 text-sm mb-8">AI-suggested safer alternatives for your vulnerable dependencies.</p>

          <div className="space-y-4">
            {recommendations.map((r, i) => (
              <motion.div key={r.current.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-neon-green/20 transition-all">
                  <CardContent className="p-5">
                    <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      {/* Current */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-neon-red/10 border border-neon-red/20 flex items-center justify-center flex-shrink-0">
                          <XCircle className="w-4 h-4 text-neon-red" />
                        </div>
                        <div>
                          <code className="text-sm font-mono text-neon-red font-semibold">{r.current.name}</code>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-[10px] font-semibold ${getScoreBg(r.current.score)}`}>Score: {r.current.score}</Badge>
                            <span className="text-xs text-foreground/50">{r.current.issues} issue{r.current.issues > 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="hidden md:flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-primary" />
                        </div>
                      </div>

                      {/* Suggested */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-neon-green/10 border border-neon-green/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-neon-green" />
                        </div>
                        <div>
                          <code className="text-sm font-mono text-neon-green font-semibold">{r.suggested.name}</code>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-[10px] font-semibold ${getScoreBg(r.suggested.score)}`}>Score: {r.suggested.score}</Badge>
                            <span className="text-xs text-neon-green">No issues</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between gap-4">
                      <p className="text-xs text-foreground/50">{r.reason}</p>
                      <code className="text-[11px] font-mono bg-primary/5 border border-primary/20 px-3 py-1 rounded text-primary font-semibold whitespace-nowrap">{r.action}</code>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Apply all */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
            <Button className="glow-blue gap-2 px-8 h-12 text-base">
              <Shield className="w-5 h-5" />
              Apply All Fixes
            </Button>
            <p className="text-xs text-foreground/50 mt-3">Estimated score improvement: <span className="text-neon-yellow font-mono font-bold">72</span> → <span className="text-neon-green font-mono font-bold">94</span></p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </PageTransition>
);

export default Recommendations;
