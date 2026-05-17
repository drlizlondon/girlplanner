import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseBriefing, ParsedSuggestion } from "@/lib/briefingParser";
import { useToast } from "@/hooks/use-toast";

export interface BriefingRow {
  id: string;
  briefing_date: string;
  raw_text: string;
  overview: string | null;
  executive_signals: string | null;
  project_updates: any;
  strategic_insights: any;
  open_questions: any;
  parked_ideas: any;
  created_at: string;
  accepted_count?: number;
  saved_count?: number;
  archived_count?: number;
}

export interface SuggestionRow {
  id: string;
  briefing_id: string;
  type: "priority_action" | "follow_up" | "insight" | "question" | "idea";
  title: string;
  description: string;
  project: string | null;
  priority: string | null;
  source_section: string | null;
  status: "pending" | "accepted" | "saved" | "archived";
  position: number;
  created_at: string;
}

export function useBriefings() {
  const [briefings, setBriefings] = useState<BriefingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("daily_briefings")
      .select("*, briefing_suggestions(status)")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setBriefings([]);
    } else {
      setBriefings(
        (data || []).map((b: any) => {
          const s = (b.briefing_suggestions || []) as { status: string }[];
          return {
            ...b,
            accepted_count: s.filter((x) => x.status === "accepted").length,
            saved_count: s.filter((x) => x.status === "saved").length,
            archived_count: s.filter((x) => x.status === "archived").length,
          };
        }),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createBriefing = async (rawText: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", description: "Briefings sync to your account." });
      return null;
    }
    const parsed = parseBriefing(rawText);
    const { data: briefing, error } = await (supabase as any)
      .from("daily_briefings")
      .insert([{
        user_id: user.id,
        raw_text: rawText,
        overview: parsed.overview || null,
        executive_signals: parsed.executive_signals || null,
        project_updates: parsed.project_updates,
        strategic_insights: parsed.strategic_insights,
        open_questions: parsed.open_questions,
        parked_ideas: parsed.parked_ideas,
      }])
      .select()
      .single();
    if (error || !briefing) {
      toast({ title: "Could not save briefing", description: error?.message || "" });
      return null;
    }

    const allSugs: ParsedSuggestion[] = [
      ...parsed.priority_actions,
      ...parsed.follow_ups,
      ...parsed.strategic_insights,
      ...parsed.open_questions,
      ...parsed.parked_ideas,
    ];
    if (allSugs.length) {
      const rows = allSugs.map((s, i) => ({
        user_id: user.id,
        briefing_id: briefing.id,
        type: s.type,
        title: s.title,
        description: s.description,
        project: s.project ?? null,
        priority: s.priority ?? "medium",
        source_section: s.source_section,
        status: "pending",
        position: i,
      }));
      await (supabase as any).from("briefing_suggestions").insert(rows);
    }
    await refetch();
    return briefing as BriefingRow;
  };

  return { briefings, loading, refetch, createBriefing };
}

export function useBriefingSuggestions(briefingId: string | null) {
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!briefingId) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("briefing_suggestions")
      .select("*")
      .eq("briefing_id", briefingId)
      .order("position", { ascending: true });
    setSuggestions((data || []) as SuggestionRow[]);
    setLoading(false);
  }, [briefingId]);

  useEffect(() => { refetch(); }, [refetch]);

  const updateSuggestion = async (id: string, patch: Partial<SuggestionRow>) => {
    await (supabase as any).from("briefing_suggestions").update(patch).eq("id", id);
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } as SuggestionRow : s)));
  };

  return { suggestions, loading, refetch, updateSuggestion };
}