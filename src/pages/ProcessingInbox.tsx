import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useBriefings, BriefingRow } from "@/hooks/useBriefings";
import { BriefingView } from "@/components/briefing/BriefingView";
import { Link } from "react-router-dom";
import { Archive, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { parseReturn, returnItemToSuggestion } from "@/lib/chatgptBridge";
import { ChatGPTStore, SuggestionsStore } from "@/lib/localStore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SAMPLE_PLACEHOLDER = `Paste a processed report or messy notes…

## Overview
Short paragraph framing the day.

## Priority Actions
- [BishBash] Send investor update — draft today, ship tomorrow
- Review pricing experiment results

## Possible Follow Ups
- Reply to Sarah re: contract

## Project Updates
### BishBash
- Onboarding flow ships tomorrow

## Strategic Insights
- The emotional feel of the flow matters as much as technical correctness.

## Open Questions
- Are we building for power users or first-timers first?

## Parked Ideas
- Public roadmap as marketing surface`;

const CHATGPT_PLACEHOLDER = `Paste the full FOUNDER_OS_CHATGPT_RETURN block from ChatGPT here…`;

export default function ProcessingInbox() {
  const { briefings, loading, createBriefing, refetch } = useBriefings();
  const [raw, setRaw] = useState("");
  const [chatgpt, setChatgpt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeBriefing, setActiveBriefing] = useState<BriefingRow | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const importChatGPT = () => {
    if (!chatgpt.trim()) return;
    setImporting(true);
    const res = parseReturn(chatgpt);
    if (!res.ok) {
      ChatGPTStore.saveImport(chatgpt, false, 0);
      toast({ title: "Could not parse", description: res.reason || "Saved raw text to inbox history." });
      setImporting(false);
      return;
    }
    const rows = res.items.map(returnItemToSuggestion);
    SuggestionsStore.addPendingMany(rows);
    ChatGPTStore.saveImport(chatgpt, true, rows.length);
    toast({ title: "Suggestions imported", description: `${rows.length} ready for review.` });
    setChatgpt("");
    setImporting(false);
    navigate("/review");
  };

  if (activeBriefing) {
    return (
      <div className="fos-page px-4 sm:px-8 lg:px-12 py-8 pb-32 max-w-5xl mx-auto min-w-0">
        <button
          onClick={() => setActiveBriefing(null)}
          className="flex items-center gap-1.5 text-sm text-fos-muted hover:text-fos mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Inbox
        </button>
        <BriefingView briefing={activeBriefing} />
      </div>
    );
  }

  return (
    <div className="fos-page px-4 sm:px-8 lg:px-12 py-10 pb-32 max-w-5xl mx-auto min-w-0">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>Processing</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-serif-display text-fos">Processing Inbox</h1>
        <p className="mt-2 text-fos-muted max-w-2xl">
          Paste processed ChatGPT output or messy notes. Nothing is added to your trusted system
          automatically — you review every item.
        </p>
      </div>

      <Tabs defaultValue="briefing" className="mb-10">
        <TabsList>
          <TabsTrigger value="briefing">Daily briefing</TabsTrigger>
          <TabsTrigger value="chatgpt">Import from ChatGPT</TabsTrigger>
        </TabsList>

        <TabsContent value="briefing" className="mt-4">
          <div className="glow-card p-4 sm:p-5">
            <Textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={SAMPLE_PLACEHOLDER}
              className="min-h-[320px] text-sm leading-relaxed font-mono"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-fos-muted">
                Parsed deterministically from markdown headings. No AI.
              </span>
              <Button onClick={submit} disabled={!raw.trim() || submitting}>
                {submitting ? "Creating…" : "Create Briefing"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chatgpt" className="mt-4">
          <div className="glow-card p-4 sm:p-5">
            <Textarea
              value={chatgpt}
              onChange={(e) => setChatgpt(e.target.value)}
              placeholder={CHATGPT_PLACEHOLDER}
              className="min-h-[320px] text-sm leading-relaxed font-mono"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-fos-muted">
                Looks for FOUNDER_OS_CHATGPT_RETURN and creates pending suggestions.
              </span>
              <Button onClick={importChatGPT} disabled={!chatgpt.trim() || importing}>
                {importing ? "Importing…" : "Import suggestions"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-fos-muted">Recent</div>
            <h2 className="text-xl font-serif-display text-fos mt-1">Briefing Archive</h2>
          </div>
          <Link to="/review" className="text-xs text-fos-muted hover:text-fos">Review queue →</Link>
        </div>
        {loading && <div className="text-sm text-fos-muted">Loading…</div>}
        {!loading && briefings.length === 0 && (
          <div className="glow-card p-8 text-center text-sm text-fos-muted">
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
                    {format(new Date(b.briefing_date), "EEE • d MMM yyyy")}
                  </div>
                  <div className="mt-1 text-sm text-fos line-clamp-2 break-words [overflow-wrap:anywhere]">
                    {b.overview || b.executive_signals || "Briefing"}
                  </div>
                </div>
                <div className="flex shrink-0 gap-3 text-[11px] text-fos-muted">
                  <span><span className="text-fos">{b.accepted_count ?? 0}</span> committed</span>
                  <span><span className="text-fos">{b.saved_count ?? 0}</span> pending</span>
                  <span><span className="text-fos">{b.archived_count ?? 0}</span> archived</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
