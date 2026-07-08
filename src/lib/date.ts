const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// "04 Jul 2025" — day, short month, year. Used on article pages.
export function fmtDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${day} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// "Jul 04" — short month + day, for timeline rows where the year is the group label.
export function fmtMonthDay(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${MONTHS[d.getUTCMonth()]} ${day}`;
}

export function yearOf(input: string | Date): number {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.getUTCFullYear();
}

// call `cb` for every weekday (Mon–Fri, UTC) in the inclusive [startISO, endISO]
// range — used to paint a "was working" baseline on the activity grids
export function eachWeekday(
  startISO: string,
  endISO: string,
  cb: (iso: string, year: number, month: number, day: number) => void,
): void {
  const [sy, sm, sd] = startISO.split('-').map(Number);
  const [ey, em, ed] = endISO.split('-').map(Number);
  const end = Date.UTC(ey, em - 1, ed);
  const pad = (n: number) => String(n).padStart(2, '0');
  for (let t = Date.UTC(sy, sm - 1, sd); t <= end; t += 86400000) {
    const d = new Date(t);
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue; // skip Sun/Sat
    const y = d.getUTCFullYear();
    const mo = d.getUTCMonth();
    const day = d.getUTCDate();
    cb(`${y}-${pad(mo + 1)}-${pad(day)}`, y, mo, day);
  }
}
