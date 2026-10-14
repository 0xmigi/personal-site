// The home timeline shows four titles per year. In the unfiltered view those
// slots go to projects and jobs first; videos and writing only fill what's left
// — they stay reachable through the filters, the year pages, and their
// project's page. The picks keep the year's own pin/date order.
export const HOME_SLOTS = 4;

const PRIMARY = new Set(['project', 'work']);

export function pickForHome<T extends { type: string }>(items: T[]): T[] {
  if (items.length <= HOME_SLOTS) return items;
  const chosen = new Set(
    [
      ...items.filter((it) => PRIMARY.has(it.type)),
      ...items.filter((it) => !PRIMARY.has(it.type)),
    ].slice(0, HOME_SLOTS),
  );
  return items.filter((it) => chosen.has(it));
}
