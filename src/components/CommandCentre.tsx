import { useEffect, useMemo, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, ChevronDown, ChevronRight, Lightbulb, Inbox, Sparkles, Users, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isToday, isPast, isThisWeek } from "date-fns";
import { SuggestionsStore, LSuggestion } from "@/lib/localStore";
import { founderOSConfig } from "@/config/founderOS";

function bucketOf(t: Task): "today" | "week" | "overdue" | "completed" {
  if (t.completed) return "completed";
  if (!t.dueDate) return "today";
  if (isPast(t.dueDate) && !isToday(t.dueDate)) return "overdue";
  if (isToday(t.dueDate)) return "today";
  if (isThisWeek(t.dueDate, { weekStartsOn: 1 })) return "week";
  return "today";
}

function MetricChip({ label, value, tone }: { label: string; value: number; tone?: "warn" | "primary" }) {
  return (
    <div className="glow-card px-4 py-3 min-w-0">
      <div className="text-[10px] uppercase tracking-[0.18em] text-fos-muted">{label}</div>
      <div
        className="mt-1 text-2xl font-medium"
        style={{ color: tone === "warn" ? "var(--danger)" : tone === "primary" ? "var(--accent)" : "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}

function TaskRow({ task, onComplete, onDelete }: { task: Task; onComplete: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="group flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--card-soft)] transition-colors border border-transparent hover:border-[var(--border-color)]">
      <button
        onClick={() => onComplete(task.id)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded-md border flex items-center justify-center"
        style={{ borderColor: "var(--border-color)" }}
      >
        <Check className="h-3 w-3 text-transparent group-hover:text-[var(--accent)]" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-fos whitespace-normal break-words [overflow-wrap:anywhere]">
          {task.title}
        </div>
      </div>
      {task.priority === "high" && (
        <span className="text-[10px] uppercase tracking-[0.14em] shrink-0" style={{ color: "var(--danger)" }}>high</span>
      )}
      {task.dueDate && (
        <span className="text-[11px] text-fos-muted shrink-0">{format(task.dueDate, "d MMM")}</span>
      )}
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-fos-muted hover:text-[var(--danger)] transition shrink-0"
        aria-label="Delete task"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function CommandCentre() {
  const { tasks, addTask, completeTask, deleteTask } = useTasks();
  const [newTitle, setNewTitle] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [pending, setPending] = useState<LSuggestion[]>([]);

  useEffect(() => {
    setPending(SuggestionsStore.pending());
  }, [tasks.length]);

  const buckets = useMemo(() => {
    const today: Task[] = [];
    const week: Task[] = [];
    const overdue: Task[] = [];
    for (const t of tasks) {
      const b = bucketOf(t);
      if (b === "overdue") overdue.push(t);
      else if (b === "today") today.push(t);
      else if (b === "week") week.push(t);
    }
    return { today, week, overdue };
  }, [tasks]);

  const followUps = pending.filter((s) => s.type === "follow_up").slice(0, 5);
  const suggestedActions = pending.filter((s) => ["priority_action", "next_action", "decision", "draft"].includes(s.type)).slice(0, 5);
  const interestingIdeas = pending.filter((s) => s.type === "idea").slice(0, 5);

  const submitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim());
    setNewTitle("");
  };

  return (
    <div className="fos-page px-4 sm:px-8 lg:px-12 py-8 pb-32 max-w-[1400px] mx-auto min-w-0">
      {/* Hero */}
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
          {format(new Date(), "EEEE • d MMMM")}
        </div>
        <h1 className="mt-1 font-serif-display text-fos h-section">{founderOSConfig.systemName}</h1>
        <p className="mt-2 text-fos-muted body-fluid">Your trusted operational system.</p>
      </div>

      {/* Metrics — 1 col under 391, 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-1 min-[391px]:grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
        <MetricChip label="Today's Tasks" value={buckets.today.length} tone="primary" />
        <MetricChip label="Overdue" value={buckets.overdue.length} tone="warn" />
        <MetricChip label="Follow Ups" value={followUps.length} />
        <MetricChip label="Pending Review" value={pending.length} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] min-w-0">
        {/* Agenda hero */}
        <section className="glow-card fos-hero p-5 sm:p-6 min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>Hero</div>
              <h2 className="text-2xl font-serif-display text-fos mt-1">Today's Agenda</h2>
            </div>
            <Link to="/agenda" className="text-xs text-fos-muted hover:text-fos">Open full agenda →</Link>
          </div>

          <form onSubmit={submitTask} className="flex gap-2 mb-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to happen?"
              className="flex-1 min-w-0"
            />
            <Button type="submit" disabled={!newTitle.trim()} className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          {buckets.overdue.length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] uppercase tracking-[0.18em] mb-1.5" style={{ color: "var(--danger)" }}>Overdue</div>
              <div className="space-y-0.5">
                {buckets.overdue.map((t) => (
                  <TaskRow key={t.id} task={t} onComplete={(id) => completeTask(id, true)} onDelete={deleteTask} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-fos-muted mb-1.5">Today</div>
            {buckets.today.length === 0 ? (
              <div className="text-sm text-fos-muted/70 italic px-3 py-4">Quiet. Add what matters above.</div>
            ) : (
              <div className="space-y-0.5">
                {buckets.today.map((t) => (
                  <TaskRow key={t.id} task={t} onComplete={(id) => completeTask(id, true)} onDelete={deleteTask} />
                ))}
              </div>
            )}
          </div>

          {buckets.week.length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-fos-muted mb-1.5">This Week</div>
              <div className="space-y-0.5">
                {buckets.week.map((t) => (
                  <TaskRow key={t.id} task={t} onComplete={(id) => completeTask(id, true)} onDelete={deleteTask} />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-xs text-fos-muted hover:text-fos inline-flex items-center gap-1"
          >
            {showCompleted ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            Completed
          </button>
        </section>

        {/* Right rail */}
        <aside className="space-y-5 min-w-0">
          <div className="glow-card p-4">
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.18em] text-fos-muted">Processing Review</div>
                <div className="text-sm font-medium text-fos">Suggested Actions</div>
              </div>
              <Link to="/inbox" className="text-[11px] inline-flex items-center gap-1 shrink-0" style={{ color: "var(--accent)" }}>
                <Inbox className="h-3 w-3" /> Inbox
              </Link>
            </div>
            <p className="text-[11px] text-fos-muted mb-3">These may be valuable — your call.</p>
            {suggestedActions.length === 0 ? (
              <div className="text-xs text-fos-muted italic">Nothing pending.</div>
            ) : (
              <ul className="space-y-1.5">
                {suggestedActions.map((s) => (
                  <li key={s.id} className="text-xs text-fos leading-snug break-words [overflow-wrap:anywhere]">
                    <Link to="/review" className="hover:underline">— {s.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glow-card p-4">
            <div className="text-sm font-medium text-fos mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
              Interesting Ideas
            </div>
            {interestingIdeas.length === 0 ? (
              <div className="text-xs text-fos-muted italic">None parked.</div>
            ) : (
              <ul className="space-y-1.5">
                {interestingIdeas.map((s) => (
                  <li key={s.id} className="text-xs text-fos leading-snug break-words [overflow-wrap:anywhere]">— {s.title}</li>
                ))}
              </ul>
            )}
          </div>

          <Link to="/opportunities" className="glow-card glow-card-hover p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-fos flex items-center gap-1.5 min-w-0">
              <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--accent)" }} />
              <span className="truncate">Opportunities</span>
            </div>
            <span className="text-[11px] text-fos-muted shrink-0">Review →</span>
          </Link>

          <Link to="/people-to-contact" className="glow-card glow-card-hover p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-fos flex items-center gap-1.5 min-w-0">
              <Users className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--accent)" }} />
              <span className="truncate">People to Contact</span>
            </div>
            <span className="text-[11px] text-fos-muted shrink-0">Open →</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
