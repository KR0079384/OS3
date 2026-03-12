import { motion } from "framer-motion";
import { ScoreBar } from "@/components/ScoreBar";

const Intelligence = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-primary mb-4">Methodology</p>
          <h1 className="text-4xl font-semibold mb-4">How PULSE evaluates players</h1>
          <p className="text-lg text-muted-foreground">
            A transparent breakdown of the scoring dimensions that power selection intelligence.
          </p>
        </motion.div>

        {/* Scoring Dimensions */}
        <div className="space-y-12">
          {/* Final Score */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 rounded-lg border border-border bg-card"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Final Score</h2>
                <p className="text-sm text-muted-foreground max-w-xl">
                  The composite evaluation metric that combines all scoring dimensions into a single 
                  defensible number. This is the primary ranking signal used in selection contexts.
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-3xl text-primary">0-100</span>
                <p className="text-xs text-muted-foreground">scale</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <span className="text-xs text-muted-foreground">Excellent</span>
                <ScoreBar value={85} showValue={false} size="sm" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Good</span>
                <ScoreBar value={70} showValue={false} size="sm" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Average</span>
                <ScoreBar value={55} showValue={false} size="sm" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Below avg</span>
                <ScoreBar value={40} showValue={false} size="sm" />
              </div>
            </div>
          </motion.section>

          {/* Pressure Score */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 rounded-lg border border-border bg-card"
          >
            <h2 className="text-xl font-semibold mb-2">Pressure Score</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xl">
              Measures performance in high-stakes situations. For batters: contributions when the 
              team is under pressure (chasing, early wickets, tight finishes). For bowlers: 
              effectiveness in death overs and breakthrough moments.
            </p>
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div>
                <h3 className="text-sm font-medium mb-3">Batter pressure contexts</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Team 3+ wickets down early
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Chasing with required rate above 8
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Match-defining partnerships
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Bowler pressure contexts</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Death overs (16-20 in T20, 45-50 in ODI)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Breaking established partnerships
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Defending low totals
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Consistency Score */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="p-6 rounded-lg border border-border bg-card"
          >
            <h2 className="text-xl font-semibold mb-2">Consistency Score</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xl">
              Evaluates the variance in performance across matches. A player who delivers 40-60 
              regularly scores higher than one who alternates between 0 and 100. Penalizes 
              volatility, rewards reliability.
            </p>
            <div className="flex items-center gap-8 pt-4 border-t border-border">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">High consistency example</p>
                <div className="flex items-end gap-1 h-12">
                  {[45, 52, 48, 55, 50, 47, 53, 49].map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/60 rounded-t"
                      style={{ height: `${v}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">Low consistency example</p>
                <div className="flex items-end gap-1 h-12">
                  {[90, 10, 75, 5, 85, 15, 95, 8].map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-score-average/60 rounded-t"
                      style={{ height: `${v}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Opposition Quality Score */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="p-6 rounded-lg border border-border bg-card"
          >
            <h2 className="text-xl font-semibold mb-2">Opposition Quality Score</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xl">
              Weights performance based on the strength of opposition faced. Runs against a 
              top-tier Ranji attack carry more weight than runs against weaker bowling units. 
              Contextualizes raw numbers.
            </p>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Opposition tiers (example)</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-muted-foreground">Tier 1</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full" />
                  </div>
                  <span className="text-xs text-muted-foreground">1.5x weight</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-muted-foreground">Tier 2</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 w-3/4" />
                  </div>
                  <span className="text-xs text-muted-foreground">1.2x weight</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-muted-foreground">Tier 3</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 w-1/2" />
                  </div>
                  <span className="text-xs text-muted-foreground">1.0x weight</span>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Explainability Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-16 p-6 rounded-lg border border-primary/20 bg-accent/30"
        >
          <h3 className="text-sm font-semibold text-primary mb-2">On explainability</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every number in PULSE traces back to real match data. There are no hidden weights, 
            no unexplainable adjustments. When a selector asks "why does this player score 82?", 
            the answer is decomposable into the four dimensions above. This is cricket intelligence 
            you can defend in any selection meeting.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Intelligence;
