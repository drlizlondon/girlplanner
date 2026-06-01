import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SimpleRow {
  id: string;
  user_id: string;
  title: string;
  body?: string | null;
  status?: string;
  project_id?: string | null;
  created_at: string;
  updated_at: string;
  [k: string]: any;
}

export function useSimpleTable(table: string, opts?: { statusFilter?: string }) {
  const [rows, setRows] = useState<SimpleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = (supabase as any).from(table).select("*").order("created_at", { ascending: false });
    if (opts?.statusFilter) q = q.eq("status", opts.statusFilter);
    const { data } = await q;
    setRows((data || []) as SimpleRow[]);
    setLoading(false);
  }, [table, opts?.statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (title: string, extra?: Record<string, any>) => {
    const t = title.trim();
    if (!t) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await (supabase as any)
      .from(table)
      .insert([{ user_id: user.id, title: t, ...(extra || {}) }])
      .select()
      .single();
    if (data) setRows((p) => [data as SimpleRow, ...p]);
    return data as SimpleRow | null;
  };

  const update = async (id: string, patch: Record<string, any>) => {
    const { data } = await (supabase as any).from(table).update(patch).eq("id", id).select().single();
    if (data) setRows((p) => p.map((r) => (r.id === id ? (data as SimpleRow) : r)));
    return data;
  };

  const remove = async (id: string) => {
    await (supabase as any).from(table).delete().eq("id", id);
    setRows((p) => p.filter((r) => r.id !== id));
  };

  return { rows, loading, add, update, remove, refetch: fetch };
}