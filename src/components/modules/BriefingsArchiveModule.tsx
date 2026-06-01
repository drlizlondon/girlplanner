import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Archive } from "lucide-react";
import { ModuleCard, EmptyHint } from "./ModuleCard";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function BriefingsArchiveModule({ span = 6 }: { span?: 4 | 6 | 8 | 12 }) {
  const [briefings, setBriefings] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("daily_briefings")
        .select("id,briefing_date,overview,created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setBriefings(data || []);
    })();
  }, []);

  return (
    <ModuleCard title="Briefings Archive" kicker="Past reports" icon={Archive} accent="purple" span={span} href="/inbox" hrefLabel="Open all">
      {briefings.length === 0 ? (
        <EmptyHint>Daily reports you've processed will live here.</EmptyHint>
      ) : (
        <ul className="space-y-1.5">
          {briefings.map((b) => (
            <li key={b.id} className="text-[13.5px] leading-snug">
              <Link to="/inbox" className="hover:text-primary block truncate">
                <span className="text-muted-foreground mr-2">{format(new Date(b.briefing_date), "d MMM")}</span>
                <span className="text-foreground/90">{b.overview || "Briefing"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ModuleCard>
  );
}