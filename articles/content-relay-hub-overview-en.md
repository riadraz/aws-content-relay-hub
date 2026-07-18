---
title: "aws-content-relay-hub — Architecture Deep Dive: Auto-Publishing from GitHub to Qiita, Zenn, and Mirror Repos"
tags: [aws, github-actions, qiita, zenn, typescript]
private: false
qiita_id: null
lang: en
emoji: 🚀
type: tech
published: true
---

# aws-content-relay-hub — Architecture Deep Dive: Auto-Publishing from GitHub to Qiita, Zenn, and Mirror Repos

日本語版はこちら → [Japanese Version](content-relay-hub-overview-ja.md)

---

## Overview

**aws-content-relay-hub** is a single-source Markdown repository that implements "write once, publish everywhere."  
A push to `main` triggers GitHub Actions to automatically distribute content to:

- **Qiita** — new posts and updates via API v2
- **Zenn** — native sync via GitHub integration
- **Mirror repositories** — push to multiple GitHub repos via Octokit

---

## Directory Layout

```
aws-content-relay-hub/
├── articles/          # All Markdown articles (single source of truth)
│   ├── *-en.md        # English versions
│   └── *-ja.md        # Japanese versions (CI trigger target)
├── config/
│   ├── mapping.yml    # Tracks Qiita article IDs per file
│   └── platforms.yml  # Enabled platforms and mirror repo targets
├── scripts/
│   ├── qiita-post.ts      # Post new article to Qiita
│   ├── qiita-update.ts    # Update existing Qiita article
│   └── sync-mirror-repos.js  # Sync to mirror repositories
└── .github/workflows/
    └── jp-content-sync.yml  # CI workflow
```

---

## Architecture: Event-Driven Fan-Out

```
push to main (*-ja.md)
        │
        ▼
  jp-content-sync.yml
        │
   ┌────┴────┬──────────────┐
   ▼         ▼              ▼
Qiita API  Zenn (GitHub)  Mirror Repos
(post/update)  (native sync)  (Octokit PUT)
```

The CI pipeline only triggers on `*-ja.md` file changes, keeping the Japanese content pipeline independently managed from English content.

---

## Two-Stage File Detection

```yaml
# Stage 1: event payload (reliable for incremental pushes)
CHANGED=$(jq -r '.commits[].modified[], .commits[].added[]' "$GITHUB_EVENT_PATH" \
  | grep '\-ja.md$' | tr '\n' ' ' || true)

# Stage 2: fallback for first-time publish
CHANGED=$(git ls-files "articles/*-ja.md" | tr '\n' ' ' || true)
```

The `|| true` prevents the step from failing when no files are found.

---

## Frontmatter Design

Each article manages metadata via YAML frontmatter:

```yaml
---
title: Article Title
tags: [aws, iot, greengrass]
private: false
qiita_id: null        # null = not yet posted; string = Qiita article ID
lang: ja
---
```

Articles with `qiita_id: null` are posted as new by `qiita-post.ts`; articles with an ID set are skipped. This ensures idempotency.

---

## Qiita Post Script (TypeScript)

```typescript
// Core of scripts/qiita-post.ts
const QIITA_TOKEN = process.env.QIITA_TOKEN;
if (!QIITA_TOKEN) throw new Error("QIITA_TOKEN is not set");

async function postToQiita(filePath: string) {
  const { meta, body } = parseFrontmatter(raw);
  if (meta.qiita_id) { console.log("Already posted, skipping"); return; }

  const qiitaBody = body + `\n\n---\n> Auto-posted from GitHub repository "aws-content-relay-hub".\n`;

  const res = await fetch("https://qiita.com/api/v2/items", {
    method: "POST",
    headers: { Authorization: `Bearer ${QIITA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ title: meta.title, tags: meta.tags.map(n => ({ name: n })), body: qiitaBody, private: meta.private ?? false })
  });
}
```

---

## Mirror Repo Sync (Octokit)

Mirror targets are specified via the `MIRROR_REPOS` env var in `owner/repo:/destination-path` format:

```
riadraz/x-engineer:/docs/
```

The sync logic retrieves the existing file SHA for an existence check, then creates or updates via PUT:

```javascript
// Fetch existing file SHA, then PUT to create or update
const sha = await getFileSha(octokit, owner, repo, targetPath);
await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
  owner, repo, path: targetPath,
  message: `Sync JP article: ${filename}`,
  content: base64Content,
  sha  // undefined = create, string = update
});
```

---

## Tech Stack

| Item | Detail |
|---|---|
| Languages | TypeScript 5.5 (strict mode), JavaScript ESM |
| Runtime | Node.js 20 |
| TS runner | `tsx` (CI); `ts-node` avoided due to Node 24 ESM incompatibility |
| HTTP client | `node-fetch` v3 |
| GitHub API | `octokit` v3 |
| CI/CD | GitHub Actions |

---

## Error Handling Philosophy

- Required env vars **throw immediately at module load time** (fail fast)
- Unrecoverable errors use `throw`; only recoverable errors (e.g. 404) use `try/catch`
- Top-level async calls attach `.catch(e => { console.error(e); process.exit(1) })`

---

## Summary

aws-content-relay-hub is a **simple fan-out architecture** combining thin CLI scripts with GitHub Actions. Each integration (Qiita, Zenn, mirrors) is independently replaceable with no shared library layer, keeping maintenance overhead low.

If you manage a technical blog across multiple platforms, this pattern is worth adopting.
