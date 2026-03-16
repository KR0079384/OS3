import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Network
} from "lucide-react";

import cyberBgVideo from "@/assets/cyber-bg-video.mp4";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";

import PageTransition from "@/components/PageTransition";
import { useLocation, useNavigate } from "react-router-dom";

interface GraphData {
  nodes: any[];
  edges: any[];
}

interface Severity {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const Dashboard = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const dependencies = location.state?.dependencies ?? 0;
  const vulnerabilities = location.state?.vulnerabilities ?? 0;

  const graph: GraphData =
    location.state?.graph ?? { nodes: [], edges: [] };

  const attackPaths: string[][] =
    location.state?.attackPaths ?? [];

  const severity: Severity =
    location.state?.severity ?? {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

  /* -----------------------------
     SCORING ENGINE
  ----------------------------- */

  const vulnerabilityPenalty =
    severity.critical * 15 +
    severity.high * 10 +
    severity.medium * 5 +
    severity.low * 2;

  const attackPenalty = attackPaths.length * 5;
  const dependencyPenalty = Math.floor(dependencies / 5);

  const securityScore = Math.max(
    0,
    100 - vulnerabilityPenalty - attackPenalty - dependencyPenalty
  );

  let status = "Secure";

  if (securityScore >= 80) status = "Secure";
  else if (securityScore >= 60) status = "Moderate Risk";
  else if (securityScore >= 40) status = "High Risk";
  else status = "Critical Risk";

  const safePackages = Math.max(0, dependencies - vulnerabilities);
  const highRisk = severity.high;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#facc15";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  const scoreColor = getScoreColor(securityScore);

  const stats = [
    { label: "Total Dependencies", value: dependencies, icon: Package },
    { label: "Safe Packages", value: safePackages, icon: CheckCircle },
    { label: "Vulnerable", value: vulnerabilities, icon: AlertTriangle },
    { label: "High Risk", value: highRisk, icon: XCircle }
  ];

  const severityData = [
    { name: "Critical", count: severity.critical, fill: "#ff3b3b" },
    { name: "High", count: severity.high, fill: "#ff7a18" },
    { name: "Medium", count: severity.medium, fill: "#facc15" },
    { name: "Low", count: severity.low, fill: "#22d3ee" }
  ];

  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (securityScore / 100) * circumference;

  const openGraph = () => {
    navigate("/graph", {
      state: { graph, attackPaths }
    });
  };

  return (

    <PageTransition>

      <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">

        {/* Background */}

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={cyberBgVideo}
        />

        <div className="absolute inset-0 bg-background/70 z-[1]" />
        <div className="absolute inset-0 cyber-grid z-[2]" />

        <div className="container max-w-7xl mx-auto relative z-[3]">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
          >

            {/* HEADER */}

            <div className="flex items-center gap-3 mb-2">

              <Activity className="w-6 h-6 text-primary" />

              <h1 className="text-3xl font-bold">
                Security Score <span className="text-primary">Dashboard</span>
              </h1>

            </div>

            <Badge className="mb-10 bg-primary/10 border-primary/20 text-primary">
              Risk Status: {status}
            </Badge>

            {/* HERO SECTION */}

            <div className="grid lg:grid-cols-3 gap-6 mb-12">

              {/* SCORE PANEL */}

              <Card className="bg-transparent border border-white/10 shadow-[0_0_35px_rgba(56,189,248,0.18)]">

                <CardContent className="p-10 flex justify-center">

                  <div className="relative w-56 h-56">

                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 200 200"
                    >

                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                      />

                      <motion.circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke={scoreColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.6 }}
                        style={{
                          filter: "drop-shadow(0px 0px 10px rgba(56,189,248,0.7))"
                        }}
                      />

                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">

                      <span
                        className="text-6xl font-black font-mono"
                        style={{ color: scoreColor }}
                      >
                        {securityScore}
                      </span>

                      <span className="text-xs text-foreground/50 tracking-widest">
                        SECURITY SCORE
                      </span>

                    </div>

                  </div>

                </CardContent>

              </Card>

              {/* STAT CARDS */}

              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">

                {stats.map((s) => (

                  <Card
                    key={s.label}
                    className="bg-transparent border border-white/10 hover:border-primary/40 shadow-[0_0_30px_rgba(56,189,248,0.12)] hover:shadow-[0_0_45px_rgba(56,189,248,0.25)] transition"
                  >

                    <CardContent className="p-6 flex items-center gap-4">

                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">

                        <s.icon className="w-5 h-5 text-primary" />

                      </div>

                      <div>

                        <p className="text-2xl font-black font-mono">
                          {s.value}
                        </p>

                        <p className="text-xs text-foreground/60">
                          {s.label}
                        </p>

                      </div>

                    </CardContent>

                  </Card>

                ))}

              </div>

            </div>

            {/* SEVERITY CHART */}

            <Card className="mb-10 bg-transparent border border-white/10 shadow-[0_0_35px_rgba(56,189,248,0.12)]">

              <CardHeader>
                <CardTitle>Vulnerability Severity</CardTitle>
              </CardHeader>

              <CardContent>

                <ResponsiveContainer width="100%" height={260}>

                  <BarChart data={severityData} barSize={36}>

                    <CartesianGrid
                      strokeDasharray="3 6"
                      stroke="rgba(255,255,255,0.05)"
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#9ca3af"
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      stroke="#9ca3af"
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      contentStyle={{
                        background: "#020617",
                        border: "1px solid rgba(56,189,248,0.4)",
                        borderRadius: "10px"
                      }}
                    />

                    <Bar dataKey="count" radius={[12, 12, 0, 0]}>

                      {severityData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.fill}
                          style={{
                            filter: "drop-shadow(0px 0px 6px rgba(255,255,255,0.25))"
                          }}
                        />
                      ))}

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              </CardContent>

            </Card>

            {/* SCORE BREAKDOWN */}

            <Card className="mb-10 bg-transparent border border-white/10 shadow-[0_0_30px_rgba(56,189,248,0.1)]">

              <CardHeader>
                <CardTitle>Security Score Breakdown</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-sm font-mono">

                <div className="flex justify-between">
                  <span>Critical Vulnerabilities</span>
                  <span className="text-red-400">-{severity.critical * 15}</span>
                </div>

                <div className="flex justify-between">
                  <span>High Vulnerabilities</span>
                  <span className="text-red-400">-{severity.high * 10}</span>
                </div>

                <div className="flex justify-between">
                  <span>Medium Vulnerabilities</span>
                  <span className="text-yellow-400">-{severity.medium * 5}</span>
                </div>

                <div className="flex justify-between">
                  <span>Low Vulnerabilities</span>
                  <span className="text-blue-400">-{severity.low * 2}</span>
                </div>

                <div className="flex justify-between">
                  <span>Attack Paths</span>
                  <span className="text-red-400">-{attackPenalty}</span>
                </div>

                <div className="flex justify-between">
                  <span>Dependency Complexity</span>
                  <span className="text-orange-400">-{dependencyPenalty}</span>
                </div>

              </CardContent>

            </Card>

            {/* ATTACK PATHS */}

            {attackPaths.length > 0 && (

              <Card className="mb-10 bg-transparent border border-red-500/40 shadow-[0_0_35px_rgba(255,0,0,0.25)]">

                <CardHeader>
                  <CardTitle className="text-red-400">
                    ⚠ Supply Chain Attack Paths
                  </CardTitle>
                </CardHeader>

                <CardContent>

                  {attackPaths.map((path, index) => (

                    <div
                      key={index}
                      className="font-mono text-sm text-red-300 mb-2"
                    >
                      {path.join(" → ")}
                    </div>

                  ))}

                </CardContent>

              </Card>

            )}

            <div className="flex justify-center">

              <Button
                onClick={openGraph}
                className="gap-2 px-8 py-3 text-base"
              >

                <Network className="w-4 h-4" />
                View Dependency Graph

              </Button>

            </div>

          </motion.div>

        </div>

      </div>

    </PageTransition>

  );

};

export default Dashboard;