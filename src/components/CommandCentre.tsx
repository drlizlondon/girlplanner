import { format } from "date-fns";
import { Mic, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { CurrentAgendaModule } from "./modules/CurrentAgendaModule";
import { ProcessingInboxModule } from "./modules/ProcessingInboxModule";
import { QuickCaptureModule } from "./modules/QuickCaptureModule";
import { RecentActivityModule } from "./modules/RecentActivityModule";
import { BriefingsArchiveModule } from "./modules/BriefingsArchiveModule";

export default function CommandCentre() {
  return (
    <div className="px-3 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
      {/* Hero */}
      <div className="mb-8 px-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">
          {format(new Date(), "EEEE • d MMMM yyyy")}
        </div>
        <h1 className="mt-1 text-4xl sm:text-5xl font-serif-display text-foreground leading-tight">
          GirlPlanner
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground max-w-2xl">
          Executive voice-to-agenda operating system. Speak your mind during the day; wake up to an actionable, prioritized plan.
        </p>
      </div>

      {/* Voice Setup Automation Banner */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                Voice-to-Planner Automation (Free Gemini AI)
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" /> 4 Easy Steps
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Set up your iPhone or phone to dictate messy thoughts and wake up to neatly structured daily tasks.
            </p>
          </div>
        </div>
        <Link
          to="/guide"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:opacity-90 shadow-sm transition-opacity"
        >
          View Setup Guide <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Core Operational Loop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <QuickCaptureModule span={12} />

        <CurrentAgendaModule span={8} />
        <ProcessingInboxModule span={4} />

        <RecentActivityModule span={6} />
        <BriefingsArchiveModule span={6} />
      </div>
    </div>
  );
}