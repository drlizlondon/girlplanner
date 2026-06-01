import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, LucideIcon } from "lucide-react";

interface Props {
  title: string;
  kicker?: string;
  icon?: LucideIcon;
  accent?: "purple" | "blue" | "green" | "coral";
  href?: string;
  hrefLabel?: string;
  action?: ReactNode;
  children: ReactNode;
  span?: 4 | 6 | 8 | 12;
  className?: string;
}

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  purple: "text-primary bg-primary/10 border-primary/20",
  blue: "text-accent bg-accent/10 border-accent/20",
  green: "text-accent-green bg-accent-green/10 border-accent-green/20",
  coral: "text-accent-coral bg-accent-coral/10 border-accent-coral/20",
};

const SPAN: Record<NonNullable<Props["span"]>, string> = {
  4: "lg:col-span-4",
  6: "lg:col-span-6",
  8: "lg:col-span-8",
  12: "lg:col-span-12",
};

export function ModuleCard({
  title, kicker, icon: Icon, accent = "purple", href, hrefLabel = "Open",
  action, children, span = 6, className = "",
}: Props) {
  return (
    <section className={`module-card flex flex-col ${SPAN[span]} ${className}`}>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div className={`h-9 w-9 shrink-0 rounded-xl border flex items-center justify-center ${ACCENT[accent]}`}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            {kicker && (
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-0.5">{kicker}</div>
            )}
            <h2 className="font-serif-display text-[22px] leading-tight text-foreground truncate">{title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          {href && (
            <Link
              to={href}
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors"
            >
              {hrefLabel} <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </header>
      <div className="flex-1 min-w-0">{children}</div>
    </section>
  );
}

export function QuickAdd({
  placeholder, onAdd, disabled,
}: { placeholder: string; onAdd: (v: string) => void | Promise<void>; disabled?: boolean }) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const v = String(fd.get("v") || "").trim();
        if (!v) return;
        await onAdd(v);
        (e.currentTarget as HTMLFormElement).reset();
      }}
      className="flex gap-2 mb-3"
    >
      <input
        name="v"
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 h-11 px-3.5 rounded-xl bg-surface border border-border-subtle focus:border-primary/50 focus:outline-none text-[14px] placeholder:text-muted-foreground/70 transition-colors"
      />
      <button
        type="submit"
        disabled={disabled}
        className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        Add
      </button>
    </form>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="text-[13px] text-muted-foreground/80 italic py-3 px-1 leading-relaxed">{children}</div>
  );
}