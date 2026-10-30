import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { generateAssistantKey, keyHint, sha256Hex } from "@/lib/assistantKey";

// assistant_keys isn't in the generated Supabase types until Lovable regenerates them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const keysTable = () => (supabase as any).from("assistant_keys");

interface AssistantKeyRow {
  id: string;
  name: string;
  key_hint: string;
  created_at: string;
  last_used_at: string | null;
  can_suggest?: boolean;
}

/**
 * Connect an assistant (Queen Mode): makes a key that lets the tool read two
 * numbers (open to-dos, suggestions waiting) and nothing else. The key is shown
 * once; only its hash is saved. Disconnect stops it at once.
 */
export const AssistantsCard = () => {
  const [rows, setRows] = useState<AssistantKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("Queen Mode");
  const [busy, setBusy] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const reload = async () => {
    const query = (cols: string) => keysTable().select(cols).is("revoked_at", null).order("created_at", { ascending: false });
    let { data, error: err } = await query("id,name,key_hint,created_at,last_used_at,can_suggest");
    // Before the second database update (20261030150000) can_suggest doesn't exist yet: keep working without it.
    if (err) ({ data, error: err } = await query("id,name,key_hint,created_at,last_used_at"));
    if (err) setError("Couldn't load your assistants. If this is new, the database update may not be applied yet.");
    else { setRows(data || []); setError(null); }
    setLoading(false);
  };

  useEffect(() => { void reload(); }, []);

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in first.");
      const key = generateAssistantKey();
      const { error: err } = await keysTable().insert([{
        user_id: user.id,
        name: name.trim() || "Queen Mode",
        key_hash: await sha256Hex(key),
        key_hint: keyHint(key),
      }]);
      if (err) throw new Error("Couldn't connect. If this is new, the database update may not be applied yet.");
      setNewKey(key);
      setCopied(false);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't connect.");
    } finally {
      setBusy(false);
    }
  };

  const setCanSuggest = async (id: string, can_suggest: boolean) => {
    const { error: err } = await keysTable().update({ can_suggest }).eq("id", id);
    if (err) { setError("Couldn't change that. If this is new, the database update may not be applied yet."); return; }
    await reload();
  };

  const disconnect = async (id: string) => {
    const { error: err } = await keysTable().update({ revoked_at: new Date().toISOString() }).eq("id", id);
    if (err) { setError("Couldn't disconnect. Try again."); return; }
    setConfirmingId(null);
    await reload();
  };

  return (
    <div className="max-w-2xl mx-auto bg-card text-card-foreground border border-border rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-dancing-script text-purple-700 dark:text-purple-300 font-bold">Assistants</h2>
        <p className="text-sm text-muted-foreground">
          Let a tool you use, like Queen Mode, see how many to-dos you have and how many suggestions are waiting. If you switch on suggestions, it can also read your to-do titles (so it never suggests something twice) and add suggestions to your review list. It never adds to your list directly, and it can't change or delete anything.
        </p>
      </div>

      {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}

      {newKey ? (
        <div className="space-y-3 rounded-lg border border-purple-300 bg-purple-50/60 dark:bg-purple-950/30 p-3">
          <p className="text-sm font-semibold">Connected. Copy this key now and keep it somewhere safe, like your Passwords app. It won't be shown again.</p>
          <div className="flex gap-2 items-center">
            <code className="flex-1 min-w-0 break-all rounded-md border bg-background px-2 py-1.5 text-xs">{newKey}</code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { void navigator.clipboard?.writeText(newKey).then(() => setCopied(true), () => setCopied(false)); }}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Button type="button" onClick={() => setNewKey(null)} className="bg-gradient-to-r from-purple-400 to-purple-600 text-white">
            I've saved it
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label="Assistant name" className="text-sm" />
          <Button type="button" onClick={() => void connect()} disabled={busy} className="bg-gradient-to-r from-purple-400 to-purple-600 text-white">
            {busy ? "Connecting…" : "Connect"}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Connected</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : rows.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{r.name} <span className="font-normal text-muted-foreground">(…{r.key_hint})</span></p>
              <p className="text-xs text-muted-foreground">
                {r.last_used_at ? `Last used ${new Date(r.last_used_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}` : "Not used yet"}
              </p>
              {typeof r.can_suggest === "boolean" && (
              <label className="mt-1 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={r.can_suggest}
                  onChange={(e) => void setCanSuggest(r.id, e.target.checked)}
                  className="h-4 w-4 accent-purple-600"
                />
                Can add suggestions for you to review
              </label>
              )}
            </div>
            {confirmingId === r.id ? (
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => void disconnect(r.id)}>Yes, disconnect</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setConfirmingId(null)}>Keep</Button>
              </div>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={() => setConfirmingId(r.id)}>Disconnect</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
