export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoDateFromOffset(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

/** "2026-09-15" -> "Tue, Sep 15" */
export function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** "10:30" -> "10:30 AM" */
export function formatTimeLabel(time: string): string {
  const [hourStr, minute] = time.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

/** The next `count` upcoming dates (including today), as ISO strings. */
export function upcomingDates(count: number): string[] {
  return Array.from({ length: count }, (_, i) => isoDateFromOffset(i));
}
