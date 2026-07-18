---
title: aws-content-relay-hub — GitHub から Qiita・Zenn・ミラーリポジトリへ一括配信するアーキテクチャ解説
tags: [aws, github-actions, qiita, zenn, typescript]
private: false
qiita_id: null
lang: ja
emoji: 🚀
type: tech
published: true
---

# aws-content-relay-hub — GitHub から Qiita・Zenn・ミラーリポジトリへ一括配信するアーキテクチャ解説

英語版はこちら → [English Version](content-relay-hub-overview-en.md)

---

## 概要

**aws-content-relay-hub** は「一度書いて、どこにでも公開する」を実現する単一ソース Markdown リポジトリです。  
`main` ブランチへのプッシュをトリガーに、GitHub Actions が自動的に以下へ配信します。

- **Qiita** — API v2 経由で新規投稿・更新
- **Zenn** — GitHub 連携によるネイティブ同期
- **ミラーリポジトリ** — Octokit 経由で複数の GitHub リポジトリへプッシュ

---

## ディレクトリ構成

```
aws-content-relay-hub/
├── articles/          # 全 Markdown 記事（単一ソース）
│   ├── *-en.md        # 英語版
│   └── *-ja.md        # 日本語版（CI トリガー対象）
├── config/
│   ├── mapping.yml    # Qiita 記事 ID の追跡
│   └── platforms.yml  # 有効プラットフォームとミラー設定
├── scripts/
│   ├── qiita-post.ts      # Qiita 新規投稿
│   ├── qiita-update.ts    # Qiita 記事更新
│   └── sync-mirror-repos.js  # ミラーリポジトリ同期
└── .github/workflows/
    └── jp-content-sync.yml  # CI ワークフロー
```

---

## アーキテクチャ：イベント駆動ファンアウト

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

CI は `*-ja.md` ファイルの変更のみを検知し、日本語コンテンツパイプラインを独立して管理します。

---

## ファイル検知：2 段階方式

```yaml
# Stage 1: イベントペイロードから取得（増分プッシュに信頼性が高い）
CHANGED=$(jq -r '.commits[].modified[], .commits[].added[]' "$GITHUB_EVENT_PATH" \
  | grep '\-ja.md$' | tr '\n' ' ' || true)

# Stage 2: 初回公開時のフォールバック
CHANGED=$(git ls-files "articles/*-ja.md" | tr '\n' ' ' || true)
```

`|| true` を付けることで、ファイルが見つからない場合でもステップが失敗しません。

---

## フロントマター設計

各記事は YAML フロントマターでメタデータを管理します。

```yaml
---
title: 記事タイトル
tags: [aws, iot, greengrass]
private: false
qiita_id: null        # null = 未投稿、文字列 = Qiita 記事 ID
lang: ja
---
```

`qiita_id: null` の記事は `qiita-post.ts` が新規投稿し、ID が設定済みの記事はスキップします。これにより冪等性を保ちます。

---

## Qiita 投稿スクリプト（TypeScript）

```typescript
// scripts/qiita-post.ts の核心部分
const QIITA_TOKEN = process.env.QIITA_TOKEN;
if (!QIITA_TOKEN) throw new Error("QIITA_TOKEN is not set");

async function postToQiita(filePath: string) {
  const { meta, body } = parseFrontmatter(raw);
  if (meta.qiita_id) { console.log("Already posted, skipping"); return; }

  const qiitaBody = body + `\n\n---\n> この投稿は GitHub リポジトリ "aws-content-relay-hub" から自動投稿されています。\n`;

  const res = await fetch("https://qiita.com/api/v2/items", {
    method: "POST",
    headers: { Authorization: `Bearer ${QIITA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ title: meta.title, tags: meta.tags.map(n => ({ name: n })), body: qiitaBody, private: meta.private ?? false })
  });
}
```

---

## ミラーリポジトリ同期（Octokit）

ミラー先は `MIRROR_REPOS` 環境変数で `owner/repo:/destination-path` 形式で指定します。

```
riadraz/x-engineer:/docs/
```

同期ロジックは SHA を取得して存在確認し、PUT で作成または更新します。

```javascript
// 既存ファイルの SHA を取得してから PUT
const sha = await getFileSha(octokit, owner, repo, targetPath);
await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
  owner, repo, path: targetPath,
  message: `Sync JP article: ${filename}`,
  content: base64Content,
  sha  // undefined = 新規作成、string = 更新
});
```

---

## 技術スタック

| 項目 | 内容 |
|---|---|
| 言語 | TypeScript 5.5（strict モード）、JavaScript ESM |
| ランタイム | Node.js 20 |
| TS 実行 | `tsx`（CI）、`ts-node` は Node 24 ESM 非互換のため不使用 |
| HTTP クライアント | `node-fetch` v3 |
| GitHub API | `octokit` v3 |
| CI | GitHub Actions |

---

## エラーハンドリング方針

- 必須環境変数は **モジュールロード時に即時 throw**（フェイルファスト）
- 回復不能なエラーは `throw`、回復可能なエラー（404 など）のみ `try/catch`
- トップレベルの非同期呼び出しには `.catch(e => { console.error(e); process.exit(1) })` を付与

---

## まとめ

aws-content-relay-hub は、薄い CLI スクリプト群と GitHub Actions を組み合わせた**シンプルなファンアウトアーキテクチャ**です。各インテグレーション（Qiita・Zenn・ミラー）は独立して置き換え可能で、共有ライブラリ層を持たないため保守性が高いです。

技術ブログを複数プラットフォームで管理している方は、ぜひ参考にしてください。
