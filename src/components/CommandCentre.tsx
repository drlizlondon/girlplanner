import { useEffect, useMemo, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, ChevronDown, ChevronRight, Lightbulb, Inbox, Sparkles, Users, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isPast, isThisWeek } from "date-fns";

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
    <div className="glow-card px-4 py-3 min-w-[120px]">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-medium ${tone === "warn" ? "text-destructive" : tone === "primary" ? "text-primary" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}

function TaskRow({ task, onComplete, onDelete }: { task: Task; onComplete: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-elevated/60 transition-colors border border-transparent hover:border-border-subtle">
      <button
        onClick={() => onComplete(task.id)}
        className="h-4 w-4 rounded-md border border-border flex items-center justify-center hover:border-primary hover:bg-primary/10"
      >
        <Check className="h-3 w-3 text-transparent group-hover:text-primary/40" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground truncate">{task.title}</div>
      </div>
      {task.priority === "high" && (
        <span className="text-[10px] uppercase tracking-[0.14em] text-destructive/90">high</span>
      )}
      {task.dueDate && (
        <span className="text-[11px] text-muted-foreground">{format(task.dueDate, "d MMM")}</span>
      )}
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
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
  const [pendingSuggestions, setPendingSuggestions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("briefing_suggestions")
        .select("id,title,type,project,briefing_id")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(40);
      setPendingSuggestions(data || []);
    })();
  }, []);

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

  const followUps = pendingSuggestions.filter((s) => s.type === "follow_up").slice(0, 5);
  const suggestedActions = pendingSuggestions.filter((s) => s.type === "priority_action").slice(0, 5);
  const interestingIdeas = pendingSuggestions.filter((s) => s.type === "idea").slice(0, 5);

  const submitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim());
    setNewTitle("");
  };

  return (
    <div className="px-4 sm:px-8 lg:px-12 py-8 max-w-[1400px] mx-auto">
      {/* Hero */}
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">{format(new Date(), "EEEE • d MMMM")}</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-serif-display text-foreground">Command Centre</h1>
        <p className="mt-2 text-muted-foreground">Your trusted operational system.</p>
      </div>

      {/* Metrics */}
      <div className="flex flex-wrap gap-3 mb-8">
        <MetricChip label="Today's Tasks" value={buckets.today.length} tone="primary" />
        <MetricChip label="Overdue" value={buckets.overdue.length} tone="warn" />
        <MetricChip label="Follow Ups" value={followUps.length} />
        <MetricChip label="Meetings" value={0} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Agenda hero */}
        <section className="glow-card p-5 sm:p-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">Hero</div>
              <h2 className="text-2xl font-serif-display text-foreground mt-1">Today's Agenda</h2>
            </div>
            <Link to="/agenda" className="text-xs text-muted-foreground hover:text-foreground">Open full agenda →</Link>
          </div>

          <form onSubmit={submitTask} className="flex gap-2 mb-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a task… (Enter to commit)"
              className="bg-surface border-border-subtle"
            />
            <Button type="submit" disabled={!newTitle.trim()}><Plus className="h-4 w-4" /></Button>
          </form>

          {buckets.overdue.length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-destructive/80 mb-1.5">Overdue</div>
              <div className="space-y-0.5">
                {buckets.overdue.map((t) => (
                  <TaskRow key={t.id} task={t} onComplete={(id) => completeTask(id, true)} onDelete={deleteTask} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">Today</div>
            {buckets.today.length === 0 ? (
              <div className="text-sm text-muted-foreground/70 italic px-3 py-4">Quiet. Add what matters above.</div>
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
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">This Week</div>
              <div className="space-y-0.5">
                {buckets.week.map((t) => (
                  <TaskRow key={t.id} task={t} onComplete={(id) => completeTask(id, true)} onDelete={deleteTask} />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            {showCompleted ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            Completed
          </button>
        </section>

        {/* Right rail — Processing Review */}
        <aside className="space-y-6">
          <div className="glow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Processing Review</div>
                <div className="text-sm font-medium text-foreground">Suggested Actions</div>
              </div>
              <Link to="/inbox" className="text-[11px] text-primary/80 hover:text-primary inline-flex items-center gap-1">
                <Inbox className="h-3 w-3" /> Inbox
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground/80 mb-3">These may be valuable — your call.</p>
            {suggestedActions.length === 0 ? (
              <div className="text-xs text-muted-foreground/70 italic">Nothing pending.</div>
            ) : (
              <ul className="space-y-1.5">
                {suggestedActions.map((s) => (
                  <li key={s.id} className="text-xs text-foreground/85 leading-snug">
                    <Link to="/inbox" className="hover:text-primary">— {s.title}</Link>
                    {s.project && <span className="ml-1.5 text-[10px] text-muted-foreground">[{s.project}]</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glow-card p-4">
            <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5 text-primary/80" />Interesting Ideas</div>
            {interestingIdeas.length === 0 ? (
              <div className="text-xs text-muted-foreground/70 italic">None parked.</div>
            ) : (
              <ul className="space-y-1.5">
                {interestingIdeas.map((s) => (
                  <li key={s.id} className="text-xs text-foreground/85 leading-snug">— {s.title}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="glow-card p-4">
            <div className="text-sm font-medium text-foreground mb-2">Follow Ups</div>
            {followUps.length === 0 ? (
              <div className="text-xs text-muted-foreground/70 italic">All clear.</div>
            ) : (
              <ul className="space-y-1.5">
                {followUps.map((s) => (
                  <li key={s.id} className="text-xs text-foreground/85 leading-snug">— {s.title}</li>
                ))}
              </ul>
            )}
          </div>

          <Link to="/opportunities" className="glow-card glow-card-hover p-4 flex items-center justify-between">
            <div className="text-sm font-medium text-foreground flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary/80" />Opportunities</div>
            <span className="text-[11px] text-muted-foreground">Review →</span>
          </Link>

          <Link to="/people-to-contact" className="glow-card glow-card-hover p-4 flex items-center justify-between">
            <div className="text-sm font-medium text-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary/80" />People to Contact</div>
            <span className="text-[11px] text-muted-foreground">Open →</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}