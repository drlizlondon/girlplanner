import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { londonDate, shouldRecordOpen } from "@/lib/appOpen";

// record_app_open isn't in the generated Supabase types until Lovable regenerates them.
type UntypedRpc = { rpc: (name: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }> };
const rpc = (name: string, args: Record<string, unknown>) => (supabase as unknown as UntypedRpc).rpc(name, args);

/**
 * Records "opened Girl Planner" for a signed-in user: on load, on sign-in and
 * whenever the tab becomes visible, at most every 10 minutes. The database keeps
 * the first and latest open per day. No UI. Failures are silent.
 */
export function useRecordAppOpen() {
  useEffect(() => {
    let last: number | null = null;
    let cancelled = false;

    const record = async () => {
      const now = Date.now();
      if (!shouldRecordOpen(last, now)) return;
      const today = londonDate(new Date(now));
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || cancelled) return;
        last = now;
        const { error } = await rpc("record_app_open", { p_open_date: today });
        if (error) { last = null; console.warn("record_app_open failed", error.message); }
      } catch (e) {
        last = null;
        console.warn("record_app_open failed", e);
      }
    };

    void record();
    const onVisible = () => { if (document.visibilityState === "visible") void record(); };
    document.addEventListener("visibilitychange", onVisible);
    // Signing in after the page loaded counts as opening it that day.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void record();
    });
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sub.subscription.unsubscribe();
    };
  }, []);
}
