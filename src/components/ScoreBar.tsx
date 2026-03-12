import { cn } from "@/lib/utils";

interface ScoreBarProps {
  value: number;
  maxValue?: number;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const getScoreColor = (value: number): string => {
  if (value >= 80) return "bg-score-excellent";
  if (value >= 65) return "bg-score-good";
  if (value >= 50) return "bg-score-average";
  if (value >= 35) return "bg-score-poor";
  return "bg-score-critical";
};

const getScoreTextColor = (value: number): string => {
  if (value >= 80) return "score-excellent";
  if (value >= 65) return "score-good";
  if (value >= 50) return "score-average";
  if (value >= 35) return "score-poor";
  return "score-critical";
};

export const ScoreBar = ({
  value,
  maxValue = 100,
  showValue = true,
  size = "md",
  className,
}: ScoreBarProps) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("metric-bar flex-1", sizeClasses[size])}>
        <div
          className={cn("metric-bar-fill", getScoreColor(value))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className={cn("font-mono text-sm font-medium w-8 text-right", getScoreTextColor(value))}>
          {value}
        </span>
      )}
    </div>
  );
};

export const ScoreDisplay = ({
  value,
  label,
  size = "md",
}: {
  value: number;
  label: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("font-mono font-semibold", sizeClasses[size], getScoreTextColor(value))}>
        {value}
      </span>
    </div>
  );
};
