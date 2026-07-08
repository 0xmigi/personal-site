# azuolas.xyz

Personal site — Astro + Tailwind. A deliberately minimal surface with hidden depth:
the home page is one year-grouped timeline of everything; each entry opens its own
article.

## Adding an entry

Entries are MDX files. Drop a new `.mdx` in the folder for its type — it appears on
the timeline automatically (sorted by `date`, newest first).

| Type    | Folder          | Route            | Tag (default) |
|---------|-----------------|------------------|---------------|
| writing | `src/posts/`    | `/writing/<slug>` | `writing`    |
| project | `src/projects/` | `/projects/<slug>` | `app`       |
| video   | `src/videos/`   | `/videos/<slug>`  | `video`      |
| work    | `src/work/`     | `/work/<slug>`    | `work`       |

Tags show on the year pages (`/<year>`), not on the home timeline — home shows
titles only. The home timeline's type filters are the words "work, projects,
writing, or videos" in the bio's last sentence (buttons styled as links; the
active one gets the orange underline). They key off the entry's *folder*, not
its `tag`, so overriding `tag` never breaks filtering. No filter is selected
by default.

The filename (minus `.mdx`) is the slug.

### Frontmatter

Common: `title`, `date` (YYYY-MM-DD), optional `summary`, optional `tag` (overrides
the default above), optional `draft: true` (hides it), optional `agent: true` (adds a
"— written by azuolas' agent" byline, for content an agent drafted).

- **projects**: also `url` (live link — purchased domain first, hosted fallback),
  optional `repo` (GitHub `owner/name`, or a list `["owner/a", "owner/b"]` for a
  multi-repo project). All repos' commits combine into the **always-on grey
  activity grid** — the dots behind the home timeline (month-week cells) and the
  year-page day calendar are commit density, *not* entry dates. On desktop only,
  hovering a repo-backed project tints *its* commits orange (its slice of the
  whole). There's no hover on touch, so the grey grid is the primary, mobile-safe
  layer; the orange is a bonus.
- **work**: also `role`, `period` (e.g. `"Jul 2022 – Aug 2024"`), `start`
  (`YYYY-MM-DD` role start — `date` is the end), optional `url`. The weekdays
  (Mon–Fri) from `start`→`date` paint a faint grey **baseline** on the activity
  grids ("was working here"), under any commit heat. On desktop, hovering a work
  entry tints its whole span orange (the same bonus as hovering a project).
- **videos**: also `src` (mp4 path in `/public`), `poster`.

### Rules that matter

- **Title length: keep it ≤ ~30 characters.** The home timeline shows titles on a
  single line in a fixed 375px column; anything longer is **truncated with an
  ellipsis** (it will not wrap or break the layout — the full title still shows in
  the article). Prefer short, punchy titles; put detail in `summary`/body.
- **Work entries are placed by their END date**, not start. Set `date` to the end of
  the role (ongoing → today) and `start` to its beginning; the full range lives in
  `period`, and `start`→`date` drives the grey weekday baseline on the grids.
- **Don't fill in article bodies unless asked.** New entries can ship as frontmatter
  only. When drafting content, ground it in real facts and set `agent: true`.
- One text size across the whole site (currently 14px). Hierarchy comes from weight,
  colour, and underlines — not size. Don't introduce new `text-[Npx]` values.

## Dev

- `pnpm dev` — local server (port 4321)
- `pnpm build` — static build; run before deploying
- `pnpm sync-commits` — refresh `src/data/commits.json` from GitHub (also runs
  automatically at the start of `pnpm build`). Fails soft: if the API is
  unreachable it keeps the committed snapshot, so a build never breaks. Set a
  `GITHUB_TOKEN` env var (locally and in Vercel) to avoid the 60-req/hr
  unauthenticated rate limit; public repos work without one.
- Deploys via Vercel on push to `main` (production = azuolas.xyz).
