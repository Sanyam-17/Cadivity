interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "emerald" | "amber" | "red";
}

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const colorMap = {
  primary: "bg-primary",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export function ProgressBar({
  value,
  className = "",
  showLabel = true,
  size = "md",
  color = "primary",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 rounded-full bg-muted overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`${sizeMap[size]} rounded-full ${colorMap[color]} transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground min-w-[3ch] text-right">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
