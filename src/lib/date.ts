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
