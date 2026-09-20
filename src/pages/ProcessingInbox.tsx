import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBriefings, BriefingRow } from "@/hooks/useBriefings";
import { BriefingView } from "@/components/briefing/BriefingView";
import { dataService } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Archive, ArrowLeft, Sparkles, WifiOff } from "lucide-react";
import { format } from "date-fns";
import {
  summariseNotes,
  queueSummary,
  isOnline,
  flushSummaryQueue,
} from "@/lib/summariseNotes";

const SAMPLE_PLACEHOLDER = `Dump your raw notes or a voice transcript here, then Summarise with AI…

e.g. "Spoke to Sarah about the contract, need to reply by Friday. Investor
update is overdue. Idea: public roadmap as a marketing surface. Still unsure
whether we build for power users or first-timers first."

— or paste a ready-made Daily Executive Processing report and Create Briefing:

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
  const [summarising, setSummarising] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [activeBriefing, setActiveBriefing] = useState<BriefingRow | null>(null);
  const [authed, setAuthed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => setAuthed(await dataService.isUserAuthenticated()))();
  }, []);

  // Flush any summaries that were queued while offline — on mount and whenever
  // the connection returns. The summary is enrichment; it never blocks capture.
  const flush = useCallback(async () => {
    setOnline(isOnline());
    if (!isOnline()) return;
    const done = await flushSummaryQueue(async (markdown) => {
      await createBriefing(markdown);
    });
    if (done > 0) {
      await refetch();
      toast({
        title: "Caught up",
        description: `Summarised ${done} note${done === 1 ? "" : "s"} queued while you were offline.`,
      });
    }
  }, [createBriefing, refetch, toast]);

  useEffect(() => {
    flush();
    const onOnline = () => flush();
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [flush]);

  // Deterministic path — parse the pasted markdown locally, no AI. Works offline.
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

  // AI path — send raw notes to the Edge Function, then run the returned
  // markdown through the same createBriefing() path. Online-only: when offline
  // we queue and tell the user, never blocking or erroring the capture.
  const summarise = async () => {
    const notes = raw.trim();
    if (!notes) return;
    if (!isOnline()) {
      queueSummary(notes);
      setRaw("");
      toast({
        title: "Offline — saved for later",
        description: "We'll summarise these notes automatically when you're back online.",
      });
      return;
    }
    setSummarising(true);
    try {
      const markdown = await summariseNotes(notes);
      const b = await createBriefing(markdown);
      if (b) {
        setActiveBriefing(b);
        setRaw("");
        await refetch();
      }
    } catch (e) {
      // Never lose the capture — keep the raw text and offer the manual path.
      const msg = (e as Error)?.message;
      toast({
        title: "Couldn't summarise just now",
        description: msg
          ? `${msg}. Your notes are safe — try again or use Create Briefing.`
          : "Your notes are safe — try again or use Create Briefing.",
      });
    } finally {
      setSummarising(false);
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
          Capture your notes, summarise them into a briefing, and decide what deserves
          to become part of your system. Nothing is added automatically.
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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            {online ? (
              "Summarise with AI, or Create Briefing to parse pasted markdown yourself. Nothing auto-commits."
            ) : (
              <>
                <WifiOff className="h-3 w-3" /> Offline — capture still works. Summaries queue until you reconnect.
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={submit}
              disabled={!raw.trim() || submitting || summarising || !authed}
            >
              {submitting ? "Creating…" : "Create Briefing"}
            </Button>
            <Button
              onClick={summarise}
              disabled={!raw.trim() || summarising || submitting || !authed}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {summarising ? "Summarising…" : online ? "Summarise with AI" : "Queue for AI"}
            </Button>
          </div>
        </div>
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