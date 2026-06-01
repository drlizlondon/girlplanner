import { ModuleCard, QuickAdd, EmptyHint } from "./ModuleCard";
import { useSimpleTable } from "@/hooks/useSimpleTable";
import { Trash2 } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Props {
  table: string;
  title: string;
  kicker?: string;
  icon: LucideIcon;
  accent?: "purple" | "blue" | "green" | "coral";
  placeholder: string;
  emptyHint: string;
  span?: 4 | 6 | 8 | 12;
  href?: string;
  extraColumn?: (row: any) => string | null;
}

export function SimpleListModule({
  table, title, kicker, icon, accent = "purple", placeholder, emptyHint, span = 6, href, extraColumn,
}: Props) {
  const { rows, add, remove } = useSimpleTable(table);

  return (
    <ModuleCard title={title} kicker={kicker} icon={icon} accent={accent} span={span} href={href}>
      <QuickAdd placeholder={placeholder} onAdd={async (v) => { await add(v); }} />
      {rows.length === 0 ? (
        <EmptyHint>{emptyHint}</EmptyHint>
      ) : (
        <ul className="space-y-1">
          {rows.slice(0, 6).map((r) => (
            <li
              key={r.id}
              className="group flex items-center gap-2 px-2 py-2 rounded-xl border border-transparent hover:bg-secondary/40 hover:border-border-subtle"
            >
              <div className="flex-1 min-w-0 text-[14px] text-foreground truncate">{r.title}</div>
              {extraColumn?.(r) && (
                <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                  {extraColumn(r)}
                </span>
              )}
              <button
                onClick={() => remove(r.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {rows.length > 6 && (
        <div className="mt-2 text-[11px] text-muted-foreground">+{rows.length - 6} more</div>
      )}
    </ModuleCard>
  );
}