// Build-time GitHub commit fetch.
//
// Reads each project's `repo` frontmatter (string or list), pulls the commit
// dates authored by the site owner from the GitHub REST API, and writes a
// static { "owner/repo": { "YYYY-MM-DD": count } } map to src/data/commits.json.
//
// The home timeline and year pages read that JSON to light up the days/weeks a
// project was worked on when you hover its title. Runs before `astro build`.
//
// Fails soft: any repo that can't be fetched keeps whatever was already in
// commits.json, so a flaky network or rate-limit never breaks a deploy.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const projectsDir = join(root, 'src/projects');
const outFile = join(root, 'src/data/commits.json');

const AUTHOR = '0xmigi';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const MAX_PAGES = 20; // 100 commits/page — 2000 is plenty for a personal repo

// --- read `repo` out of each project's frontmatter -------------------------

/** Pull the frontmatter block and return the value of `repo` as a string[]. */
function reposFromFrontmatter(src) {
  const fm = src.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return [];
  const line = fm[1].match(/^repo:\s*(.+)$/m);
  if (!line) return [];
  const raw = line[1].trim();
  if (raw.startsWith('[')) {
    // repo: ["a/b", "c/d"]
    return [...raw.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
  }
  return [raw.replace(/^["']|["']$/g, '')]; // repo: "a/b"
}

async function collectRepos() {
  const files = (await readdir(projectsDir)).filter((f) => f.endsWith('.mdx'));
  const repos = new Set();
  for (const f of files) {
    const src = await readFile(join(projectsDir, f), 'utf8');
    for (const r of reposFromFrontmatter(src)) repos.add(r);
  }
  return [...repos];
}

// --- GitHub ----------------------------------------------------------------

function ghHeaders() {
  const h = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'azuolas-personal-site-build',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

/** Fetch all commit dates (UTC) for a repo, counted per day. */
async function fetchRepoCommits(repo, { author } = {}) {
  const counts = {};
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(`https://api.github.com/repos/${repo}/commits`);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    if (author) url.searchParams.set('author', author);

    const res = await fetch(url, { headers: ghHeaders() });
    if (!res.ok) {
      const err = new Error(`GitHub ${res.status} for ${repo}`);
      err.status = res.status;
      throw err;
    }
    const commits = await res.json();
    if (!Array.isArray(commits) || commits.length === 0) break;

    for (const c of commits) {
      const iso = c?.commit?.author?.date || c?.commit?.committer?.date;
      if (!iso) continue;
      const day = new Date(iso).toISOString().slice(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    }
    if (commits.length < 100) break;
  }
  return counts;
}

// --- main ------------------------------------------------------------------

async function main() {
  const repos = await collectRepos();
  if (repos.length === 0) {
    console.log('fetch-commits: no repos in frontmatter — nothing to do');
    return;
  }

  // start from whatever's already committed, so failures preserve prior data
  let out = {};
  try {
    out = JSON.parse(await readFile(outFile, 'utf8'));
  } catch {}

  let ok = 0;
  let failed = 0;
  for (const repo of repos) {
    try {
      // filter to the owner's commits; if that comes back empty (author login
      // not associated with the commit emails), fall back to all commits
      let counts = await fetchRepoCommits(repo, { author: AUTHOR });
      if (Object.keys(counts).length === 0) {
        counts = await fetchRepoCommits(repo);
      }
      out[repo] = counts;
      const days = Object.keys(counts).length;
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      console.log(`fetch-commits: ${repo} — ${total} commits across ${days} days`);
      ok++;
    } catch (e) {
      console.warn(`fetch-commits: keeping cached data for ${repo} (${e.message})`);
      failed++;
    }
  }

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log(`fetch-commits: wrote ${outFile} (${ok} ok, ${failed} kept from cache)`);
}

main().catch((e) => {
  // never fail the build on this
  console.warn(`fetch-commits: skipped (${e.message})`);
});
