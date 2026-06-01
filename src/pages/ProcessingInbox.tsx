import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBriefings, BriefingRow } from "@/hooks/useBriefings";
import { BriefingView } from "@/components/briefing/BriefingView";
import { dataService } from "@/lib/dataService";
import { Link } from "react-router-dom";
import { Archive, ArrowLeft, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ImportFromChatGPT } from "@/components/agenda/ImportFromChatGPT";

const SAMPLE_PLACEHOLDER = `Paste Daily Executive Processing report…

## Overview
Short paragraph framing the day.

## Executive Signals
High-level signals worth noticing.

## Priority Actions
- [BishBash] Send investor update — draft today, ship tomorrow
- Review pricing experiment results

## Possible Follow Ups
- Reply to Sarah re: contract

## Project Updates
### BishBash
- Onboarding flow ships tomorrow
#### Next Steps
- Final QA pass

## Strategic Insights
- The emotional feel of the flow matters as much as technical correctness.

## Open Questions
- Are we building for power users or first-timers first?

## Parked Ideas
- Public roadmap as marketing surface`;

export default function ProcessingInbox() {
  const { briefings, loading, createBriefing, refetch } = useBriefings();
  const [raw, setRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeBriefing, setActiveBriefing] = useState<BriefingRow | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => setAuthed(await dataService.isUserAuthenticated()))();
  }, []);

  const submit = async () => {
    if (!raw.trim()) return;
    setSubmitting(true);
    const b = await createBriefing(raw);
    setSubmitting(false);
    if (b) {
      setActiveBriefing(b);
      setRaw("");
      await refetch();
    }
  };

  if (activeBriefing) {
    return (
      <div className="px-4 sm:px-8 lg:px-12 py-8 max-w-5xl mx-auto">
        <button
          onClick={() => setActiveBriefing(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Inbox
        </button>
        <BriefingView briefing={activeBriefing} />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 lg:px-12 py-10 max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">Processing</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-serif-display text-foreground">Processing Inbox</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Paste a daily report and decide what deserves to become part of your system.
          Nothing is added automatically.
        </p>
      </div>

      {!authed && (
        <div className="glow-card p-5 mb-6 border-primary/30">
          <div className="flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-sm text-foreground/85">
              Briefings sync to your account. <Link to="/" className="underline text-primary">Sign in</Link> to save and revisit them.
            </div>
          </div>
        </div>
      )}

      <div className="glow-card p-4 sm:p-5">
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={SAMPLE_PLACEHOLDER}
          className="min-h-[320px] bg-surface/60 border-border-subtle focus-visible:ring-primary/40 text-sm leading-relaxed font-mono"
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Parsed deterministically from markdown headings. No AI.
          </span>
          <Button onClick={submit} disabled={!raw.trim() || submitting || !authed}>
            {submitting ? "Creating…" : "Create Briefing"}
          </Button>
        </div>
      </div>

      {/* Manual ChatGPT bridge */}
      <div className="mt-8">
        <ImportFromChatGPT onImported={refetch} />
      </div>

      {/* Recent briefings */}
      <div className="mt-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Recent</div>
            <h2 className="text-xl font-serif-display text-foreground mt-1">Briefing Archive</h2>
          </div>
        </div>
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!loading && briefings.length === 0 && (
          <div className="glow-card p-8 text-center text-sm text-muted-foreground">
            <Archive className="h-5 w-5 mx-auto mb-2 opacity-60" />
            No briefings yet. Paste your first report above.
          </div>
        )}
        <div className="grid gap-3">
          {briefings.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBriefing(b)}
              className="glow-card glow-card-hover p-4 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-primary/80">
                    {format(new Date(b.briefing_date), "EEE • d MMM yyyy")}
                  </div>
                  <div className="mt-1 text-sm text-foreground/90 line-clamp-2">
                    {b.overview || b.executive_signals || "Briefing"}
                  </div>
                </div>
                <div className="flex shrink-0 gap-3 text-[11px] text-muted-foreground">
                  <span><span className="text-foreground">{b.accepted_count ?? 0}</span> tasks</span>
                  <span><span className="text-foreground">{b.saved_count ?? 0}</span> saved</span>
                  <span><span className="text-foreground">{b.archived_count ?? 0}</span> archived</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}