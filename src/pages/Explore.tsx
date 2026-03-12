import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScoreBar } from "@/components/ScoreBar";
import { batters, bowlers, type Batter, type Bowler } from "@/data/players";
import { cn } from "@/lib/utils";

type PlayerType = "batters" | "bowlers";
type SortField = "finalScore" | "pressureScore" | "consistencyScore" | "oppositionQualityScore" | "runs";
type SortDirection = "asc" | "desc";

const Explore = () => {
  const [playerType, setPlayerType] = useState<PlayerType>("batters");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("finalScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter thresholds
  const [minFinalScore, setMinFinalScore] = useState(0);
  const [minPressure, setMinPressure] = useState(0);
  const [minConsistency, setMinConsistency] = useState(0);
  const [minOpposition, setMinOpposition] = useState(0);

  const filteredBatters = useMemo(() => {
    return batters
      .filter((p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (teamFilter !== "all" && p.team !== teamFilter) return false;
        if (p.finalScore < minFinalScore) return false;
        if (p.pressureScore < minPressure) return false;
        if (p.consistencyScore < minConsistency) return false;
        if (p.oppositionQualityScore < minOpposition) return false;
        return true;
      })
      .sort((a, b) => {
        const aVal = a[sortField as keyof Batter] as number;
        const bVal = b[sortField as keyof Batter] as number;
        return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
      });
  }, [search, teamFilter, minFinalScore, minPressure, minConsistency, minOpposition, sortField, sortDirection]);

  const filteredBowlers = useMemo(() => {
    return bowlers
      .filter((p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (teamFilter !== "all" && p.team !== teamFilter) return false;
        if (p.finalScore < minFinalScore) return false;
        if (p.pressureScore < minPressure) return false;
        if (p.consistencyScore < minConsistency) return false;
        if (p.oppositionQualityScore < minOpposition) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortField === "runs") return 0; // Runs not applicable to bowlers
        const aVal = a[sortField as keyof Bowler] as number;
        const bVal = b[sortField as keyof Bowler] as number;
        return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
      });
  }, [search, teamFilter, minFinalScore, minPressure, minConsistency, minOpposition, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "desc" ? (
      <ChevronDown className="w-3 h-3 ml-1" />
    ) : (
      <ChevronUp className="w-3 h-3 ml-1" />
    );
  };

  const resetFilters = () => {
    setMinFinalScore(0);
    setMinPressure(0);
    setMinConsistency(0);
    setMinOpposition(0);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="text-xs uppercase tracking-widest text-primary mb-2">Scouting</p>
          <h1 className="text-3xl font-semibold">Explore Players</h1>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Tabs */}
            <Tabs value={playerType} onValueChange={(v) => setPlayerType(v as PlayerType)}>
              <TabsList className="bg-muted">
                <TabsTrigger value="batters" className="data-[state=active]:bg-card">
                  Batters
                </TabsTrigger>
                <TabsTrigger value="bowlers" className="data-[state=active]:bg-card">
                  Bowlers
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>

            {/* Team filter */}
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue placeholder="All teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All teams</SelectItem>
                <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                <SelectItem value="Kerala">Kerala</SelectItem>
              </SelectContent>
            </Select>

            {/* Filters toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-accent")}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Minimum thresholds</span>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Final Score ≥ {minFinalScore}
                  </label>
                  <Slider
                    value={[minFinalScore]}
                    onValueChange={(v) => setMinFinalScore(v[0])}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Pressure ≥ {minPressure}
                  </label>
                  <Slider
                    value={[minPressure]}
                    onValueChange={(v) => setMinPressure(v[0])}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Consistency ≥ {minConsistency}
                  </label>
                  <Slider
                    value={[minConsistency]}
                    onValueChange={(v) => setMinConsistency(v[0])}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Opposition Quality ≥ {minOpposition}
                  </label>
                  <Slider
                    value={[minOpposition]}
                    onValueChange={(v) => setMinOpposition(v[0])}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-lg border border-border bg-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            {playerType === "batters" ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-12">#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th className="text-right">Mat</th>
                    <th
                      className="text-right cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("runs")}
                    >
                      <span className="inline-flex items-center">
                        Runs
                        <SortIcon field="runs" />
                      </span>
                    </th>
                    <th className="text-right">SR</th>
                    <th
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("finalScore")}
                    >
                      <span className="inline-flex items-center">
                        Final Score
                        <SortIcon field="finalScore" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("pressureScore")}
                    >
                      <span className="inline-flex items-center">
                        Pressure
                        <SortIcon field="pressureScore" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("consistencyScore")}
                    >
                      <span className="inline-flex items-center">
                        Consistency
                        <SortIcon field="consistencyScore" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("oppositionQualityScore")}
                    >
                      <span className="inline-flex items-center">
                        Opposition
                        <SortIcon field="oppositionQualityScore" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatters.map((player, index) => (
                    <tr key={player.id}>
                      <td className="font-mono text-muted-foreground">{index + 1}</td>
                      <td className="font-medium">{player.name}</td>
                      <td className="text-muted-foreground">{player.team}</td>
                      <td className="text-right font-mono">{player.matches}</td>
                      <td className="text-right font-mono">{player.runs.toLocaleString()}</td>
                      <td className="text-right font-mono text-muted-foreground">{player.strikeRate}</td>
                      <td className="w-40">
                        <ScoreBar value={player.finalScore} size="sm" />
                      </td>
                      <td className="w-36">
                        <ScoreBar value={player.pressureScore} size="sm" />
                      </td>
                      <td className="w-36">
                        <ScoreBar value={player.consistencyScore} size="sm" />
                      </td>
                      <td className="w-36">
                        <ScoreBar value={player.oppositionQualityScore} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-12">#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th className="text-right">Mat</th>
                    <th
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("finalScore")}
                    >
                      <span className="inline-flex items-center">
                        Final Score
                        <SortIcon field="finalScore" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("pressureScore")}
                    >
                      <span className="inline-flex items-center">
                        Pressure
                        <SortIcon field="pressureScore" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("consistencyScore")}
                    >
                      <span className="inline-flex items-center">
                        Consistency
                        <SortIcon field="consistencyScore" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("oppositionQualityScore")}
                    >
                      <span className="inline-flex items-center">
                        Opposition
                        <SortIcon field="oppositionQualityScore" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBowlers.map((player, index) => (
                    <tr key={player.id}>
                      <td className="font-mono text-muted-foreground">{index + 1}</td>
                      <td className="font-medium">{player.name}</td>
                      <td className="text-muted-foreground">{player.team}</td>
                      <td className="text-right font-mono">{player.matches}</td>
                      <td className="w-40">
                        <ScoreBar value={player.finalScore} size="sm" />
                      </td>
                      <td className="w-36">
                        <ScoreBar value={player.pressureScore} size="sm" />
                      </td>
                      <td className="w-36">
                        <ScoreBar value={player.consistencyScore} size="sm" />
                      </td>
                      <td className="w-36">
                        <ScoreBar value={player.oppositionQualityScore} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Empty state */}
          {((playerType === "batters" && filteredBatters.length === 0) ||
            (playerType === "bowlers" && filteredBowlers.length === 0)) && (
            <div className="py-12 text-center text-muted-foreground">
              No players match the current filters.
            </div>
          )}
        </motion.div>

        {/* Results count */}
        <div className="mt-4 text-sm text-muted-foreground">
          {playerType === "batters"
            ? `${filteredBatters.length} of ${batters.length} batters`
            : `${filteredBowlers.length} of ${bowlers.length} bowlers`}
        </div>
      </div>
    </div>
  );
};

export default Explore;
