export function sortOpportunities<T extends { deadline_date?: Date; created_at?: string }>(items: T[]): T[] {
  const deadline = (item: T) => item.deadline_date && Number.isFinite(item.deadline_date.getTime())
    ? item.deadline_date.getTime() : Infinity;
  return [...items].sort((a, b) => {
    const first = deadline(a), second = deadline(b);
    if (first !== second) return first < second ? -1 : 1;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
}

export function opportunityUpdates(updates: { title?: string; details?: string; deadline_date?: Date }) {
  const { deadline_date, ...rest } = updates;
  return Object.prototype.hasOwnProperty.call(updates, 'deadline_date')
    ? { ...rest, deadline_date: deadline_date?.toISOString() ?? null }
    : rest;
}