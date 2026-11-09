import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOpportunities } from '@/hooks/useOpportunities';

export function OpportunitiesModule() {
  const { opportunities, loading, error } = useOpportunities();
  return (
    <section aria-labelledby="opportunities-card-title" className="rounded-lg border border-border bg-card p-5">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="opportunities-card-title" className="font-serif-display text-2xl flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Opportunities</h2>
        <Button asChild variant="ghost" size="sm"><Link to="/opportunities">Open <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
      </header>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p>
        : error ? <p className="text-sm text-muted-foreground">Couldn't load opportunities.</p>
        : opportunities.length === 0 ? <Button asChild variant="outline"><Link to="/opportunities">Add an opportunity</Link></Button>
        : <ul className="divide-y divide-border">{opportunities.slice(0, 3).map(item => <li key={item.id} className="py-2">
          <Link to="/opportunities" className="flex flex-wrap justify-between gap-x-4 gap-y-1 hover:text-primary">
            <span className="break-words min-w-0 flex-1">{item.title}</span>
            <span className="text-sm text-muted-foreground">{item.deadline_date ? format(item.deadline_date, 'd MMM yyyy') : 'No deadline'}</span>
          </Link>
        </li>)}</ul>}
    </section>
  );
}