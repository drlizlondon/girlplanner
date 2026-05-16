import { useState } from "react";
import { TasksStore, IdeasStore, OppStore, PeopleStore, SuggestionsStore, BriefingsStore } from "@/lib/localStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function Row({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="glow-card p-3 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm text-fos break-words [overflow-wrap:anywhere]">{title}</div>
        {sub && <div className="mt-1 text-xs text-fos-muted break-words [overflow-wrap:anywhere]">{sub}</div>}
      </div>
      <div className="flex gap-1 shrink-0">{children}</div>
    </div>
  );
}
const Empty = () => <div className="text-sm text-fos-muted">Nothing here yet.</div>;

export default function ArchivePage() {
  const [, force] = useState(0);
  const reload = () => force((x) => x + 1);
  const completedTasks = TasksStore.completed();
  const ideas = IdeasStore.archived();
  const opportunities = OppStore.archived();
  const peopleHistory = PeopleStore.history();
  const suggestions = SuggestionsStore.archived();
  const briefings = BriefingsStore.all();

  return (
    <div className="fos-page px-4 sm:px-8 lg:px-12 py-8 pb-32 max-w-4xl mx-auto min-w-0">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>Archive</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-serif-display text-fos">Everything you've set aside</h1>
      </div>
      <Tabs defaultValue="tasks">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="tasks">Tasks ({completedTasks.length})</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions ({suggestions.length})</TabsTrigger>
          <TabsTrigger value="ideas">Ideas ({ideas.length})</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities ({opportunities.length})</TabsTrigger>
          <TabsTrigger value="people">People ({peopleHistory.length})</TabsTrigger>
          <TabsTrigger value="briefings">Briefings ({briefings.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-4 space-y-2">
          {completedTasks.length === 0 && <Empty />}
          {completedTasks.map((t) => (
            <Row key={t.id} title={t.title} sub={t.completed_at ? `Completed ${format(new Date(t.completed_at), "d MMM yyyy")}` : ""}>
              <Button size="sm" variant="ghost" onClick={() => { TasksStore.revert(t.id); reload(); }}>Restore</Button>
              <Button size="sm" variant="ghost" onClick={() => { TasksStore.removeCompleted(t.id); reload(); }}>Delete</Button>
            </Row>
          ))}
        </TabsContent>
        <TabsContent value="suggestions" className="mt-4 space-y-2">
          {suggestions.length === 0 && <Empty />}
          {suggestions.map((s) => (
            <Row key={s.id} title={s.title} sub={s.description}>
              <Button size="sm" variant="ghost" onClick={() => { SuggestionsStore.remove(s.id); reload(); }}>Delete</Button>
            </Row>
          ))}
        </TabsContent>
        <TabsContent value="ideas" className="mt-4 space-y-2">
          {ideas.length === 0 && <Empty />}
          {ideas.map((i) => (
            <Row key={i.id} title={i.title} sub={i.details || ""}>
              <Button size="sm" variant="ghost" onClick={() => { IdeasStore.update(i.id, { archived: false }); reload(); }}>Restore</Button>
              <Button size="sm" variant="ghost" onClick={() => { IdeasStore.remove(i.id); reload(); }}>Delete</Button>
            </Row>
          ))}
        </TabsContent>
        <TabsContent value="opportunities" className="mt-4 space-y-2">
          {opportunities.length === 0 && <Empty />}
          {opportunities.map((o) => (
            <Row key={o.id} title={o.title} sub={o.details || ""}>
              <Button size="sm" variant="ghost" onClick={() => { OppStore.update(o.id, { archived: false }); reload(); }}>Restore</Button>
              <Button size="sm" variant="ghost" onClick={() => { OppStore.remove(o.id); reload(); }}>Delete</Button>
            </Row>
          ))}
        </TabsContent>
        <TabsContent value="people" className="mt-4 space-y-2">
          {peopleHistory.length === 0 && <Empty />}
          {peopleHistory.map((p) => (
            <Row key={p.id} title={p.name} sub={`Contacted ${format(new Date(p.contacted_at), "d MMM yyyy")} — ${p.comments}`}>
              <Button size="sm" variant="ghost" onClick={() => { PeopleStore.removeHistory(p.id); reload(); }}>Delete</Button>
            </Row>
          ))}
        </TabsContent>
        <TabsContent value="briefings" className="mt-4 space-y-2">
          {briefings.length === 0 && <Empty />}
          {briefings.map((b) => (
            <Row key={b.id} title={b.overview?.slice(0, 80) || "Briefing"} sub={format(new Date(b.briefing_date), "d MMM yyyy")}>
              <Button size="sm" variant="ghost" onClick={() => { BriefingsStore.remove(b.id); reload(); }}>Delete</Button>
            </Row>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
