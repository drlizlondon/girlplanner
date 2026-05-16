import { useCallback, useEffect, useState } from "react";
import { parseBriefing, ParsedSuggestion } from "@/lib/briefingParser";
import { useToast } from "@/hooks/use-toast";
import { BriefingsStore, SuggestionsStore, LBriefing, LSuggestion } from "@/lib/localStore";

export type BriefingRow = LBriefing & {
  accepted_count?: number;
  saved_count?: number;
  archived_count?: number;
};

export type SuggestionRow = LSuggestion;

function withCounts(b: LBriefing): BriefingRow {
  const pending = SuggestionsStore.pending().filter((s) => s.briefing_id === b.id);
  const accepted = SuggestionsStore.accepted().filter((s) => s.briefing_id === b.id);
  const archived = SuggestionsStore.archived().filter((s) => s.briefing_id === b.id);
  return {
    ...b,
    accepted_count: accepted.length,
    saved_count: pending.length,
    archived_count: archived.length,
  };
}

export function useBriefings() {
  const [briefings, setBriefings] = useState<BriefingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refetch = useCallback(async () => {
    setLoading(true);
    setBriefings(BriefingsStore.all().map(withCounts));
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const createBriefing = async (rawText: string): Promise<BriefingRow | null> => {
    const parsed = parseBriefing(rawText);
    const briefing = BriefingsStore.add(rawText, {
      overview: parsed.overview || null,
      executive_signals: parsed.executive_signals || null,
      project_updates: parsed.project_updates,
      strategic_insights: parsed.strategic_insights,
      open_questions: parsed.open_questions,
      parked_ideas: parsed.parked_ideas,
    });

    const all: ParsedSuggestion[] = [
      ...parsed.priority_actions,
      ...parsed.follow_ups,
      ...parsed.strategic_insights,
      ...parsed.open_questions,
      ...parsed.parked_ideas,
    ];
    if (all.length) {
      SuggestionsStore.addPendingMany(
        all.map((s) => ({
          type: s.type,
          title: s.title,
          description: s.description,
          project: s.project ?? null,
          priority: s.priority ?? "medium",
          source: "briefing",
          briefing_id: briefing.id,
          target_section: s.source_section,
        })),
      );
    }
    await refetch();
    toast({ title: "Briefing saved", description: `${all.length} item${all.length === 1 ? "" : "s"} to review.` });
    return withCounts(briefing);
  };

  return { briefings, loading, refetch, createBriefing };
}

export function useBriefingSuggestions(briefingId: string | null) {
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!briefingId) { setSuggestions([]); setLoading(false); return; }
    const pending = SuggestionsStore.pending().filter((s) => s.briefing_id === briefingId);
    const accepted = SuggestionsStore.accepted().filter((s) => s.briefing_id === briefingId);
    const archived = SuggestionsStore.archived().filter((s) => s.briefing_id === briefingId);
    setSuggestions([...pending, ...accepted, ...archived]);
    setLoading(false);
  }, [briefingId]);

  useEffect(() => { refetch(); }, [refetch]);

  const updateSuggestion = async (id: string, patch: Partial<SuggestionRow>) => {
    if (patch.status === "accepted") SuggestionsStore.accept(id);
    else if (patch.status === "archived") SuggestionsStore.archive(id);
    else SuggestionsStore.update(id, patch);
    refetch();
  };

  return { suggestions, loading, refetch, updateSuggestion };
}
