import { ReactNode } from "react";

export default function SimpleModulePage({
  title, subtitle, children,
}: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="px-4 sm:px-8 lg:px-12 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">Module</div>
        <h1 className="mt-1 text-4xl font-serif-display text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">{children}</div>
    </div>
  );
}