import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileJson,
  Loader2,
  CheckCircle,
  ArrowRight,
  Zap,
  ShieldAlert
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import cyberBgVideo from "@/assets/cyber-bg-video.mp4";
import PageTransition from "@/components/PageTransition";

import { scanPackage, ScanResponse } from "@/services/api";

interface Severity {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const Scan = () => {

  const [packageName, setPackageName] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const [complete, setComplete] = useState(false);

  const [xp, setXP] = useState(0);
  const [threats, setThreats] = useState<string[]>([]);

  const [dependencies, setDependencies] = useState<number>(0);
  const [vulnerabilities, setVulnerabilities] = useState<number>(0);
  const [securityScore, setSecurityScore] = useState<number>(0);
  const [status, setStatus] = useState<string>("Unknown");

  const [graph, setGraph] = useState<any>({ nodes: [], edges: [] });
  const [attackPaths, setAttackPaths] = useState<string[][]>([]);

  const [severity, setSeverity] = useState<Severity>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  const navigate = useNavigate();

  const phases = [
    "Resolving dependency tree...",
    "Analyzing package metadata...",
    "Checking CVE databases...",
    "Scanning for malicious patterns...",
    "Calculating security scores...",
    "Generating report..."
  ];

  const randomThreats = [
    "Prototype Pollution detected",
    "Suspicious dependency chain",
    "Potential RCE vulnerability",
    "Outdated cryptographic library",
    "Malicious install script"
  ];

  const startScan = async () => {

    if (!packageName.trim()) return;

    setScanning(true);
    setProgress(0);
    setXP(0);
    setThreats([]);
    setComplete(false);

    try {

      const data: ScanResponse = await scanPackage(packageName);

      setDependencies(data.dependencies_found || 0);
      setVulnerabilities(data.vulnerabilities || 0);
      setSecurityScore(data.security_score || 0);
      setStatus(data.status || "Unknown");

      setGraph(data.graph || { nodes: [], edges: [] });
      setAttackPaths(data.attack_paths || []);

      setSeverity(data.severity || severity);

    } catch (error) {

      console.error("Scan Error:", error);

    }

    let step = 0;

    const interval = setInterval(() => {

      step++;

      const p = Math.min((step / phases.length) * 100, 100);

      setProgress(p);
      setScanPhase(phases[Math.min(step - 1, phases.length - 1)]);

      setXP(prev => prev + Math.floor(Math.random() * 15) + 5);

      if (Math.random() > 0.6) {

        const threat = randomThreats[Math.floor(Math.random() * randomThreats.length)];

        setThreats(prev => [...prev.slice(-3), threat]);

      }

      if (step >= phases.length) {

        clearInterval(interval);

        setTimeout(() => {

          setScanning(false);
          setComplete(true);

        }, 500);

      }

    }, 800);

  };

  const handleViewResults = () => {

    navigate("/dashboard", {
      state: {
        dependencies,
        vulnerabilities,
        securityScore,
        status,
        graph,
        attackPaths,
        severity
      }
    });

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

        <div className="container max-w-6xl relative z-[3] grid md:grid-cols-2 gap-12">

          {/* LEFT SIDE */}

          <div>

            <div className="text-center mb-10">

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">

                <Zap className="w-3 h-3 text-primary" />

                <span className="text-xs font-medium text-primary">
                  Quick Analysis
                </span>

              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
                Scan Your <span className="text-primary">Project</span>
              </h1>

              <p className="text-foreground/70 text-base">
                Search an open-source package to begin security analysis.
              </p>

            </div>

            <Card className="bg-card/40 backdrop-blur-sm border-border/50">

              <CardHeader>

                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <FileJson className="w-4 h-4 text-primary" />
                  Analyze a Package
                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="flex gap-3">

                  <Input
                    placeholder="e.g., lodash, express, requests..."
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                  />

                  <Button
                    onClick={startScan}
                    disabled={scanning}
                  >

                    {scanning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}

                    Scan

                  </Button>

                </div>

              </CardContent>

            </Card>

          </div>

          {/* GAMIFIED SCANNER */}

          <AnimatePresence>

            {scanning && (

              <motion.div
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >

                <Card className="bg-black/50 border-primary/40 backdrop-blur-xl">

                  <CardContent className="p-6">

                    <h3 className="text-primary text-sm mb-3">
                      Cyber Scanner Console
                    </h3>

                    {/* XP COUNTER */}

                    <div className="text-xs text-cyan-400 mb-4">
                      XP Earned: {xp}
                    </div>

                    {/* RADAR */}

                    <div className="relative h-56 flex items-center justify-center">

                      <div className="absolute w-52 h-52 border border-primary/30 rounded-full" />

                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute w-52 h-52"
                      >
                        <div className="absolute top-1/2 left-1/2 w-26 h-[2px] bg-cyan-400 origin-left shadow-[0_0_10px_cyan]" />
                      </motion.div>

                      {Array.from({ length: 10 }).map((_, i) => (

                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                          style={{
                            top: `${20 + Math.random() * 60}%`,
                            left: `${20 + Math.random() * 60}%`
                          }}
                        />

                      ))}

                    </div>

                    {/* PROGRESS */}

                    <div className="mt-4">

                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{scanPhase}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>

                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">

                        <motion.div
                          className="h-full bg-primary"
                          animate={{ width: `${progress}%` }}
                        />

                      </div>

                    </div>

                    {/* THREAT ALERTS */}

                    <div className="mt-4 space-y-1 text-xs">

                      {threats.map((t, i) => (

                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-red-400"
                        >
                          <ShieldAlert className="w-3 h-3" />
                          {t}
                        </motion.div>

                      ))}

                    </div>

                  </CardContent>

                </Card>

              </motion.div>

            )}

          </AnimatePresence>

        </div>

        {/* RESULT */}

        <AnimatePresence>

          {complete && (

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="container max-w-2xl mt-10 relative z-[3]"
            >

              <Card className="bg-card/40 backdrop-blur-sm border-green-500/40">

                <CardContent className="p-6 text-center">

                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />

                  <h3 className="font-bold text-lg mb-1 text-foreground">
                    Scan Complete!
                  </h3>

                  <p className="text-sm text-foreground/70 mb-4">
                    Found <b>{dependencies}</b> dependencies •{" "}
                    <b>{vulnerabilities}</b> vulnerabilities detected
                  </p>

                  <Button
                    onClick={handleViewResults}
                    className="gap-2"
                  >
                    View Results
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                </CardContent>

              </Card>

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    </PageTransition>

  );

};

export default Scan;