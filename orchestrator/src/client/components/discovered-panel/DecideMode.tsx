import { useSettings } from "@client/hooks/useSettings";
import type { Job } from "@shared/types.js";
import {
  ChevronUp,
  Edit2,
  Loader2,
  RefreshCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { JobDescriptionMarkdown } from "@/client/components/JobDescriptionMarkdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { FitAssessment, JobHeader, TailoredSummary } from "..";
import { KbdHint } from "../KbdHint";
import { OpenJobListingButton } from "../OpenJobListingButton";
import { CollapsibleSection } from "./CollapsibleSection";
import { getRenderableJobDescription } from "./helpers";

interface DecideModeProps {
  job: Job;
  onTailor: () => void;
  onSkip: () => void;
  isSkipping: boolean;
  onRescore: () => void;
  isRescoring: boolean;
  onEditDetails: () => void;
}

export const DecideMode: React.FC<DecideModeProps> = ({
  job,
  onTailor,
  onSkip,
  isSkipping,
  onRescore,
  isRescoring,
  onEditDetails,
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const jobLink = job.applicationLink || job.jobUrl;
  const { renderMarkdownInJobDescriptions } = useSettings();
  const handleEditDetailsSelect = () => {
    window.setTimeout(() => onEditDetails(), 0);
  };

  const description = useMemo(
    () => getRenderableJobDescription(job.jobDescription),
    [job.jobDescription],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 pb-4">
        <JobHeader job={job} />

        <div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
          {jobLink ? (
            <OpenJobListingButton
              href={jobLink}
              className="flex-1 h-11 text-sm sm:h-10 sm:text-xs"
            />
          ) : null}
          <Button
            variant="outline"
            size="default"
            onClick={onSkip}
            disabled={isSkipping}
            className="h-11 flex-1 text-sm text-muted-foreground hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 sm:h-10 sm:text-xs"
          >
            {isSkipping ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Skip Job
            <KbdHint shortcut="s" className="ml-1.5" />
          </Button>
          <Button
            size="default"
            onClick={onTailor}
            className="h-11 flex-1 bg-primary text-sm shadow-[0_12px_20px_-16px_hsl(var(--primary))] hover:bg-primary/92 sm:h-10 sm:text-xs"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Start Tailoring
            <KbdHint shortcut="t" className="ml-1.5" />
          </Button>
        </div>
      </div>

      <Separator className="opacity-50" />

      <div className="flex-1 space-y-6 overflow-y-auto py-6">
        <FitAssessment job={job} />
        <TailoredSummary job={job} />

        <CollapsibleSection
          isOpen={showDescription}
          onToggle={() => setShowDescription((prev) => !prev)}
          label={`${showDescription ? "Hide" : "View"} Full Job Description`}
        >
          <div className="mt-2 max-h-[400px] overflow-y-auto rounded-xl border border-border/60 bg-muted/35 p-4 shadow-inner">
            {renderMarkdownInJobDescriptions ? (
              <JobDescriptionMarkdown description={description} />
            ) : (
              <p className="text-xs text-muted-foreground/90 whitespace-pre-wrap leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </CollapsibleSection>
      </div>

      <Separator className="opacity-50" />

      <div className="space-y-4 pb-2 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 gap-2 text-xs text-muted-foreground hover:text-foreground justify-center"
            >
              More actions
              <ChevronUp className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuItem onSelect={handleEditDetailsSelect}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onRescore} disabled={isRescoring}>
              <RefreshCcw
                className={
                  isRescoring ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"
                }
              />
              {isRescoring ? "Recalculating..." : "Recalculate match"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
