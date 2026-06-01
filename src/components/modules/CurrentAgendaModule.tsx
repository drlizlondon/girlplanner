import { useMemo, useState } from "react";
import { CheckSquare, ListChecks, Send, Star, Trash2, X, Check } from "lucide-react";
import { ModuleCard, QuickAdd, EmptyHint } from "./ModuleCard";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types/task";
import { ExportToChatGPTModal } from "@/components/agenda/ExportToChatGPTModal";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function CurrentAgendaModule({
  focusOnly = false,
  span = 8,
}: { focusOnly?: boolean; span?: 4 | 6 | 8 | 12 }) {
  const { tasks, addTask, completeTask, deleteTask, refetch } = useTasks();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);

  const visible = useMemo(
    () => (focusOnly ? tasks.filter((t) => (t as any).status === "focus") : tasks),
    [tasks, focusOnly]
  );

  const toggle = (id: string) =>
    setSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const selectedTasks = visible.filter((t) => selected.has(t.id));

  const setStatus = async (id: string, status: string) => {
    await (supabase as any).from("tasks").update({ status }).eq("id", id);
    refetch();
  };

  return (
    <>
      <ModuleCard
        title={focusOnly ? "Focus Now" : "Current Agenda"}
        kicker={focusOnly ? "Manually chosen" : "Trusted operational layer"}
        icon={focusOnly ? Star : ListChecks}
        accent={focusOnly ? "coral" : "purple"}
        span={span}
        href="/agenda"
        hrefLabel="Open"
        action={
          !focusOnly && selected.size > 0 ? (
            <button
              onClick={() => setExportOpen(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
            >
              <Send className="h-3 w-3" />
              Export to ChatGPT ({selected.size})
            </button>
          ) : null
        }
      >
        {!focusOnly && (
          <QuickAdd placeholder="Add an agenda item…" onAdd={(v) => addTask(v)} />
        )}

        {visible.length > 0 && !focusOnly && (
          <div className="flex items-center gap-3 mb-2 text-[11px]">
            <button
              onClick={() =>
                setSelected(selected.size === visible.length ? new Set() : new Set(visible.map((t) => t.id)))
              }
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <CheckSquare className="h-3 w-3" />
              {selected.size === visible.length ? "Deselect all" : "Select all visible"}
            </button>
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        )}

        {visible.length === 0 ? (
          <EmptyHint>
            {focusOnly
              ? "Promote items here when you want to focus. The agenda stays calm."
              : "Add what's actually in flight. Items persist until you complete, pause, or archive them."}
          </EmptyHint>
        ) : (
          <ul className="space-y-1">
            {visible.map((t) => (
              <AgendaRow
                key={t.id}
                task={t}
                selected={selected.has(t.id)}
                onSelect={() => toggle(t.id)}
                onComplete={() => completeTask(t.id, true)}
                onDelete={() => deleteTask(t.id)}
                onFocus={() => setStatus(t.id, (t as any).status === "focus" ? "active" : "focus")}
                isFocus={(t as any).status === "focus"}
              />
            ))}
          </ul>
        )}
      </ModuleCard>

      <ExportToChatGPTModal open={exportOpen} onOpenChange={setExportOpen} tasks={selectedTasks} />
    </>
  );
}

function AgendaRow({
  task, selected, onSelect, onComplete, onDelete, onFocus, isFocus,
}: {
  task: Task; selected: boolean; onSelect: () => void; onComplete: () => void;
  onDelete: () => void; onFocus: () => void; isFocus: boolean;
}) {
  return (
    <li
      className={`group flex items-center gap-2.5 px-2 py-2 rounded-xl border transition-all ${
        selected
          ? "bg-primary/8 border-primary/30 shadow-[inset_3px_0_0_hsl(var(--primary))]"
          : "border-transparent hover:bg-secondary/40 hover:border-border-subtle"
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onSelect}
        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
      />
      <button
        onClick={onComplete}
        title="Mark complete"
        className="h-5 w-5 rounded-md border border-border flex items-center justify-center hover:border-primary hover:bg-primary/10"
      >
        <Check className="h-3 w-3 text-transparent group-hover:text-primary/50" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] text-foreground truncate">{task.title}</div>
      </div>
      {task.priority === "high" && (
        <span className="text-[10px] uppercase tracking-[0.14em] text-accent-coral">high</span>
      )}
      {task.dueDate && (
        <span className="text-[11px] text-muted-foreground">{format(task.dueDate, "d MMM")}</span>
      )}
      <button
        onClick={onFocus}
        title={isFocus ? "Remove from Focus" : "Move to Focus"}
        className={`opacity-0 group-hover:opacity-100 transition ${
          isFocus ? "text-accent-coral opacity-100" : "text-muted-foreground hover:text-accent-coral"
        }`}
      >
        <Star className={`h-3.5 w-3.5 ${isFocus ? "fill-current" : ""}`} />
      </button>
      <button
        onClick={onDelete}
        title="Archive"
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}