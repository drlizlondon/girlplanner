import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { ModuleCard, QuickAdd, EmptyHint } from "./ModuleCard";
import { dataService } from "@/lib/dataService";

export function PeopleModule({ span = 6 }: { span?: 4 | 6 | 8 | 12 }) {
  const [people, setPeople] = useState<any[]>([]);
  const load = async () => setPeople((await dataService.getContacts()) || []);
  useEffect(() => { load(); }, []);

  return (
    <ModuleCard title="People" kicker="To contact" icon={Users} accent="blue" span={span} href="/people-to-contact">
      <QuickAdd
        placeholder="Name and one-line context…"
        onAdd={async (v) => { await dataService.addContact(v); load(); }}
      />
      {people.length === 0 ? (
        <EmptyHint>Anyone you want to reach. Quick add with a one-line context.</EmptyHint>
      ) : (
        <ul className="space-y-1">
          {people.slice(0, 6).map((p) => (
            <li key={p.id} className="text-[14px] text-foreground/90 py-1.5 px-2 rounded-lg hover:bg-secondary/40 truncate">
              {p.name}
              {p.comments && <span className="ml-2 text-[12px] text-muted-foreground">— {p.comments}</span>}
            </li>
          ))}
        </ul>
      )}
    </ModuleCard>
  );
}