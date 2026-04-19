import { PipelineProgress } from "@client/components";
import { useWelcomeMessage } from "@client/hooks/useWelcomeMessage";
import type { JobStatus } from "@shared/types.js";
import type React from "react";

interface OrchestratorSummaryProps {
  stats: Record<JobStatus, number>;
  isPipelineRunning: boolean;
}

export const OrchestratorSummary: React.FC<OrchestratorSummaryProps> = ({
  isPipelineRunning,
}) => {
  const welcomeText = useWelcomeMessage();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-xl font-bold tracking-tight">
          {welcomeText}
        </h1>
      </div>

      {isPipelineRunning && (
        <div className="max-w-3xl">
          <PipelineProgress isRunning={isPipelineRunning} />
        </div>
      )}
    </section>
  );
};
