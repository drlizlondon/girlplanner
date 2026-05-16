import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProjectsStore, LProject } from "@/lib/localStore";
import { useToast } from "@/hooks/use-toast";
import { Archive, Trash2, Save } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function ProjectCard({ project, onChange, onArchive, onDelete }: { project: LProject; onChange: () => void; onArchive: () => void; onDelete: () => void }) {
  const [name, setName] = useState(project.name);
  const [notes, setNotes] = useState(project.notes);
  const dirty = name !== project.name || notes !== project.notes;
  return (
    <div className="glow-card p-4">
      <Input value={name} onChange={(e) => setName(e.target.value)} className="font-medium mb-2" />
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes, next steps…" className="min-h-[80px]" />
      <div className="mt-3 flex flex-wrap gap-2 justify-end">
        {dirty && (
          <Button size="sm" onClick={() => { ProjectsStore.update(project.id, { name, notes }); onChange(); }}>
            <Save className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onArchive}><Archive className="h-3.5 w-3.5 mr-1" /> Archive</Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-[color:var(--danger)]"><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [items, setItems] = useState<LProject[]>(ProjectsStore.all());
  const [name, setName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const reload = () => setItems(ProjectsStore.all());
  const add = () => { if (!name.trim()) return; ProjectsStore.add(name.trim()); setName(""); reload(); };
  return (
    <div className="fos-page px-4 sm:px-8 lg:px-12 py-8 pb-32 max-w-3xl mx-auto min-w-0">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>Workspace</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-serif-display text-fos">Projects</h1>
        <p className="mt-2 text-fos-muted">Capture a project update or next step.</p>
      </div>
      <div className="glow-card p-4 mb-6 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New project name" className="flex-1" onKeyDown={(e) => e.key === "Enter" && add()} />
        <Button onClick={add} disabled={!name.trim()}>Add</Button>
      </div>
      {items.length === 0 && <div className="glow-card p-8 text-center text-sm text-fos-muted">No projects yet. Add your first above.</div>}
      <div className="space-y-3">
        {items.map((p) => (
          <ProjectCard key={p.id} project={p} onChange={reload}
            onArchive={() => { ProjectsStore.update(p.id, { status: "archived" }); reload(); toast({ title: "Archived" }); }}
            onDelete={() => setConfirmDelete(p.id)} />
        ))}
      </div>
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmDelete) ProjectsStore.remove(confirmDelete); setConfirmDelete(null); reload(); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
