type Frontmatter = { title: string; date: string | Date; draft?: boolean; tag?: string };
type Mod = { frontmatter: Frontmatter };

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
}

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
    }));

export function getItems(): Item[] {
  return [
    ...collect(postModules, '/writing', 'writing', 'writing'),
    ...collect(projectModules, '/projects', 'app', 'project'),
    ...collect(videoModules, '/videos', 'video', 'video'),
    ...collect(workModules, '/work', 'work', 'work'),
  ];
}
