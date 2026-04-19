import type { Job } from "@shared/types.js";
import type React from "react";
import { cn } from "@/lib/utils";

interface TailoredSummaryProps {
  job: Job;
  className?: string;
}

export const TailoredSummary: React.FC<TailoredSummaryProps> = ({
  job,
  className,
}) => {
  if (!job.tailoredSummary) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/35 px-3 py-2.5",
        className,
      )}
    >
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
        Tailored Summary
      </div>
      <p className="whitespace-pre-wrap text-xs italic leading-relaxed text-foreground/80">
        "{job.tailoredSummary}"
      </p>
    </div>
  );
};
