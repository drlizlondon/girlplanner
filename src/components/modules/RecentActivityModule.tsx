import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { ModuleCard, EmptyHint } from "./ModuleCard";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

type Entry = { ts: string; label: string; type: string };

export function RecentActivityModule({ span = 6 }: { span?: 4 | 6 | 8 | 12 }) {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    (async () => {
      const [t, i, b] = await Promise.all([
        (supabase as any).from("tasks").select("title,created_at").order("created_at", { ascending: false }).limit(5),
        (supabase as any).from("ideas").select("title,created_at").order("created_at", { ascending: false }).limit(5),
        (supabase as any).from("daily_briefings").select("briefing_date,created_at").order("created_at", { ascending: false }).limit(3),
      ]);
      const merged: Entry[] = [
        ...((t.data || []).map((r: any) => ({ ts: r.created_at, label: `Task — ${r.title}`, type: "task" }))),
        ...((i.data || []).map((r: any) => ({ ts: r.created_at, label: `Idea — ${r.title}`, type: "idea" }))),
        ...((b.data || []).map((r: any) => ({ ts: r.created_at, label: `Briefing — ${r.briefing_date}`, type: "briefing" }))),
      ].sort((a, b) => +new Date(b.ts) - +new Date(a.ts)).slice(0, 8);
      setEntries(merged);
    })();
  }, []);

  return (
    <ModuleCard title="Recent Activity" kicker="Last few moves" icon={Activity} accent="blue" span={span}>
      {entries.length === 0 ? (
        <EmptyHint>Nothing yet. Start capturing.</EmptyHint>
      ) : (
        <ul className="space-y-1.5">
          {entries.map((e, i) => (
            <li key={i} className="text-[13.5px] flex items-baseline justify-between gap-2">
              <span className="text-foreground/85 truncate">{e.label}</span>
              <span className="text-[11px] text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(e.ts), { addSuffix: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ModuleCard>
  );
}