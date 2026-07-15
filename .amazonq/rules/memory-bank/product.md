# Product Overview

## Purpose
aws-content-relay-hub is a single-source Markdown repository for cross-posting technical content to multiple publishing platforms simultaneously from one Git-based workflow.

## Value Proposition
Write once, publish everywhere. Authors maintain articles in a single repo and GitHub Actions automatically distributes content to Qiita, Zenn, and mirror repositories on every push to `main`.

## Key Features
- **Qiita publishing**: Auto-post/update Japanese articles via Qiita API v2
- **Zenn sync**: Automatic sync via Zenn's native GitHub integration
- **Mirror repo sync**: Push articles to multiple GitHub repositories (e.g. blog sites, doc portals) using Octokit
- **JP-only pipeline**: CI triggers only on `*-ja.md` files, keeping Japanese and English content independently managed
- **Frontmatter-driven metadata**: Title, tags, and visibility controlled per-article via YAML frontmatter
- **Qiita ID tracking**: `config/mapping.yml` tracks Qiita article IDs to distinguish new posts from updates

## Target Users
- AWS technical writers and developer advocates publishing bilingual (EN/JA) content
- Engineers maintaining documentation across multiple platforms from a single source of truth

## Use Cases
- Publishing AWS service introductions and best-practice guides to Qiita and Zenn
- Syncing blog content to personal/team GitHub Pages or documentation sites
- Managing bilingual article sets (e.g. `greengrass-v2-intro-en.md` + `greengrass-v2-intro-ja.md`)
