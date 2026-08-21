import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  showLabel?: boolean;
  color?: "primary" | "success" | "warning" | "danger";
}

const colorMap = {
  primary: "bg-primary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, showLabel = false, color = "primary", ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div className={cn("flex items-center gap-3", className)} {...props}>
        <div
          ref={ref}
          className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              colorMap[color]
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
        {showLabel && (
          <span className="min-w-[3rem] text-sm font-medium text-gray-700">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
