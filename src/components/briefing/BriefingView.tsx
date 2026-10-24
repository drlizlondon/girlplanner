import { BriefingRow, useBriefingSuggestions } from "@/hooks/useBriefings";
import { SuggestionCard } from "./SuggestionCard";
import { format } from "date-fns";

interface ProjectUpdate { project: string; updates: string[]; next_steps: string[]; }

function SectionHeader({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">{kicker}</div>
      <h2 className="mt-1 text-2xl font-serif-display text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export function BriefingView({ briefing }: { briefing: BriefingRow }) {
  const { suggestions, updateSuggestion } = useBriefingSuggestions(briefing.id);

  const byType = (t: string) => suggestions.filter((s) => s.type === t);
  const projectUpdates: ProjectUpdate[] = Array.isArray(briefing.project_updates)
    ? (briefing.project_updates as ProjectUpdate[])
    : [];

  return (
    <div className="space-y-12">
      {/* Executive Summary */}
      <section>
        <div className="glow-card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-hero)" }} />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">
              {format(new Date(briefing.briefing_date), "EEEE • d MMMM yyyy")}
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-serif-display text-foreground">Summary</h1>
            {briefing.overview && (
              <div className="mt-4 text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap max-w-3xl">
                {briefing.overview}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Priority Actions */}
      {byType("priority_action").length > 0 && (
        <section>
          <SectionHeader kicker="Review" title="Priority Actions" subtitle="Choose which become tasks." />
          <div className="grid gap-3">
            {byType("priority_action").map((s) => (
              <SuggestionCard key={s.id} suggestion={s} onChange={(id, patch) => updateSuggestion(id, patch)} />
            ))}
          </div>
        </section>
      )}

      {/* Follow Ups */}
      {byType("follow_up").length > 0 && (
        <section>
          <SectionHeader kicker="Lower Pressure" title="Follow Ups" />
          <div className="grid gap-3">
            {byType("follow_up").map((s) => (
              <SuggestionCard key={s.id} suggestion={s} onChange={(id, patch) => updateSuggestion(id, patch)} variant="soft" />
            ))}
          </div>
        </section>
      )}

      {/* Open Questions */}
      {byType("question").length > 0 && (
        <section>
          <SectionHeader kicker="Unresolved" title="Open Questions" />
          <div className="grid gap-3">
            {byType("question").map((s) => (
              <SuggestionCard key={s.id} suggestion={s} onChange={(id, patch) => updateSuggestion(id, patch)} variant="soft" />
            ))}
          </div>
        </section>
      )}

      {/* Parked Ideas */}
      {byType("idea").length > 0 && (
        <section>
          <SectionHeader kicker="Idea Vault" title="Parked Ideas" />
          <div className="grid gap-3 md:grid-cols-2">
            {byType("idea").map((s) => (
              <SuggestionCard key={s.id} suggestion={s} onChange={(id, patch) => updateSuggestion(id, patch)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}