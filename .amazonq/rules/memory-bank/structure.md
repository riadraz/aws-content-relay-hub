# Project Structure

## Directory Layout
```
aws-content-relay-hub/
├── articles/               # All Markdown articles (source of truth)
│   ├── *-en.md             # English versions
│   └── *-ja.md             # Japanese versions (trigger CI pipeline)
├── books/                  # Zenn book content (currently empty)
├── config/
│   ├── mapping.yml         # Tracks Qiita article IDs per article file
│   └── platforms.yml       # Enabled platforms and mirror repo targets
├── scripts/
│   ├── qiita-post.ts       # Posts a new article to Qiita API v2
│   ├── qiita-update.ts     # Updates an existing Qiita article by ID
│   └── sync-mirror-repos.js # Syncs articles to mirror GitHub repos via Octokit
├── .github/workflows/
│   └── jp-content-sync.yml # CI: detects changed *-ja.md files and runs all sync steps
├── package.json            # ESM Node project, npm scripts for each operation
├── tsconfig.json           # TypeScript: ES2020, ESNext modules, strict mode
├── qiita.config.json       # Qiita CLI configuration
└── README.md
```

## Core Components

### Articles (`articles/`)
Source Markdown files with YAML frontmatter (`title`, `tags`, `private`, `qiita_id`, `lang`). Bilingual pairs share a base name with `-en`/`-ja` suffixes. All articles **must** have a `---` frontmatter block — files without frontmatter are skipped by `qiita-post.ts` with a warning.

### Scripts (`scripts/`)
Three standalone scripts, each invoked directly by CI or npm scripts:
- `qiita-post.ts` — reads a file path from argv, parses frontmatter, POSTs to Qiita; skips if `qiita_id` already set
- `qiita-update.ts` — reads Qiita ID from frontmatter, PATCHes existing article
- `sync-mirror-repos.js` — receives file list + repo targets from env/argv, uses Octokit to push files to `docs/` folder in mirror repo

### Config (`config/`)
- `mapping.yml`: article filename → `qiita_id` / `zenn_slug` mapping; `qiita_id: null` means unpublished
- `platforms.yml`: feature flags (`qiita.enabled`, `zenn.enabled`) and mirror repo list with `owner`, `name`, `target_path`

### CI Workflow (`.github/workflows/jp-content-sync.yml`)
Single job `jp-sync` with two-stage file detection (event payload → fallback `git ls-files`), then sequential steps for Qiita post, Zenn notification, and mirror sync.

## Live Mirror Target
- `riadraz/x-engineer` → `docs/` folder
- Configured via `MIRROR_REPOS` env var in workflow as `riadraz/x-engineer:/docs/`

## Architectural Pattern
**Event-driven fan-out**: A push to `main` touching `*-ja.md` files fans out to N publishing targets in a single CI job. Scripts are thin CLI wrappers — no shared library layer — keeping each integration independently replaceable.
