import { useId, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { dateFromInput, dateToInput } from '@/lib/todayList';
import type { Opportunity } from '@/types/opportunity';

export function OpportunityForm({ initial, onSave, onCancel }: {
  initial?: Opportunity;
  onSave: (title: string, deadline?: Date, details?: string) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const id = useId();
  const [title, setTitle] = useState(initial?.title || '');
  const [deadline, setDeadline] = useState(dateToInput(initial?.deadline_date));
  const [details, setDetails] = useState(initial?.details || '');
  const [saving, setSaving] = useState(false);

  return (
    <form className="space-y-4" onSubmit={async event => {
      event.preventDefault();
      if (!title.trim() || saving) return;
      setSaving(true);
      try {
        const success = await onSave(title.trim(), dateFromInput(deadline), details.trim());
        if (success && !initial) { setTitle(''); setDeadline(''); setDetails(''); }
      } finally { setSaving(false); }
    }}>
      <fieldset disabled={saving} className="space-y-4 min-w-0">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
          <div className="space-y-2">
            <Label htmlFor={`${id}-title`}>Title</Label>
            <Input id={`${id}-title`} placeholder="An opportunity to keep an eye on" required value={title} onChange={event => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-deadline`}>Deadline (optional)</Label>
            <Input className="min-w-0 w-full" type="date" id={`${id}-deadline`} value={deadline} onChange={event => setDeadline(event.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-details`}>Link & notes (optional)</Label>
          <Textarea id={`${id}-details`} placeholder="Website link, requirements, or your notes" rows={3} value={details} onChange={event => setDetails(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!title.trim() || saving}>
            {initial ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Add opportunity'}
          </Button>
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        </div>
      </fieldset>
    </form>
  );
}