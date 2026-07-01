# azuolas.xyz

Personal site — Astro + Tailwind. A deliberately minimal surface with hidden depth:
the home page is one year-grouped timeline of everything; each entry opens its own
article.

## Adding an entry

Entries are MDX files. Drop a new `.mdx` in the folder for its type — it appears on
the timeline automatically (sorted by `date`, newest first).

| Type    | Folder          | Route            | Timeline tag (default) |
|---------|-----------------|------------------|------------------------|
| writing | `src/posts/`    | `/writing/<slug>` | `writing`            |
| project | `src/projects/` | `/projects/<slug>` | `app`               |
| video   | `src/videos/`   | `/videos/<slug>`  | `video`              |
| work    | `src/work/`     | `/work/<slug>`    | `work`               |

The filename (minus `.mdx`) is the slug.

### Frontmatter

Common: `title`, `date` (YYYY-MM-DD), optional `summary`, optional `tag` (overrides
the default above), optional `draft: true` (hides it), optional `agent: true` (adds a
"— written by azuolas' agent" byline, for content an agent drafted).

- **projects**: also `url` (live link — purchased domain first, hosted fallback).
- **work**: also `role`, `period` (e.g. `"Jul 2022 – Aug 2024"`), optional `url`.
- **videos**: also `src` (mp4 path in `/public`), `poster`.

### Rules that matter

- **Title length: keep it ≤ ~25 characters.** The home timeline shows titles on a
  single line; anything longer is **truncated with an ellipsis** on mobile (it will
  not wrap or break the layout — the full title still shows in the article). Prefer
  short, punchy titles; put detail in `summary`/body.
- **Work entries are placed by their END date**, not start. Set `date` to the end of
  the role (ongoing → today). The full range lives in `period`.
- **Don't fill in article bodies unless asked.** New entries can ship as frontmatter
  only. When drafting content, ground it in real facts and set `agent: true`.
- One text size across the whole site (currently 14px). Hierarchy comes from weight,
  colour, and underlines — not size. Don't introduce new `text-[Npx]` values.

## Dev

- `pnpm dev` — local server (port 4321)
- `pnpm build` — static build; run before deploying
- Deploys via Vercel on push to `main` (production = azuolas.xyz).
