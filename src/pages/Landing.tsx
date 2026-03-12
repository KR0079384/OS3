import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Scan, Network, Bot, Lock, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import cyberBgVideo from "@/assets/cyber-bg-video.mp4";
import PageTransition from "@/components/PageTransition";

/* Animated dependency network node */
const NetworkNode = ({ x, y, size, delay, color }: { x: string; y: string; size: number; delay: number; color: string }) => (
  <motion.div
    className="absolute rounded-full border"
    style={{ left: x, top: y, width: size, height: size, borderColor: color, background: `${color}15` }}
    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 3, repeat: Infinity, delay }}
  />
);

const Landing = () => {
  const features = [
    { icon: Scan, title: "Deep Dependency Scanning", desc: "Analyze package.json, requirements.txt, and more. Detect vulnerabilities in every layer of your supply chain." },
    { icon: Shield, title: "Security Score (0–100)", desc: "Get a comprehensive security score for your project based on vulnerability severity, dependency health, and risk factors." },
    { icon: Network, title: "Dependency Graph", desc: "Visualize your entire dependency tree with risk-coded nodes. See exactly where vulnerabilities hide." },
    { icon: Bot, title: "AI Security Copilot", desc: "Ask questions about risky packages, get safer alternatives, and understand CVEs in plain English." },
    { icon: Eye, title: "CVE Intelligence", desc: "Real-time vulnerability insights with CVE IDs, severity levels, affected versions, and suggested fixes." },
    { icon: Lock, title: "Supply Chain Protection", desc: "Detect malicious packages, typosquatting, and dependency confusion attacks before they hit production." },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src={cyberBgVideo} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-background/75" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
          </div>

          {/* Ambient glows */}
          <motion.div
            className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full blur-[120px] z-[1]"
            style={{ background: "radial-gradient(circle, hsl(195 100% 50% / 0.12), transparent)" }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/6 w-[400px] h-[400px] rounded-full blur-[100px] z-[1]"
            style={{ background: "radial-gradient(circle, hsl(265 80% 60% / 0.1), transparent)" }}
            animate={{ opacity: [0.4, 0.2, 0.4], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          />

          {/* Floating network nodes */}
          <div className="absolute inset-0 pointer-events-none z-[2]">
            <NetworkNode x="8%" y="18%" size={14} delay={0} color="hsl(195 100% 50%)" />
            <NetworkNode x="22%" y="32%" size={9} delay={0.5} color="hsl(145 80% 50%)" />
            <NetworkNode x="6%" y="58%" size={11} delay={1} color="hsl(195 100% 50%)" />
            <NetworkNode x="78%" y="22%" size={16} delay={0.3} color="hsl(0 85% 55%)" />
            <NetworkNode x="83%" y="48%" size={9} delay={0.8} color="hsl(265 80% 60%)" />
            <NetworkNode x="88%" y="68%" size={11} delay={1.2} color="hsl(145 80% 50%)" />
            <NetworkNode x="72%" y="74%" size={7} delay={0.6} color="hsl(45 100% 55%)" />
            <NetworkNode x="18%" y="72%" size={9} delay={1.5} color="hsl(195 100% 50%)" />
            <NetworkNode x="62%" y="12%" size={11} delay={0.9} color="hsl(195 100% 50%)" />
            <NetworkNode x="42%" y="84%" size={7} delay={1.8} color="hsl(265 80% 60%)" />
            <NetworkNode x="50%" y="8%" size={8} delay={2.1} color="hsl(45 100% 55%)" />
            <NetworkNode x="92%" y="35%" size={6} delay={1.3} color="hsl(195 100% 50%)" />
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                <span className="text-xs font-medium text-primary">AI-Powered Supply Chain Security</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mx-auto mb-8 relative"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-blue">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl animate-ping bg-primary/5" />
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4">
                <span className="text-foreground drop-shadow-[0_0_20px_hsl(195_100%_50%/0.15)]">OS</span>
                <span className="text-primary drop-shadow-[0_0_30px_hsl(195_100%_50%/0.5)]">³</span>
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-foreground/90 mb-2">
                Open Source Security Score
              </p>
              <p className="text-lg md:text-xl text-primary font-medium mb-6 drop-shadow-[0_0_10px_hsl(195_100%_50%/0.3)]">
                AI Copilot for Dependency Security
              </p>
              <p className="text-base text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                Scan your open-source dependencies, detect vulnerabilities and malicious packages,
                and get AI-powered recommendations — all in one platform built for DevSecOps teams.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="gap-2 glow-blue text-base px-8 h-12">
                  <Link to="/scan">
                    <Scan className="w-4 h-4" />
                    Scan Project
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 border-accent/40 text-accent hover:bg-accent/10 text-base px-8 h-12">
                  <Link to="/dashboard">
                    Try Demo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-8 mt-16 text-sm"
              >
                {[
                  { val: "50K+", label: "Packages Scanned" },
                  { val: "12K+", label: "CVEs Detected" },
                  { val: "99.2%", label: "Accuracy" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    <span className="font-mono text-2xl font-bold text-primary drop-shadow-[0_0_8px_hsl(195_100%_50%/0.4)]">{s.val}</span>
                    <span className="text-foreground/50 text-xs">{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 border-t border-border/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
          <div className="container relative">
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-widest text-primary mb-3 font-semibold">Platform Features</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Enterprise-Grade Security <span className="text-primary">Intelligence</span></h2>
              <p className="text-foreground/50 max-w-xl mx-auto">Everything you need to secure your open-source supply chain, from scanning to remediation.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-card/60 transition-all"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:glow-blue transition-all">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm text-foreground/50 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 border-t border-border/50">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <Zap className="w-10 h-10 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Secure Your <span className="text-primary">Dependencies</span>?</h2>
              <p className="text-foreground/50 mb-8">Start scanning your project in seconds. No setup required.</p>
              <Button asChild size="lg" className="glow-blue px-8 h-12">
                <Link to="/scan">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border/50">
          <div className="container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground/50">OS³ — Open Source Security Score</span>
            </div>
            <p className="text-xs text-foreground/40">Securing the open-source supply chain.</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Landing;
