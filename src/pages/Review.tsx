import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SuggestionsStore, LSuggestion, IdeasStore, OppStore, ProjectsStore, PeopleStore } from "@/lib/localStore";
import { dataService } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";
import { Archive, Check, Pencil, Save, Trash2, X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function commit(s: LSuggestion): { where: string } {
  const target = (s.target_section || "").toLowerCase();
  const body = s.draft_text || s.recommendation || s.description || "";
  if (target.includes("idea") || s.type === "idea") { IdeasStore.add(s.title, body); return { where: "Ideas" }; }
  if (target.includes("opportunit")) { OppStore.add(s.title, undefined, body); return { where: "Opportunities" }; }
  if (target.includes("project")) { ProjectsStore.add(s.title, body); return { where: "Projects" }; }
  if (target.includes("people") || target.includes("contact")) { PeopleStore.add(s.title, body); return { where: "People" }; }
  dataService.addTask(s.title);
  return { where: "Agenda" };
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-fos-muted mb-1">{label}</div>
      <div className="text-sm text-fos whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{body}</div>
    </div>
  );
}

function Card({ suggestion: s, onAccept, onArchive, onDelete, onUpdate }: {
  suggestion: LSuggestion; onAccept: () => void; onArchive: () => void; onDelete: () => void;
  onUpdate: (p: Partial<LSuggestion>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(s.title);
  const [desc, setDesc] = useState(s.description || "");
  return (
    <div className="glow-card glow-card-hover p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            {s.type.replace(/_/g, " ")}
          </span>
          {s.target_section && <span className="text-[10px] uppercase tracking-[0.14em] text-fos-muted">→ {s.target_section}</span>}
          {s.source === "chatgpt_import" && <span className="text-[10px] text-fos-muted">from ChatGPT</span>}
        </div>
        <button onClick={() => setEditing((e) => !e)} className="text-fos-muted hover:text-fos shrink-0">
          {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
        </button>
      </div>
      {editing ? (
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="min-h-[80px]" />
          <Button size="sm" onClick={() => { onUpdate({ title, description: desc }); setEditing(false); }}>
            <Save className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
        </div>
      ) : (
        <>
          <h3 className="text-[15px] font-medium text-fos leading-snug break-words [overflow-wrap:anywhere]">{s.title}</h3>
          {s.original_task_title && s.original_task_title !== s.title && (
            <div className="mt-1 text-xs text-fos-muted">Original: {s.original_task_title}</div>
          )}
          {s.recommendation && <Section label="Recommendation" body={s.recommendation} />}
          {s.next_actions && <Section label="Next actions" body={s.next_actions} />}
          {s.draft_text && <Section label="Draft" body={s.draft_text} />}
          {!s.recommendation && !s.next_actions && !s.draft_text && s.description && (
            <p className="mt-1.5 text-sm text-fos-muted leading-relaxed break-words [overflow-wrap:anywhere]">{s.description}</p>
          )}
        </>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={onAccept}><Check className="h-3.5 w-3.5 mr-1" /> Accept</Button>
        <Button size="sm" variant="ghost" onClick={onArchive}><Archive className="h-3.5 w-3.5 mr-1" /> Archive</Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-[color:var(--danger)]"><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const [, bump] = useState(0);
  const reload = () => bump((n) => n + 1);
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const pending = SuggestionsStore.pending();
  const accepted = SuggestionsStore.accepted();
  const archived = SuggestionsStore.archived();
  const onAccept = (s: LSuggestion) => { const r = commit(s); SuggestionsStore.accept(s.id); toast({ title: `Committed to ${r.where}`, description: s.title }); reload(); };
  return (
    <div className="fos-page px-4 sm:px-8 lg:px-12 py-8 pb-32 max-w-4xl mx-auto min-w-0">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>Review</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-serif-display text-fos">Suggestion review</h1>
        <p className="mt-2 text-fos-muted">Decide what becomes part of your trusted system.</p>
      </div>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({accepted.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archived.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0 && <div className="text-sm text-fos-muted">Nothing to review.</div>}
          {pending.map((s) => (
            <Card key={s.id} suggestion={s}
              onAccept={() => onAccept(s)}
              onArchive={() => { SuggestionsStore.archive(s.id); reload(); }}
              onDelete={() => setConfirmDelete(s.id)}
              onUpdate={(patch) => { SuggestionsStore.update(s.id, patch); reload(); }} />
          ))}
        </TabsContent>
        <TabsContent value="accepted" className="mt-4 space-y-2">
          {accepted.length === 0 && <div className="text-sm text-fos-muted">No accepted suggestions yet.</div>}
          {accepted.map((s) => (
            <div key={s.id} className="glow-card p-3 opacity-70">
              <div className="text-sm text-fos break-words [overflow-wrap:anywhere]">{s.title}</div>
              <div className="text-[11px] text-fos-muted">Committed → {s.target_section || "Agenda"}</div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="archived" className="mt-4 space-y-2">
          {archived.length === 0 && <div className="text-sm text-fos-muted">Nothing archived.</div>}
          {archived.map((s) => (
            <div key={s.id} className="glow-card p-3 opacity-60 flex justify-between gap-3 items-start">
              <div className="min-w-0">
                <div className="text-sm text-fos break-words [overflow-wrap:anywhere]">{s.title}</div>
                {s.description && <div className="text-xs text-fos-muted mt-1 break-words [overflow-wrap:anywhere]">{s.description}</div>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(s.id)}>Delete</Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmDelete) SuggestionsStore.remove(confirmDelete); setConfirmDelete(null); reload(); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
