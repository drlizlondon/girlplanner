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
            <h1 className="mt-2 text-3xl sm:text-4xl font-serif-display text-foreground">Executive Summary</h1>
            {briefing.overview && (
              <div className="mt-4 text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap max-w-3xl">
                {briefing.overview}
              </div>
            )}
            {briefing.executive_signals && (
              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Executive Signals</div>
                <div className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap max-w-3xl">
                  {briefing.executive_signals}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Priority Actions */}
      {byType("priority_action").length > 0 && (
        <section>
          <SectionHeader kicker="Review" title="Priority Actions" subtitle="Decide what becomes part of your trusted system." />
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

      {/* Project Updates */}
      {projectUpdates.length > 0 && (
        <section>
          <SectionHeader kicker="State of Play" title="Project Updates" />
          <div className="grid gap-4 md:grid-cols-2">
            {projectUpdates.map((p, i) => (
              <div key={i} className="glow-card p-5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-primary/80 mb-1">Project</div>
                <h3 className="text-lg font-medium text-foreground mb-3">{p.project}</h3>
                {p.updates.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5">Updates</div>
                    <ul className="space-y-1.5 text-sm text-foreground/85">
                      {p.updates.map((u, j) => <li key={j} className="leading-relaxed">— {u}</li>)}
                    </ul>
                  </div>
                )}
                {p.next_steps.length > 0 && (
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5">Next Steps</div>
                    <ul className="space-y-1.5 text-sm text-foreground/85">
                      {p.next_steps.map((u, j) => <li key={j} className="leading-relaxed">— {u}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strategic Insights */}
      {byType("insight").length > 0 && (
        <section>
          <SectionHeader kicker="Reflective" title="Strategic Insights" subtitle="These are not tasks. Sit with them." />
          <div className="grid gap-3">
            {byType("insight").map((s) => (
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