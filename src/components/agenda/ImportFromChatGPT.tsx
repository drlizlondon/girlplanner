import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { parseChatGPTReturn } from "@/lib/chatgptImportParser";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Inbox } from "lucide-react";

const TYPE_TO_SECTION: Record<string, string> = {
  next_action: "Priority Actions",
  follow_up: "Follow Ups",
  decision: "Decisions",
  draft: "Drafts",
  research: "Research",
  admin: "Admin",
  project_note: "Project Notes",
};

export function ImportFromChatGPT({ onImported }: { onImported?: () => void }) {
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    setBusy(true);
    try {
      const parsed = parseChatGPTReturn(raw);
      if (parsed.length === 0) {
        toast({ title: "Nothing recognised", description: "Expected blocks like === TASK <id> === ... === END ===" });
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Imports save to your account." });
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      const { data: briefing, error: bErr } = await (supabase as any)
        .from("daily_briefings")
        .insert([{
          user_id: user.id,
          briefing_date: today,
          raw_text: raw,
          overview: `ChatGPT import — ${parsed.length} suggestion${parsed.length === 1 ? "" : "s"}`,
        }])
        .select()
        .single();
      if (bErr || !briefing) {
        toast({ title: "Could not import", description: bErr?.message || "" });
        return;
      }

      const rows = parsed.map((p, i) => {
        const lines: string[] = [];
        if (p.recommendation) lines.push(p.recommendation);
        if (p.nextSteps.length) lines.push("Next steps:\n" + p.nextSteps.map((s) => `• ${s}`).join("\n"));
        if (p.draft) lines.push("Draft:\n" + p.draft);
        return {
          user_id: user.id,
          briefing_id: briefing.id,
          type: p.type === "follow_up" ? "follow_up" : "priority_action",
          title: p.title,
          description: lines.join("\n\n"),
          source: "chatgpt_import",
          source_section: TYPE_TO_SECTION[p.type] || "ChatGPT",
          linked_task_id: p.taskId,
          next_steps: p.nextSteps,
          draft: p.draft || null,
          status: "pending",
          position: i,
        };
      });
      await (supabase as any).from("briefing_suggestions").insert(rows);
      setRaw("");
      toast({ title: "Imported", description: `${parsed.length} suggestion${parsed.length === 1 ? "" : "s"} added to Processing Inbox.` });
      onImported?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="module-card">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-serif-display text-xl text-foreground leading-tight">Import from ChatGPT</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Paste the dashboard-ready return block. Items land in the Processing Inbox for review — nothing auto-commits.
          </p>
        </div>
      </div>
      <Textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="=== TASK <id> ===&#10;type: next_action&#10;title: ...&#10;recommendation: ...&#10;next_steps:&#10;- ...&#10;draft: |&#10;  ...&#10;=== END ==="
        className="min-h-[180px] bg-surface border-border-subtle font-mono text-xs"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Inbox className="h-3 w-3" /> Lands in Processing Inbox as pending suggestions
        </span>
        <Button onClick={submit} disabled={!raw.trim() || busy}>
          {busy ? "Importing…" : "Import"}
        </Button>
      </div>
    </div>
  );
}