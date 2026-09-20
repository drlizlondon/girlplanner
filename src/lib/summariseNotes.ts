// Client seam for the AI-summary Edge Function ("summarise-notes").
//
// Contract: raw notes/transcript -> a Daily Executive Processing markdown report
// that the existing parseBriefing()/createBriefing() path already consumes.
//
// OFFLINE DISCIPLINE (PWA): the summary is online-only enrichment over data the
// user has ALREADY saved locally. It must never gate or block capture. When the
// browser is offline we queue the raw text in localStorage and flush it when the
// connection returns — never surfacing an error, just a quiet "will summarise
// when you're back online" state.

import { supabase } from "@/integrations/supabase/client";

const QUEUE_KEY = "girlplanner-summary-queue";

export interface QueuedSummary {
  notes: string;
  queuedAt: string;
}

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine !== false;
}

/** Calls the Edge Function. Throws on failure; callers must not let this block capture. */
export async function summariseNotes(notes: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("summarise-notes", {
    body: { notes },
  });
  if (error) throw error;
  const markdown = (data as { markdown?: string })?.markdown;
  if (!markdown) throw new Error((data as { error?: string })?.error || "Empty summary");
  return markdown;
}

export function getQueuedSummaries(): QueuedSummary[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedSummary[]) : [];
  } catch {
    return [];
  }
}

export function queueSummary(notes: string): void {
  try {
    const q = getQueuedSummaries();
    q.push({ notes, queuedAt: new Date().toISOString() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    // If storage is unavailable the raw text still lives in the capture UI /
    // local data; the summary is enrichment, so a lost queue entry is not fatal.
  }
}

function clearQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch {
    // ignore
  }
}

function writeQueue(items: QueuedSummary[]): void {
  try {
    if (items.length === 0) clearQueue();
    else localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/**
 * Flush any queued summaries when back online. For each queued item we call the
 * function and hand the resulting markdown to `onResult`. Items that succeed are
 * removed; items that fail are kept for the next attempt. Returns the number
 * successfully processed. Safe to call repeatedly (e.g. on the `online` event).
 */
export async function flushSummaryQueue(
  onResult: (markdown: string, queued: QueuedSummary) => Promise<void>,
): Promise<number> {
  if (!isOnline()) return 0;
  const items = getQueuedSummaries();
  if (items.length === 0) return 0;

  const remaining: QueuedSummary[] = [];
  let processed = 0;
  for (const item of items) {
    try {
      const markdown = await summariseNotes(item.notes);
      await onResult(markdown, item);
      processed++;
    } catch {
      remaining.push(item); // keep for the next attempt
    }
  }
  writeQueue(remaining);
  return processed;
}
