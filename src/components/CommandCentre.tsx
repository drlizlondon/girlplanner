import { format } from "date-fns";
import {
  FileText, HelpCircle, Sparkles, Briefcase, Hourglass,
} from "lucide-react";
import { CurrentAgendaModule } from "./modules/CurrentAgendaModule";
import { ProcessingInboxModule } from "./modules/ProcessingInboxModule";
import { QuickCaptureModule } from "./modules/QuickCaptureModule";
import { PeopleModule } from "./modules/PeopleModule";
import { OpportunitiesModule, IdeasModule } from "./modules/OpportunitiesModule";
import { RecentActivityModule } from "./modules/RecentActivityModule";
import { BriefingsArchiveModule } from "./modules/BriefingsArchiveModule";
import { SimpleListModule } from "./modules/SimpleListModule";

export default function CommandCentre() {
  return (
    <div className="px-3 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
      {/* Hero */}
      <div className="mb-8 px-1">
        <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">
          {format(new Date(), "EEEE • d MMMM yyyy")}
        </div>
        <h1 className="mt-1 text-4xl sm:text-5xl font-serif-display text-foreground leading-tight">Founder OS</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Modular executive operating system. The Agenda holds what's in flight. Everything else supports it.
        </p>
      </div>

      {/* 12-col modular grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <QuickCaptureModule span={12} />

        <CurrentAgendaModule span={8} />
        <ProcessingInboxModule span={4} />

        <CurrentAgendaModule focusOnly span={6} />
        <SimpleListModule
          table="waiting_on"
          title="Waiting On"
          kicker="External, not yours yet"
          icon={Hourglass}
          accent="coral"
          placeholder="Who or what are you waiting on?"
          emptyHint="Track replies, deliverables, and external dependencies."
          span={6}
          extraColumn={(r) => r.who || null}
        />

        <SimpleListModule
          table="projects"
          title="Active Projects"
          kicker="Workspaces"
          icon={Briefcase}
          accent="blue"
          placeholder="Project name…"
          emptyHint="Spin up a project shell. Add detail when it matters."
          span={6}
          href="/projects"
        />
        <PeopleModule span={6} />

        <OpportunitiesModule span={6} />
        <IdeasModule span={6} />

        <SimpleListModule
          table="strategic_signals"
          title="Strategic Signals"
          kicker="Patterns worth noticing"
          icon={Sparkles}
          accent="green"
          placeholder="Observation, signal, or pattern…"
          emptyHint="Notice what's shifting. Decisions later."
          span={4}
        />
        <SimpleListModule
          table="open_questions"
          title="Open Questions"
          kicker="Unresolved"
          icon={HelpCircle}
          accent="purple"
          placeholder="What are you still figuring out?"
          emptyHint="Sit with the unresolved. Not everything needs an answer today."
          span={4}
        />
        <SimpleListModule
          table="notes"
          title="Quick Notes"
          kicker="Lightweight"
          icon={FileText}
          accent="blue"
          placeholder="A note for later…"
          emptyHint="Loose thoughts. No structure required."
          span={4}
        />

        <RecentActivityModule span={6} />
        <BriefingsArchiveModule span={6} />
      </div>
    </div>
  );
}