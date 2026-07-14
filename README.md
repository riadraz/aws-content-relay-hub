# aws-content-relay-hub

# コンテンツリレーハブ

以下へのクロスポスト用の単一ソース Markdown リポジトリ:

- Qiita (GitHub Actions + API経由)
- Zenn (GitHub経由 GitHub連携)
- 複数のミラー リポジトリ (Web サイト、ドキュメントなど)

## 使い方

1. FrontMatter を使用して `articles/` に記事を作成します。
2. GitHub でシークレットを設定します。 
- `QIITA_TOKEN` (Qiita個人アクセストークン)
 - `GH_TOKEN` (ミラー リポジトリ用の GitHub PAT)
3. 「main」にプッシュします。
4. アクションは次のとおりです。 
- 新しい記事を Qiita に投稿します。 
- 変更された記事をミラー リポジトリに同期します。

ゼンさんの場合：

- このリポジトリを Zenn GitHub 連携に接続します。
- `articles/` または専用の `zenn/articles` フォルダーから読み取るように Zenn を設定します。
