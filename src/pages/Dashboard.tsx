import { motion } from "framer-motion";
import { Package, AlertTriangle, CheckCircle, XCircle, Activity, Network } from "lucide-react";
import cyberBgVideo from "@/assets/cyber-bg-video.mp4";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import PageTransition from "@/components/PageTransition";
import { useLocation, useNavigate } from "react-router-dom";

const Dashboard = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const dependencies = location.state?.dependencies ?? 0;
  const vulnerabilities = location.state?.vulnerabilities ?? 0;
  const securityScore = location.state?.securityScore ?? 0;
  const status = location.state?.status ?? "Unknown";
  const graph = location.state?.graph ?? null;

  const safePackages = Math.max(0, dependencies - vulnerabilities);
  const highRisk = Math.floor(vulnerabilities / 2);

  const getScoreColor = (s: number) =>
    s >= 80
      ? "hsl(145 80% 50%)"
      : s >= 60
      ? "hsl(45 100% 55%)"
      : s >= 40
      ? "hsl(20 85% 50%)"
      : "hsl(0 85% 55%)";

  const scoreColor = getScoreColor(securityScore);

  const stats = [
    { label: "Total Dependencies", value: dependencies, icon: Package, color: "text-primary", bgColor: "bg-primary/10 border-primary/20" },
    { label: "Safe Packages", value: safePackages, icon: CheckCircle, color: "text-neon-green", bgColor: "bg-neon-green/10 border-neon-green/20" },
    { label: "Vulnerable", value: vulnerabilities, icon: AlertTriangle, color: "text-neon-yellow", bgColor: "bg-neon-yellow/10 border-neon-yellow/20" },
    { label: "High Risk", value: highRisk, icon: XCircle, color: "text-neon-red", bgColor: "bg-neon-red/10 border-neon-red/20" },
  ];

  const pieData = [
    { name: "Safe", value: safePackages, color: "hsl(145 80% 50%)" },
    { name: "Vulnerable", value: vulnerabilities, color: "hsl(45 100% 55%)" },
  ];

  const severityData = [
    { name: "Critical", count: Math.floor(vulnerabilities / 3), fill: "hsl(0 85% 55%)" },
    { name: "High", count: Math.floor(vulnerabilities / 2), fill: "hsl(20 85% 50%)" },
    { name: "Medium", count: Math.floor(vulnerabilities / 2), fill: "hsl(45 100% 55%)" },
    { name: "Low", count: Math.max(0, vulnerabilities - 2), fill: "hsl(195 100% 50%)" },
  ];

  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (securityScore / 100) * circumference;

  const openGraph = () => {
    navigate("/graph", {
      state: { graph }
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">

        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" src={cyberBgVideo} />

        <div className="absolute inset-0 bg-background/80 z-[1]" />
        <div className="absolute inset-0 cyber-grid z-[2]" />

        <div className="container relative z-[3]">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            <div className="flex items-center gap-3 mb-1">
              <Activity className="w-6 h-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Security Score <span className="text-primary">Dashboard</span>
              </h1>
            </div>

            <p className="text-foreground/60 text-sm mb-6">
              Project analysis results
            </p>

            <Badge className="mb-8 bg-primary/10 border-primary/20 text-primary">
              Risk Status: {status}
            </Badge>

            {/* Score + Stats */}

            <div className="grid lg:grid-cols-3 gap-6 mb-8">

              <Card className="lg:col-span-1 bg-card/40 backdrop-blur-sm border-border/50">
                <CardContent className="p-8 flex flex-col items-center justify-center">

                  <div className="relative w-48 h-48">

                    <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">

                      <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(222 30% 12%)" strokeWidth="12" />

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
                        transition={{ duration: 1.5 }}
                      />

                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">

                      <span className="text-5xl font-black font-mono" style={{ color: scoreColor }}>
                        {securityScore}
                      </span>

                      <span className="text-xs text-foreground/50 mt-1">
                        / 100
                      </span>

                    </div>

                  </div>

                </CardContent>
              </Card>

              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">

                {stats.map((s, i) => (

                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >

                    <Card className="bg-card/40 backdrop-blur-sm border-border/50">

                      <CardContent className="p-5 flex items-center gap-4">

                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${s.bgColor}`}>
                          <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>

                        <div>
                          <p className="text-2xl font-black font-mono text-foreground">{s.value}</p>
                          <p className="text-xs text-foreground/60">{s.label}</p>
                        </div>

                      </CardContent>

                    </Card>

                  </motion.div>

                ))}

              </div>

            </div>

            {/* Charts */}

            <div className="grid lg:grid-cols-2 gap-6">

              <Card className="bg-card/40 backdrop-blur-sm border-border/50">

                <CardHeader>
                  <CardTitle>Dependency Health</CardTitle>
                </CardHeader>

                <CardContent>

                  <ResponsiveContainer width="100%" height={220}>

                    <PieChart>

                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">

                        {pieData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}

                      </Pie>

                    </PieChart>

                  </ResponsiveContainer>

                </CardContent>

              </Card>

              <Card className="bg-card/40 backdrop-blur-sm border-border/50">

                <CardHeader>
                  <CardTitle>Vulnerability Severity</CardTitle>
                </CardHeader>

                <CardContent>

                  <ResponsiveContainer width="100%" height={220}>

                    <BarChart data={severityData}>

                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="name" />

                      <YAxis />

                      <Tooltip />

                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>

                        {severityData.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}

                      </Bar>

                    </BarChart>

                  </ResponsiveContainer>

                </CardContent>

              </Card>

            </div>

            {/* Graph Button */}

            <div className="mt-8 flex justify-center">

              <Button onClick={openGraph} className="gap-2">

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