import type { JobSource } from "@shared/types.js";
import * as api from "@client/api";
import {
  Bell,
  Loader2,
  LogOut,
  Play,
  Search,
  Settings,
  Square,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OrchestratorHeaderProps {
  navOpen: boolean;
  onNavOpenChange: (open: boolean) => void;
  isPipelineRunning: boolean;
  isCancelling: boolean;
  pipelineSources: JobSource[];
  onOpenAutomaticRun: () => void;
  onCancelPipeline: () => void;
  onOpenSearch?: () => void;
}

export const OrchestratorHeader: React.FC<OrchestratorHeaderProps> = ({
  navOpen: _navOpen,
  onNavOpenChange: _onNavOpenChange,
  isPipelineRunning,
  isCancelling,
  pipelineSources,
  onOpenAutomaticRun,
  onCancelPipeline,
  onOpenSearch,
}) => {
  const handleLogout = () => {
    void api.logout();
  };

  const actions = isPipelineRunning ? (
    <Button
      size="sm"
      onClick={onCancelPipeline}
      disabled={isCancelling}
      variant="destructive"
      className="h-9 gap-2 rounded-full px-5 text-xs sm:text-sm"
    >
      {isCancelling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Square className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {isCancelling ? `Cancelling (${pipelineSources.length})` : `Cancel run`}
      </span>
    </Button>
  ) : (
    <Button
      size="sm"
      onClick={onOpenAutomaticRun}
      className="h-10 gap-2 rounded-full px-5 text-xs font-semibold sm:text-sm"
    >
      <Play className="h-4 w-4" />
      <span className="hidden sm:inline">Run pipeline</span>
    </Button>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-border/80 bg-card/72 px-4 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex h-full items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-6">
          <div className="flex shrink-0 flex-col leading-tight">
            <span className="font-headline text-xl font-bold tracking-tight text-foreground">
              JobOps
            </span>
            <span className="-mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary/85">
              Orchestrator
            </span>
          </div>
          <div className="relative hidden w-64 lg:flex">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search pipelines"
              placeholder="Search pipelines..."
              className="h-10 rounded-2xl border-border/80 bg-card/78 pl-9 pr-3 text-sm shadow-none"
              onFocus={() => onOpenSearch?.()}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isPipelineRunning && (
            <span className="hidden rounded-full border border-amber-500/25 bg-amber-400/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 md:inline-flex">
              Pipeline Running
            </span>
          )}
          {actions}
          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/70 text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground",
              "hidden sm:inline-flex",
            )}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/70 text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground",
              "hidden sm:inline-flex",
            )}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-9 gap-2 rounded-full px-4 text-xs font-semibold sm:text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
          <div className="h-10 w-10 overflow-hidden rounded-full border border-border/80 bg-card shadow-sm">
            <img
              alt="User profile"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDk84qj7bVFXIEIylJ2H9JctUpIBppZHQEc1SESH3yEqKe0cM9axOlzyUC1M0H-pDEe2oSypZobUuXMv6nF4TmFJM0k2wvBKcctQbUI2b_3Gr-dnKDjF1s16kkdEvskAqSZhg8veu95u6XXzwM-rg2FoTWXmIvyiOPi4slaIb9g_Tpiidit31SpRRPAr0R3Zlee4NXhhjbsDZ-jtUMKg2t26IyicBfIZ1gKowiGjhjjp9mQYLUTWjjD6dp8X1CgxJatSoxWF3hEauSR"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
