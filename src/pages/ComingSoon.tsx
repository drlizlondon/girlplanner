import { Sparkles } from "lucide-react";

export default function ComingSoon({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-6 py-20 max-w-3xl mx-auto text-center">
      <div className="mx-auto mb-6 h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">Soon</div>
      <h1 className="mt-2 text-3xl font-serif-display text-foreground">{title}</h1>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}