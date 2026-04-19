import type { Job } from "@shared/types.js";
import { Sparkles } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface FitAssessmentProps {
  job: Job;
  className?: string;
}

export const FitAssessment: React.FC<FitAssessmentProps> = ({
  job,
  className,
}) => {
  if (!job.suitabilityReason) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5">
        <div className="text-[11px] font-medium uppercase tracking-wide text-primary/70 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Fit Assessment
        </div>
        <p className="whitespace-pre-wrap text-xs font-medium leading-relaxed text-foreground/90">
          {job.suitabilityReason}
        </p>
      </div>
    </div>
  );
};
