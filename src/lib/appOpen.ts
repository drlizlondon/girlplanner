// QM-4: Girl Planner records "opened today" once per local day (Europe/London)
// for the signed-in owner, so Queen Mode can count mornings she opened it.

/** The Europe/London calendar date (YYYY-MM-DD) for an instant. */
export function londonDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(now);
}

/** True when today has not been recorded yet in this page's memory. */
export function shouldRecordOpen(lastRecorded: string | null, today: string): boolean {
  return lastRecorded !== today;
}
