// QM-4: Girl Planner records each open (throttled) for the signed-in owner,
// keeping the first and latest open per local day (Europe/London), so Queen
// Mode can count mornings she opened it after the morning message.

/** The Europe/London calendar date (YYYY-MM-DD) for an instant. */
export function londonDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(now);
}

/** At most one record per this many ms; an open after the morning message must still be seen. */
export const RECORD_EVERY_MS = 10 * 60 * 1000;

/** True when nothing was recorded in this page in the last RECORD_EVERY_MS. */
export function shouldRecordOpen(lastRecordedAtMs: number | null, nowMs: number): boolean {
  return lastRecordedAtMs === null || nowMs - lastRecordedAtMs >= RECORD_EVERY_MS;
}
