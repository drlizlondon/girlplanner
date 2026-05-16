import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme, ThemeChoice } from "@/hooks/useTheme";
import { downloadBackup, importAll, clearAllLocal, lastExportDate } from "@/lib/backup";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Laptop, Download, Upload, Trash2 } from "lucide-react";
import { APP_VERSION, founderOSConfig } from "@/config/founderOS";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function ThemeOption({
  active, label, icon: Icon, onClick,
}: { active: boolean; label: string; icon: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-0 inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm transition-colors ${
        active ? "accent-gradient-bg" : "surface-soft text-fos hover:text-fos"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const last = lastExportDate();

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    const res = importAll(text);
    if (res.ok) {
      toast({ title: "Backup imported", description: `Restored ${res.restored} sections.` });
      setTimeout(() => window.location.reload(), 600);
    } else {
      toast({ title: "Import failed", description: res.reason || "Unknown error." });
    }
    e.target.value = "";
  };

  const choose = (t: ThemeChoice) => setTheme(t);

  return (
    <div className="fos-page px-4 sm:px-8 lg:px-12 py-8 pb-32 max-w-3xl mx-auto min-w-0">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>Settings</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-serif-display text-fos">Your system</h1>
        <p className="mt-2 text-fos-muted">
          Local-Only Mode keeps your data on this device. Export regularly if you want a backup.
        </p>
      </div>

      {/* Theme */}
      <section className="glow-card p-5 mb-6">
        <div className="text-[10px] uppercase tracking-[0.18em] text-fos-muted mb-1">Appearance</div>
        <h2 className="text-lg font-medium text-fos mb-3">Theme</h2>
        <div className="flex gap-2 flex-wrap">
          <ThemeOption active={theme === "day"} label="Day" icon={Sun} onClick={() => choose("day")} />
          <ThemeOption active={theme === "night"} label="Night" icon={Moon} onClick={() => choose("night")} />
          <ThemeOption active={theme === "system"} label="System" icon={Laptop} onClick={() => choose("system")} />
        </div>
      </section>

      {/* Storage */}
      <section className="glow-card p-5 mb-6">
        <div className="text-[10px] uppercase tracking-[0.18em] text-fos-muted mb-1">Storage</div>
        <h2 className="text-lg font-medium text-fos mb-3">Local-Only</h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-fos-muted">Current mode</dt><dd className="text-fos">Local-Only</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-fos-muted">Data location</dt><dd className="text-fos">This device / browser</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-fos-muted">Sync</dt><dd className="text-fos">Off</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-fos-muted">Account required</dt><dd className="text-fos">No</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-fos-muted">Last export</dt><dd className="text-fos">{last ? new Date(last).toLocaleString() : "—"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-fos-muted">Version</dt><dd className="text-fos">{APP_VERSION}</dd></div>
        </dl>
      </section>

      {/* Data */}
      <section className="glow-card p-5 mb-6">
        <div className="text-[10px] uppercase tracking-[0.18em] text-fos-muted mb-1">Data</div>
        <h2 className="text-lg font-medium text-fos mb-3">Backup &amp; restore</h2>
        <p className="text-sm text-fos-muted mb-4">
          Export creates a private backup file. Keep it somewhere safe.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadBackup}>
            <Download className="h-4 w-4 mr-1.5" /> Export JSON
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1.5" /> Import JSON
          </Button>
          <Button variant="ghost" onClick={() => setConfirmClear(true)} className="text-[color:var(--danger)]">
            <Trash2 className="h-4 w-4 mr-1.5" /> Clear local data
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
        </div>
      </section>

      <section className="glow-card p-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-fos-muted mb-1">About</div>
        <h2 className="text-lg font-medium text-fos mb-2">{founderOSConfig.systemName}</h2>
        <p className="text-sm text-fos-muted">{founderOSConfig.tone}.</p>
      </section>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all local data?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes every task, idea, opportunity, contact, briefing and suggestion stored
              in this browser. This cannot be undone. Export a backup first if you need one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearAllLocal();
                toast({ title: "Local data cleared" });
                setTimeout(() => window.location.reload(), 400);
              }}
            >
              Yes, clear everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}