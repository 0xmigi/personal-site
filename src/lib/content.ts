import commitsData from '../data/commits.json';
import { yearOf } from './date';

type Frontmatter = {
  title: string;
  date: string | Date;
  draft?: boolean;
  tag?: string;
  repo?: string | string[];
  start?: string | Date; // work only: role start date (date = end)
  pin?: number; // manual sort weight: floats an entry up within its year (higher = higher)
};
type Mod = { frontmatter: Frontmatter };

const COMMITS = commitsData as Record<string, Record<string, number>>;

// merge the per-repo commit maps for a project into one { day: count } map;
// a project can point at more than one repo (e.g. an sdk + its demo)
const commitsFor = (repo?: string | string[]): Record<string, number> | undefined => {
  if (!repo) return undefined;
  const repos = Array.isArray(repo) ? repo : [repo];
  const merged: Record<string, number> = {};
  for (const r of repos) {
    const map = COMMITS[r];
    if (!map) continue;
    for (const [day, n] of Object.entries(map)) merged[day] = (merged[day] ?? 0) + n;
  }
  return Object.keys(merged).length ? merged : undefined;
};

const postModules = import.meta.glob<Mod>('../posts/*.mdx', { eager: true });
const projectModules = import.meta.glob<Mod>('../projects/*.mdx', { eager: true });
const videoModules = import.meta.glob<Mod>('../videos/*.mdx', { eager: true });
const workModules = import.meta.glob<Mod>('../work/*.mdx', { eager: true });

export type ItemType = 'writing' | 'project' | 'video' | 'work';

export interface Item {
  title: string;
  href: string;
  date: string; // normalized YYYY-MM-DD (UTC)
  tag: string;
  type: ItemType; // folder-derived — `tag` is just the display label
  commits?: Record<string, number>; // GitHub commit days → count, for repo-backed projects
  start?: string; // work only: normalized start date (YYYY-MM-DD); `date` is the end
  pin: number; // manual sort weight within a year (higher floats up); 0 when unset
}

// Timeline order: newest year first, then — within a year — highest `pin` first,
// then newest date. Keeps year blocks contiguous and date-ordered by default,
// while letting `pin` in an entry's frontmatter hand-lift it above its siblings
// (e.g. a flagship project you want seen over a more recent but smaller one).
type Sortable = { date: string; pin: number };
export const byYearPinDate = (a: Sortable, b: Sortable): number =>
  yearOf(b.date) - yearOf(a.date) ||
  b.pin - a.pin ||
  new Date(b.date).valueOf() - new Date(a.date).valueOf();

const slugOf = (path: string) => path.split('/').pop()!.replace(/\.mdx$/, '');

const toISO = (d: string | Date) => new Date(d as any).toISOString().slice(0, 10);

const collect = (modules: Record<string, Mod>, base: string, tag: string, type: ItemType): Item[] =>
  Object.entries(modules)
    .filter(([, mod]) => !mod.frontmatter.draft)
    .map(([path, mod]) => ({
      title: mod.frontmatter.title,
      href: `${base}/${slugOf(path)}`,
      date: toISO(mod.frontmatter.date),
      tag: mod.frontmatter.tag ?? tag,
      type,
      commits: commitsFor(mod.frontmatter.repo),
      start: mod.frontmatter.start ? toISO(mod.frontmatter.start) : undefined,
      pin: mod.frontmatter.pin ?? 0,
    }));

export function getItems(): Item[] {
  return [
    ...collect(postModules, '/writing', 'writing', 'writing'),
    ...collect(projectModules, '/projects', 'app', 'project'),
    ...collect(videoModules, '/videos', 'video', 'video'),
    ...collect(workModules, '/work', 'work', 'work'),
  ];
}

// every repo's commits merged into one { day: count } map — the always-on
// coding-activity heat behind the timeline grids
export function getCommitActivity(): Record<string, number> {
  const merged: Record<string, number> = {};
  for (const map of Object.values(COMMITS)) {
    for (const [day, n] of Object.entries(map)) merged[day] = (merged[day] ?? 0) + n;
  }
  return merged;
}

// employment date ranges — used to paint a faint weekday baseline on the grids
// for the full span of each role (a "was working here" layer under the commits)
export function getWorkSpans(): { start: string; end: string }[] {
  return getItems()
    .filter((it) => it.type === 'work' && it.start)
    .map((it) => ({ start: it.start!, end: it.date }));
}
