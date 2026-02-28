/**
 * Get today's date as YYYY-MM-DD in local timezone.
 */
export function getTodayStr(): string {
  return formatDate(new Date());
}

/**
 * Format a Date object as YYYY-MM-DD.
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get the last N dates (including today) as YYYY-MM-DD strings,
 * ordered from most recent to oldest.
 */
export function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}
