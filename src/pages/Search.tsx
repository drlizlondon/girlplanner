import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  TasksStore, IdeasStore, OppStore, PeopleStore, ProjectsStore,
  SuggestionsStore, BriefingsStore,
} from "@/lib/localStore";
import { Search as SearchIcon } from "lucide-react";

interface Hit { section: string; title: string; snippet?: string; to: string; }

function build(): Hit[] {
  const out: Hit[] = [];
  for (const t of TasksStore.all()) out.push({ section: "Agenda", title: t.title, snippet: t.additional_info, to: "/agenda" });
  for (const t of TasksStore.completed()) out.push({ section: "Agenda (done)", title: t.title, to: "/agenda" });
  for (const i of IdeasStore.all()) out.push({ section: "Ideas", title: i.title, snippet: i.details || "", to: "/ideas" });
  for (const o of OppStore.all()) out.push({ section: "Opportunities", title: o.title, snippet: o.details || "", to: "/opportunities" });
  for (const p of PeopleStore.all()) out.push({ section: "People", title: p.name, snippet: p.comments, to: "/people-to-contact" });
  for (const p of ProjectsStore.all()) out.push({ section: "Projects", title: p.name, snippet: p.notes, to: "/projects" });
  for (const s of SuggestionsStore.pending()) out.push({ section: "Suggestions", title: s.title, snippet: s.description, to: "/review" });
  for (const b of BriefingsStore.all()) out.push({ section: "Processing Inbox", title: b.overview?.slice(0, 80) || "Briefing", snippet: b.executive_signals || "", to: "/inbox" });
  return out;
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const all = useMemo(() => build(), []);
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [] as Hit[];
    return all.filter((h) =>
      h.title.toLowerCase().includes(needle) ||
      (h.snippet || "").toLowerCase().includes(needle),
    );
  }, [q, all]);

  const grouped = useMemo(() => {
    const g: Record<string, Hit[]> = {};
    for (const r of results) (g[r.section] ||= []).push(r);
    return g;
  }, [results]);

  return (
    <div className="fos-page px-4 sm:px-8 lg:px-12 py-8 pb-32 max-w-3xl mx-auto min-w-0">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>Search</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-serif-display text-fos">Find anything</h1>
        <p className="mt-2 text-fos-muted">Local search across every section.</p>
      </div>
      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fos-muted" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tasks, ideas, people, briefings…"
          className="pl-9 h-11"
        />
      </div>

      {!q.trim() && <div className="text-sm text-fos-muted">Start typing to search.</div>}
      {q.trim() && results.length === 0 && <div className="text-sm text-fos-muted">No matches.</div>}
      <div className="space-y-6">
        {Object.entries(grouped).map(([section, hits]) => (
          <div key={section}>
            <div className="text-[10px] uppercase tracking-[0.18em] text-fos-muted mb-2">{section}</div>
            <div className="grid gap-2">
              {hits.map((h, i) => (
                <Link key={i} to={h.to} className="glow-card glow-card-hover p-3 block">
                  <div className="text-sm text-fos break-words [overflow-wrap:anywhere]">{h.title}</div>
                  {h.snippet && (
                    <div className="mt-1 text-xs text-fos-muted line-clamp-2 break-words [overflow-wrap:anywhere]">
                      {h.snippet}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}