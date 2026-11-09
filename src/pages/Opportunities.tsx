import { useState } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { CalendarDays, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { useOpportunities } from '@/hooks/useOpportunities';
import { OpportunityForm } from '@/components/OpportunityForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Opportunity } from '@/types/opportunity';

function LinkedNotes({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">{text.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
    /^https?:\/\//.test(part)
      ? <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 break-all">{part}</a>
      : part
  )}</p>;
}

export default function Opportunities() {
  const { opportunities, loading, error, retry, addOpportunity, updateOpportunity, deleteOpportunity } = useOpportunities();
  const [editing, setEditing] = useState<Opportunity>();
  const [deleting, setDeleting] = useState<Opportunity>();
  const [removing, setRemoving] = useState(false);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <header>
        <h1 className="font-dancing-script text-4xl font-bold text-primary">Opportunities</h1>
      </header>
      <section aria-labelledby="quick-add-title" className="border-b border-border pb-8">
        <h2 id="quick-add-title" className="font-serif-display text-2xl mb-4">Add an opportunity</h2>
        <OpportunityForm onSave={addOpportunity} />
      </section>
      <section aria-labelledby="saved-opportunities-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h2 id="saved-opportunities-title" className="font-serif-display text-2xl">Your opportunities</h2>
          <span className="text-sm text-muted-foreground">{loading ? 'Loading…' : `${opportunities.length} saved · Earliest deadline first`}</span>
        </div>
        {error ? <div role="alert" className="py-6 space-y-3"><p>Couldn't load your opportunities.</p><Button variant="outline" onClick={retry}>Try again</Button></div>
          : loading ? <p role="status" className="py-6 text-muted-foreground">Loading your opportunities…</p>
          : opportunities.length === 0 ? <div className="py-8 text-center text-muted-foreground"><Sparkles className="h-6 w-6 mx-auto mb-3 text-primary" /><p>No opportunities yet.</p></div>
          : <ul className="divide-y divide-border">{opportunities.map(opportunity => {
            const overdue = opportunity.deadline_date && isBefore(startOfDay(opportunity.deadline_date), startOfDay(new Date()));
            return <li key={opportunity.id} className="py-5" data-opportunity-id={opportunity.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <h3 className="font-semibold text-lg break-words">{opportunity.title}</h3>
                  <p className={`flex items-center gap-2 text-sm ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    {opportunity.deadline_date ? `${overdue ? 'Overdue · ' : ''}${format(opportunity.deadline_date, 'd MMM yyyy')}` : 'No deadline'}
                  </p>
                </div>
                <div className="flex shrink-0">
                  <Button variant="ghost" size="icon" aria-label={`Edit ${opportunity.title}`} title="Edit opportunity" onClick={() => setEditing(opportunity)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${opportunity.title}`} title="Delete opportunity" onClick={() => setDeleting(opportunity)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {opportunity.details && <div className="mt-3"><LinkedNotes text={opportunity.details} /></div>}
            </li>;
          })}</ul>}
      </section>
      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(undefined); }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto w-[calc(100%-2rem)]">
          <DialogHeader><DialogTitle>Edit opportunity</DialogTitle><DialogDescription>{editing?.title}</DialogDescription></DialogHeader>
          {editing && <OpportunityForm key={editing.id} initial={editing} onCancel={() => setEditing(undefined)} onSave={async (title, deadline_date, details) => {
            const success = await updateOpportunity(editing.id, { title, deadline_date, details });
            if (success) setEditing(undefined);
            return success;
          }} />}
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleting} onOpenChange={open => { if (!open && !removing) setDeleting(undefined); }}>
        <DialogContent className="w-[calc(100%-2rem)]">
          <DialogHeader><DialogTitle>Delete opportunity?</DialogTitle><DialogDescription className="break-words">{deleting?.title} will be removed.</DialogDescription></DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={removing} onClick={() => setDeleting(undefined)}>Cancel</Button>
            <Button variant="destructive" disabled={removing} onClick={async () => {
              if (!deleting) return;
              setRemoving(true);
              const success = await deleteOpportunity(deleting.id);
              setRemoving(false);
              if (success) setDeleting(undefined);
            }}>{removing ? 'Deleting…' : 'Delete opportunity'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}