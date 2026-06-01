import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ModuleCard, QuickAdd, EmptyHint } from "./ModuleCard";
import { dataService } from "@/lib/dataService";

export function OpportunitiesModule({ span = 6 }: { span?: 4 | 6 | 8 | 12 }) {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => setItems((await dataService.getOpportunities()) || []);
  useEffect(() => { load(); }, []);
  return (
    <ModuleCard title="Opportunities" kicker="Worth a closer look" icon={Sparkles} accent="green" span={span} href="/opportunities">
      <QuickAdd
        placeholder="e.g. NHS innovation fellowship"
        onAdd={async (v) => { await dataService.addOpportunity(v); load(); }}
      />
      {items.length === 0 ? (
        <EmptyHint>Capture loose opportunities. Decide later if they're worth pursuing.</EmptyHint>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 5).map((o) => (
            <li key={o.id} className="text-[14px] text-foreground/90 py-1.5 px-2 rounded-lg hover:bg-secondary/40 truncate">{o.title}</li>
          ))}
        </ul>
      )}
    </ModuleCard>
  );
}

export function IdeasModule({ span = 6 }: { span?: 4 | 6 | 8 | 12 }) {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => setItems((await dataService.getIdeas()) || []);
  useEffect(() => { load(); }, []);
  return (
    <ModuleCard title="Ideas Incubation" kicker="No pressure to act" icon={Sparkles} accent="purple" span={span} href="/ideas">
      <QuickAdd
        placeholder="Capture an idea…"
        onAdd={async (v) => { await dataService.addIdea(v); load(); }}
      />
      {items.length === 0 ? (
        <EmptyHint>Park half-formed thoughts. They live here without obligation.</EmptyHint>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 5).map((o) => (
            <li key={o.id} className="text-[14px] text-foreground/90 py-1.5 px-2 rounded-lg hover:bg-secondary/40 truncate">{o.title}</li>
          ))}
        </ul>
      )}
    </ModuleCard>
  );
}