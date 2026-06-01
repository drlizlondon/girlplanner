import { useState } from "react";
import { Zap, ListChecks, Lightbulb, Users, HelpCircle, FileText, Sparkles, Briefcase } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { useTasks } from "@/hooks/useTasks";
import { useSimpleTable } from "@/hooks/useSimpleTable";
import { dataService } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";

type Target = "agenda" | "idea" | "note" | "person" | "question" | "signal" | "project" | "opportunity";

const TARGETS: { id: Target; label: string; icon: any }[] = [
  { id: "agenda", label: "Agenda", icon: ListChecks },
  { id: "idea", label: "Idea", icon: Lightbulb },
  { id: "note", label: "Note", icon: FileText },
  { id: "person", label: "Person", icon: Users },
  { id: "question", label: "Question", icon: HelpCircle },
  { id: "signal", label: "Signal", icon: Sparkles },
  { id: "project", label: "Project", icon: Briefcase },
  { id: "opportunity", label: "Opportunity", icon: Sparkles },
];

export function QuickCaptureModule({ span = 12 }: { span?: 4 | 6 | 8 | 12 }) {
  const [target, setTarget] = useState<Target>("agenda");
  const [v, setV] = useState("");
  const { addTask } = useTasks();
  const notes = useSimpleTable("notes");
  const questions = useSimpleTable("open_questions");
  const signals = useSimpleTable("strategic_signals");
  const projects = useSimpleTable("projects");
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = v.trim();
    if (!value) return;
    try {
      switch (target) {
        case "agenda":      await addTask(value); break;
        case "idea":        await dataService.addIdea(value); toast({ title: "Captured to Ideas" }); break;
        case "note":        await notes.add(value); toast({ title: "Note captured" }); break;
        case "person":      await dataService.addContact(value); toast({ title: "Person captured" }); break;
        case "question":    await questions.add(value); toast({ title: "Question captured" }); break;
        case "signal":      await signals.add(value); toast({ title: "Signal captured" }); break;
        case "project":     await projects.add(value); toast({ title: "Project created" }); break;
        case "opportunity": await dataService.addOpportunity(value); toast({ title: "Opportunity captured" }); break;
      }
      setV("");
    } catch (e: any) {
      toast({ title: "Could not capture", description: e?.message || "" });
    }
  };

  return (
    <ModuleCard title="Quick Capture" kicker="Type anything. Decide later." icon={Zap} accent="purple" span={span}>
      <form onSubmit={submit} className="flex gap-2 mb-3">
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder='e.g. "Sarah Chen, product designer from conference"'
          className="flex-1 h-12 px-4 rounded-xl bg-surface border border-border-subtle focus:border-primary/50 focus:outline-none text-[15px] placeholder:text-muted-foreground/70 transition-colors"
        />
        <button
          type="submit"
          disabled={!v.trim()}
          className="h-12 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          Capture
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {TARGETS.map((t) => {
          const active = target === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTarget(t.id)}
              className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] px-2.5 py-1.5 rounded-lg border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border-subtle text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <t.icon className="h-3 w-3" />
              {t.label}
            </button>
          );
        })}
      </div>
    </ModuleCard>
  );
}