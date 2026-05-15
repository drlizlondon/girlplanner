import { useState } from "react";
import { SuggestionRow } from "@/hooks/useBriefings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { dataService } from "@/lib/dataService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Archive, Lightbulb, Pencil, Plus, Save } from "lucide-react";

interface Props {
  suggestion: SuggestionRow;
  onChange: (id: string, patch: Partial<SuggestionRow>) => void;
  variant?: "primary" | "soft";
}

const priorityTone: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-primary/15 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-border-subtle",
};

export function SuggestionCard({ suggestion, onChange, variant = "primary" }: Props) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(suggestion.title);
  const [description, setDescription] = useState(suggestion.description || "");

  const saveEdits = async () => {
    onChange(suggestion.id, { title, description });
    setEditing(false);
  };

  const addToAgenda = async () => {
    try {
      await dataService.addTask(title);
      onChange(suggestion.id, { status: "accepted" });
      toast({ title: "Added to Agenda", description: title });
    } catch (e: any) {
      toast({ title: "Could not add", description: e?.message || "" });
    }
  };

  const saveAsIdea = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from("ideas").insert([{
          user_id: user.id,
          title,
          details: description || "",
        }]);
      }
      onChange(suggestion.id, { status: "saved" });
      toast({ title: "Saved to Ideas" });
    } catch (e: any) {
      toast({ title: "Could not save", description: e?.message || "" });
    }
  };

  const archive = () =>
    onChange(suggestion.id, { status: "archived" });

  if (suggestion.status !== "pending") {
    const label =
      suggestion.status === "accepted" ? "Added to Agenda" :
      suggestion.status === "saved" ? "Saved" : "Archived";
    return (
      <div className="glow-card p-4 opacity-60">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground line-through truncate">{suggestion.title}</div>
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`glow-card glow-card-hover p-4 sm:p-5 ${variant === "soft" ? "" : ""}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          {suggestion.priority && (
            <span className={`text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border ${priorityTone[suggestion.priority] || priorityTone.medium}`}>
              {suggestion.priority}
            </span>
          )}
          {suggestion.project && (
            <span className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border border-border-subtle text-muted-foreground">
              {suggestion.project}
            </span>
          )}
          {suggestion.source_section && (
            <span className="text-[10px] text-muted-foreground/70">from {suggestion.source_section}</span>
          )}
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-muted-foreground hover:text-foreground"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-surface" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-surface min-h-[70px]" />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveEdits}><Save className="h-3.5 w-3.5 mr-1" />Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-[15px] font-medium text-foreground leading-snug">{title}</h3>
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
          )}
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(suggestion.type === "priority_action" || suggestion.type === "follow_up") && (
          <Button size="sm" onClick={addToAgenda}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {suggestion.type === "follow_up" ? "Convert to Task" : "Add to Agenda"}
          </Button>
        )}
        {suggestion.type !== "idea" && (
          <Button size="sm" variant="outline" onClick={saveAsIdea}>
            <Lightbulb className="h-3.5 w-3.5 mr-1" />
            {suggestion.type === "insight" || suggestion.type === "question" ? "Save" : "Save as Idea"}
          </Button>
        )}
        {suggestion.type === "idea" && (
          <>
            <Button size="sm" onClick={saveAsIdea}>
              <Lightbulb className="h-3.5 w-3.5 mr-1" />
              Save Idea
            </Button>
          </>
        )}
        <Button size="sm" variant="ghost" onClick={archive} className="text-muted-foreground hover:text-foreground">
          <Archive className="h-3.5 w-3.5 mr-1" />
          Archive
        </Button>
      </div>
    </div>
  );
}