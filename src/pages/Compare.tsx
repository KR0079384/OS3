import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { batters, bowlers, type Batter, type Bowler } from "@/data/players";
import { cn } from "@/lib/utils";

type PlayerType = "batters" | "bowlers";

const getScoreColor = (value: number): string => {
  if (value >= 80) return "bg-score-excellent";
  if (value >= 65) return "bg-score-good";
  if (value >= 50) return "bg-score-average";
  if (value >= 35) return "bg-score-poor";
  return "bg-score-critical";
};

const Compare = () => {
  const [playerType, setPlayerType] = useState<PlayerType>("batters");
  const [player1Id, setPlayer1Id] = useState<string>("");
  const [player2Id, setPlayer2Id] = useState<string>("");

  const players = playerType === "batters" ? batters : bowlers;
  const player1 = players.find((p) => p.id === player1Id);
  const player2 = players.find((p) => p.id === player2Id);

  const comparison = useMemo(() => {
    if (!player1 || !player2) return null;

    const metrics = [
      { key: "finalScore", label: "Final Score" },
      { key: "pressureScore", label: "Pressure" },
      { key: "consistencyScore", label: "Consistency" },
      { key: "oppositionQualityScore", label: "Opposition Quality" },
    ] as const;

    let player1Wins = 0;
    let player2Wins = 0;
    let totalDiff = 0;

    const details = metrics.map((m) => {
      const v1 = player1[m.key];
      const v2 = player2[m.key];
      const diff = v1 - v2;
      totalDiff += diff;
      if (diff > 0) player1Wins++;
      else if (diff < 0) player2Wins++;
      return { ...m, v1, v2, diff };
    });

    let verdict: "player1" | "player2" | "even" = "even";
    if (player1Wins > player2Wins) verdict = "player1";
    else if (player2Wins > player1Wins) verdict = "player2";
    else if (totalDiff > 0) verdict = "player1";
    else if (totalDiff < 0) verdict = "player2";

    const magnitude = Math.abs(totalDiff / metrics.length);
    let confidence: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (magnitude >= 10) confidence = "HIGH";
    else if (magnitude >= 5) confidence = "MEDIUM";

    return { details, verdict, confidence, magnitude, player1Wins, player2Wins };
  }, [player1, player2]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="text-xs uppercase tracking-widest text-primary mb-2">Analysis</p>
          <h1 className="text-3xl font-semibold">Compare Players</h1>
          <p className="text-muted-foreground mt-2">
            Head-to-head metric comparison for selection decisions.
          </p>
        </motion.div>

        {/* Player Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <Tabs
            value={playerType}
            onValueChange={(v) => {
              setPlayerType(v as PlayerType);
              setPlayer1Id("");
              setPlayer2Id("");
            }}
          >
            <TabsList className="bg-muted">
              <TabsTrigger value="batters" className="data-[state=active]:bg-card">
                Batters
              </TabsTrigger>
              <TabsTrigger value="bowlers" className="data-[state=active]:bg-card">
                Bowlers
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Player Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-2 block">Player 1</label>
              <Select value={player1Id} onValueChange={setPlayer1Id}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select player..." />
                </SelectTrigger>
                <SelectContent>
                  {players
                    .filter((p) => p.id !== player2Id)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.team})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-6">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-2 block">Player 2</label>
              <Select value={player2Id} onValueChange={setPlayer2Id}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select player..." />
                </SelectTrigger>
                <SelectContent>
                  {players
                    .filter((p) => p.id !== player1Id)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.team})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Comparison View */}
        {player1 && player2 && comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Player Headers */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <div className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-lg font-semibold">{player1.name}</p>
                <p className="text-sm text-muted-foreground">{player1.team}</p>
                <p className="font-mono text-2xl text-primary mt-2">{player1.finalScore}</p>
              </div>
              <div className="px-4">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-lg font-semibold">{player2.name}</p>
                <p className="text-sm text-muted-foreground">{player2.team}</p>
                <p className="font-mono text-2xl text-primary mt-2">{player2.finalScore}</p>
              </div>
            </div>

            {/* Metric Bars */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              {comparison.details.map((metric, index) => (
                <div
                  key={metric.key}
                  className={cn("p-4", index !== comparison.details.length - 1 && "border-b border-border")}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm">{metric.v1}</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      {metric.label}
                    </span>
                    <span className="font-mono text-sm">{metric.v2}</span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    {/* Center line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />

                    {/* Player 1 bar (from center to left) */}
                    <div
                      className={cn("absolute right-1/2 h-full rounded-l-full transition-all duration-500", getScoreColor(metric.v1))}
                      style={{ width: `${(metric.v1 / 200) * 100}%` }}
                    />

                    {/* Player 2 bar (from center to right) */}
                    <div
                      className={cn("absolute left-1/2 h-full rounded-r-full transition-all duration-500", getScoreColor(metric.v2))}
                      style={{ width: `${(metric.v2 / 200) * 100}%` }}
                    />
                  </div>
                  {/* Advantage indicator */}
                  {metric.diff !== 0 && (
                    <div className="flex justify-center mt-2">
                      <span
                        className={cn(
                          "text-xs font-mono",
                          metric.diff > 0 ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {metric.diff > 0 ? `+${metric.diff} ${player1.name.split(" ")[1]}` : ""}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-mono",
                          metric.diff < 0 ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {metric.diff < 0 ? `+${Math.abs(metric.diff)} ${player2.name.split(" ")[1]}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Verdict */}
            <div className="p-6 rounded-lg border border-primary/20 bg-accent/30">
              <h3 className="text-sm font-semibold text-primary mb-4">Selection Verdict</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Advantage</span>
                  <span className="text-lg font-semibold">
                    {comparison.verdict === "even"
                      ? "Even"
                      : comparison.verdict === "player1"
                      ? player1.name
                      : player2.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Metrics Won</span>
                  <span className="font-mono">
                    {comparison.player1Wins} - {comparison.player2Wins}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Confidence</span>
                  <span
                    className={cn(
                      "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                      comparison.confidence === "HIGH" && "bg-primary/20 text-primary",
                      comparison.confidence === "MEDIUM" && "bg-score-average/20 text-score-average",
                      comparison.confidence === "LOW" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {comparison.confidence}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {comparison.verdict === "even"
                  ? "Both players are closely matched across all metrics. Consider other factors like form, fitness, or team balance."
                  : comparison.confidence === "HIGH"
                  ? `${comparison.verdict === "player1" ? player1.name : player2.name} shows a clear advantage across key metrics.`
                  : `Marginal advantage to ${comparison.verdict === "player1" ? player1.name : player2.name}. Further analysis recommended.`}
              </p>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {(!player1 || !player2) && (
          <div className="py-20 text-center">
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Select two players to compare</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
