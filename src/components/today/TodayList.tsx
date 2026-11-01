import { useMemo, useRef, useState } from "react";
import { CalendarPlus, Check, Star, Trash2, X } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { lifeInboxUrl } from "@/lib/lifeInbox";
import { dateFromInput, dateToInput, dueLabel, nextPriority, PRIORITY_LABEL, sortToday } from "@/lib/todayList";

const PRIORITY_CHIP: Record<Task["priority"], string> = {
  high: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/30",
  medium: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30",
  low: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-500/10 dark:border-blue-500/30",
};

const CHIP = "inline-flex items-center h-7 px-2.5 rounded-full border text-xs font-medium transition-colors";

export function TodayList() {
  const { tasks, addTask, completeTask, deleteTask, updateTask, refetch } = useTasks();
  const [title, setTitle] = useState("");
  const sorted = useMemo(() => sortToday(tasks), [tasks]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    await addTask(value, "medium", null);
    setTitle("");
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from("tasks").update({ status }).eq("id", id);
    refetch();
  };

  return (
    <section className="space-y-3">
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a to-do"
          aria-label="Add a to-do"
          className="flex-1 min-w-0 h-12 px-4 rounded-xl bg-card border border-border focus:border-primary/50 focus:outline-none text-[16px] placeholder:text-muted-foreground/70"
        />
        <button
          type="submit"
          className="shrink-0 h-12 px-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
          disabled={!title.trim()}
        >
          Add
        </button>
      </form>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground px-1 py-6 text-center">Nothing on your list. Add your first to-do above.</p>
      ) : (
        <ul className="space-y-2" aria-label="Your to-do list">
          {sorted.map((t) => (
            <TodayRow
              key={t.id}
              task={t}
              onComplete={() => completeTask(t.id, true)}
              onDelete={() => deleteTask(t.id)}
              onPriority={() => updateTask(t.id, { priority: nextPriority(t.priority) })}
              onDue={(due) => updateTask(t.id, { dueDate: due })}
              onFocus={() => setStatus(t.id, t.status === "focus" ? "active" : "focus")}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function TodayRow({
  task, onComplete, onDelete, onPriority, onDue, onFocus,
}: {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onPriority: () => void;
  onDue: (due: Date | undefined) => void;
  onFocus: () => void;
}) {
  const dateRef = useRef<HTMLInputElement>(null);
  const due = dueLabel(task.dueDate);
  const isFocus = task.status === "focus";

  const openPicker = () => {
    const el = dateRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      try { el.showPicker(); return; } catch { /* fall through */ }
    }
    el.focus();
    el.click();
  };

  return (
    <li className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border">
      <button
        onClick={onComplete}
        aria-label={`Mark "${task.title}" done`}
        className="mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 border-primary/50 flex items-center justify-center hover:bg-primary/10"
      >
        <Check className="h-3.5 w-3.5 text-primary/40" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="text-[15px] leading-snug text-foreground break-words">{task.title}</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <button
            onClick={onPriority}
            aria-label={`Priority ${PRIORITY_LABEL[task.priority]}. Tap to change`}
            className={`${CHIP} ${PRIORITY_CHIP[task.priority]}`}
          >
            {PRIORITY_LABEL[task.priority]}
          </button>

          <span className="relative">
            <button
              onClick={openPicker}
              aria-label={task.dueDate ? `Due ${due.text}. Tap to change` : "Add a due date"}
              className={`${CHIP} ${
                due.overdue
                  ? "text-destructive border-destructive/40 bg-destructive/5"
                  : task.dueDate
                  ? "text-foreground border-border bg-background"
                  : "text-muted-foreground border-dashed border-border bg-transparent"
              }`}
            >
              {due.text}
            </button>
            <input
              ref={dateRef}
              type="date"
              tabIndex={-1}
              aria-hidden="true"
              value={dateToInput(task.dueDate)}
              onChange={(e) => onDue(dateFromInput(e.target.value))}
              className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
            />
          </span>

          {task.dueDate && (
            <button
              onClick={() => onDue(undefined)}
              aria-label="Clear the due date"
              title="Clear the due date"
              className="h-7 w-7 -ml-1 rounded-full text-muted-foreground hover:text-foreground flex items-center justify-center"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="ml-auto flex items-center -mr-1.5">
        <a
          href={lifeInboxUrl(task)}
          target="_blank"
          rel="noopener"
          title="Send to Life Inbox (Big Picture Planner)"
          aria-label={`Send "${task.title}" to Life Inbox`}
          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <CalendarPlus className="h-4 w-4" />
        </a>
        <button
          onClick={onFocus}
          title={isFocus ? "Remove from Focus" : "Move to Focus"}
          aria-label={isFocus ? "Remove from Focus" : "Move to Focus"}
          className={`p-2 rounded-lg hover:bg-accent-coral/10 ${isFocus ? "text-accent-coral" : "text-muted-foreground"}`}
        >
          <Star className={`h-4 w-4 ${isFocus ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          aria-label={`Delete "${task.title}"`}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
          </div>
        </div>
      </div>
    </li>
  );
}
