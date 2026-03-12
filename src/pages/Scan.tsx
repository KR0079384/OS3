import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileJson, Loader2, CheckCircle, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import cyberBgVideo from "@/assets/cyber-bg-video.mp4";
import PageTransition from "@/components/PageTransition";

import { scanPackage } from "@/services/api";

const Scan = () => {

  const [packageName, setPackageName] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const [complete, setComplete] = useState(false);

  const [dependencies, setDependencies] = useState(0);
  const [vulnerabilities, setVulnerabilities] = useState(0);
  const [securityScore, setSecurityScore] = useState(0);
  const [status, setStatus] = useState("");

  const [graph, setGraph] = useState<any>(null);

  const navigate = useNavigate();

  const phases = [
    "Resolving dependency tree...",
    "Analyzing package metadata...",
    "Checking CVE databases...",
    "Scanning for malicious patterns...",
    "Calculating security scores...",
    "Generating report..."
  ];

  const startScan = async () => {

    if (!packageName.trim()) return;

    setScanning(true);
    setProgress(0);
    setComplete(false);

    try {

      const data = await scanPackage(packageName);

      console.log("Scan result:", data);

      setDependencies(data.dependencies_found || 0);
      setVulnerabilities(data.vulnerabilities || 0);
      setSecurityScore(data.security_score || 0);
      setStatus(data.status || "Unknown");

      setGraph(data.graph);

    } catch (error) {

      console.error("Scan Error:", error);

    }

    let step = 0;

    const interval = setInterval(() => {

      step++;

      const p = Math.min((step / phases.length) * 100, 100);

      setProgress(p);
      setScanPhase(phases[Math.min(step - 1, phases.length - 1)]);

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
        graph
      }
    });

  };

  return (
    <PageTransition>

      <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">

        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" src={cyberBgVideo} />

        <div className="absolute inset-0 bg-background/80 z-[1]" />
        <div className="absolute inset-0 cyber-grid z-[2]" />

        <div className="container max-w-3xl relative z-[3]">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            <div className="text-center mb-10">

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">Quick Analysis</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
                Scan Your <span className="text-primary">Project</span>
              </h1>

              <p className="text-foreground/70 text-base">
                Search a package to begin analysis.
              </p>

            </div>

            <Card className="mb-6 bg-card/40 backdrop-blur-sm border-border/50">

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

                  <Button onClick={startScan} disabled={scanning}>

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

            <AnimatePresence>

              {complete && (

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

                  <Card className="bg-card/40 backdrop-blur-sm border-green-500/40">

                    <CardContent className="p-6 text-center">

                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />

                      <h3 className="font-bold text-lg mb-1 text-foreground">
                        Scan Complete!
                      </h3>

                      <p className="text-sm text-foreground/70 mb-4">
                        Found <b>{dependencies}</b> dependencies • <b>{vulnerabilities}</b> vulnerabilities detected
                      </p>

                      <Button onClick={handleViewResults} className="gap-2">

                        View Results
                        <ArrowRight className="w-4 h-4" />

                      </Button>

                    </CardContent>

                  </Card>

                </motion.div>

              )}

            </AnimatePresence>

          </motion.div>

        </div>

      </div>

    </PageTransition>
  );

};

export default Scan;