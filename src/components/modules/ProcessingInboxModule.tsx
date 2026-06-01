import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, ArrowRight } from "lucide-react";
import { ModuleCard, EmptyHint } from "./ModuleCard";
import { supabase } from "@/integrations/supabase/client";

export function ProcessingInboxModule({ span = 6 }: { span?: 4 | 6 | 8 | 12 }) {
  const [items, setItems] = useState<any[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { data, count } = await (supabase as any)
        .from("briefing_suggestions")
        .select("id,title,type,source,project,created_at", { count: "exact" })
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(6);
      setItems(data || []);
      setPendingTotal(count || 0);
    })();
  }, []);

  return (
    <ModuleCard
      title="Processing Inbox"
      kicker={`${pendingTotal} pending`}
      icon={Inbox}
      accent="blue"
      span={span}
      href="/inbox"
      hrefLabel="Review"
    >
      {items.length === 0 ? (
        <EmptyHint>
          Paste a daily briefing or a ChatGPT return block on the Processing Inbox.
          Nothing here auto-enters the Agenda.
        </EmptyHint>
      ) : (
        <ul className="space-y-1.5">
          {items.map((s) => (
            <li key={s.id} className="text-[13.5px] text-foreground/90 leading-snug flex items-start gap-2">
              <span className="text-muted-foreground mt-1">—</span>
              <Link to="/inbox" className="hover:text-primary flex-1 min-w-0">{s.title}</Link>
              {s.source === "chatgpt_import" && (
                <span className="text-[10px] uppercase tracking-[0.12em] text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
                  ChatGPT
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {pendingTotal > items.length && (
        <Link
          to="/inbox"
          className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-primary hover:text-primary/80"
        >
          See all {pendingTotal} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </ModuleCard>
  );
}