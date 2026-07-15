# Technology Stack

## Languages
- **TypeScript 5.5** — Qiita scripts (`scripts/*.ts`), strict mode, ES2020 target, ESNext modules
- **JavaScript (ESM)** — Mirror sync script (`scripts/sync-mirror-repos.js`), Node native ESM (`"type": "module"`)
- **YAML** — Config files (`config/`), GitHub Actions workflow
- **Markdown** — Article content with YAML frontmatter

## Runtime
- **Node.js 20** (specified in CI via `actions/setup-node@v4`)
- **tsx** — TS runner used in CI (`npx tsx scripts/*.ts`); replaces ts-node which fails on Node 24 with ESM

## Key Dependencies
| Package | Version | Purpose |
|---|---|---|
| `node-fetch` | ^3.3.2 | HTTP client for Qiita API v2 calls |
| `octokit` | ^3.2.2 | GitHub API client for mirror repo sync |
| `js-yaml` | ^4.1.0 | Parse `config/mapping.yml` and `platforms.yml` |
| `@qiita/qiita-cli` | ^1.9.1 | Qiita CLI tooling |
| `zenn-cli` | ^0.5.2 | Zenn CLI tooling |

## TypeScript Configuration
```json
{
  "target": "ES2020",
  "module": "ESNext",
  "moduleResolution": "node",
  "esModuleInterop": true,
  "strict": true,
  "skipLibCheck": true
}
```
`ts-node` ESM config kept in `tsconfig.json` for local use but CI uses `tsx` instead due to Node 24 incompatibility.

## npm Scripts
```bash
npm run post:qiita    # tsx scripts/qiita-post.ts <article-path>
npm run update:qiita  # tsx scripts/qiita-update.ts <article-path>
npm run sync:mirrors  # node scripts/sync-mirror-repos.js
```

## CI/CD
- **GitHub Actions** — single workflow `jp-content-sync.yml`
- Trigger: push to `main` on paths `articles/*-ja.md`
- Required secrets: `QIITA_TOKEN` (Qiita PAT), `GH_TOKEN` (GitHub PAT for mirror repos)
- Mirror targets passed via `MIRROR_REPOS` env var in format `owner/repo:/target-path`

## External APIs
- **Qiita API v2**: `POST /api/v2/items` (new), `PATCH /api/v2/items/:id` (update)
- **GitHub API**: Octokit for file creation/update in mirror repositories
- **Zenn**: No API — relies on native GitHub repository integration
