# Development Guidelines

## Code Quality Standards

### Error Handling
- Fail fast on missing required env vars at module load time: `if (!TOKEN) throw new Error("TOKEN is not set")`
- Use `throw` (not `console.error` + return) inside async functions for fatal errors
- Wrap top-level async calls with `.catch(e => { console.error(e); process.exit(1) })`
- Use try/catch only for recoverable errors (e.g. 404 on file-existence check); let unrecoverable errors propagate
- Non-fatal missing inputs exit with code 0 + `console.log` message (e.g. no files passed to sync script)

### TypeScript Conventions
- Strict mode enabled — no implicit `any`, always type function parameters and return values
- Define local `type` aliases for frontmatter shapes (not `interface`):
  ```ts
  type Frontmatter = { title: string; tags?: string[]; private?: boolean };
  ```
- Use `meta: any` only during dynamic YAML parsing, then cast to the typed alias immediately
- Prefer `??` (nullish coalescing) over `||` for boolean defaults: `meta.private ?? false`
- Use `as Frontmatter` cast at the return boundary, not inline during construction

### Module Style
- All files use ESM (`import`/`export`), no CommonJS `require()`
- `"type": "module"` in `package.json` — applies to `.js` files too
- Import Node built-ins without `node:` prefix: `import fs from "fs"`

## Structural Conventions

### Script Architecture
Each script is a self-contained CLI entry point:
1. Import dependencies
2. Validate env vars / argv at top level (fail fast)
3. Define pure helper functions (e.g. `parseFrontmatter`)
4. Define one primary `async function` named after the operation (e.g. `postToQiita`, `updateQiita`, `syncFileToRepo`)
5. Parse `process.argv[2]` for the article path
6. Call the primary function and attach `.catch` handler

### Frontmatter Parser Pattern
Both Qiita scripts share an identical inline frontmatter parser — no shared utility module. Pattern:
```ts
function parseFrontmatter(raw: string): { meta: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  // parse key:value lines, handle arrays [], booleans, strip quotes
  return { meta: meta as Frontmatter, body: match[2].trim() };
}
```
- `qiita-post.ts` returns `null` on missing frontmatter (soft skip)
- `qiita-update.ts` throws on missing frontmatter (hard fail)

### Qiita API Calls
Always append an attribution footer to the article body before posting:
```ts
const qiitaBody = body + `\n\n---\n> この投稿は GitHub リポジトリ "aws-content-relay-hub" から自動投稿されています。\n`;
```
Use `node-fetch` with explicit `Authorization: Bearer` header and `Content-Type: application/json`.

### Mirror Sync Pattern (Octokit)
```js
// 1. Try GET to retrieve existing file SHA
// 2. PUT with sha if exists (update), without sha if new (create)
await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
  owner, repo, path: targetPath,
  message: `Sync JP article: ${filename}`,
  content: base64Content,
  sha  // undefined = create, string = update
});
```

### Mapping Format
Mirror repo targets use `owner/repo:/destination-path` format, newline-separated:
```
riadraz/x-engineer:/docs/
```
Parsed by splitting on `\n`, then splitting each line on `:` and `/`.
- Dest path must have leading `/` stripped before passing to Octokit — GitHub API rejects paths starting with `/`
- Strip with: `dest.replace(/^\//, "").replace(/\/$/, "")`

## Naming Conventions
- Script files: `kebab-case` with operation prefix (`qiita-post`, `qiita-update`, `sync-mirror-repos`)
- Article files: `kebab-case` with `-en` or `-ja` language suffix
- Functions: `camelCase`, verb-first (`postToQiita`, `updateQiita`, `syncFileToRepo`, `parseFrontmatter`)
- Constants: `SCREAMING_SNAKE_CASE` for env var references (`QIITA_TOKEN`, `GH_TOKEN`)

## CI/CD Patterns

### File Detection (Two-Stage)
```yaml
# Stage 1: event payload (reliable for incremental pushes)
CHANGED=$(jq -r '.commits[].modified[], .commits[].added[]' "$GITHUB_EVENT_PATH" | grep '\-ja.md$' | tr '\n' ' ' || true)

# Stage 2: fallback for first-time publish
CHANGED=$(git ls-files "articles/*-ja.md" | tr '\n' ' ' || true)
```
- Always pipe through `tr '\n' ' '` to produce space-separated list — required for `for file in $FILES` loop and `node` call
- Both stages append `|| true` to prevent non-zero exit killing the step

### Qiita Rate Limits
- Qiita API allows ~50 calls/day on free plan
- Add `sleep 2` between posts in the workflow loop to avoid 429 errors
- `qiita-post.ts` skips articles where `qiita_id` is already set in frontmatter
- After first successful post, update `qiita_id` in the article frontmatter with the ID from the Qiita URL

### Secret Usage
- `QIITA_TOKEN` — scoped to Qiita post/update steps only
- `GH_TOKEN` — GitHub PAT with `repo` scope, required for cross-repo writes; auto-injected `GITHUB_TOKEN` only works on the current repo
- Never log token values; scripts only reference via `process.env`

## Config File Conventions

### mapping.yml
```yaml
articles:
  filename.md:
    qiita_id: null        # null = not yet posted; string = Qiita article ID
    zenn_slug: some-slug
```

### platforms.yml
```yaml
qiita:
  enabled: true
mirror_repos:
  - name: repo-name
    owner: github-username
    target_path: content/posts
```
