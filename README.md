# aws-content-relay-hub

# コンテンツリレーハブ

## 📚 Articles

<details>
<summary>aws-content-relay-hub アーキテクチャ解説 / Architecture Deep Dive</summary>

**Tags:** `aws` `github-actions` `qiita` `zenn` `typescript`

- 📄 [日本語 (JA)](articles/content-relay-hub-overview-ja.md)
- 📄 [English (EN)](articles/content-relay-hub-overview-en.md)

</details>

<details>
<summary>AWS Well-Architected Framework 実践ガイド</summary>

**Lang:** JA &nbsp;|&nbsp; **Tags:** `aws` `well-architected` `architecture` `genai`

- 📄 [Source](articles/aws-well-architected-ja.md)
- 🔗 [Qiita](https://qiita.com/items/8fa1ad7b17019c3969de)

</details>

<details>
<summary>AWS IoT Greengrass V2 入門 / Introduction to AWS IoT Greengrass V2</summary>

**Tags:** `aws` `iot` `greengrass` `edge`

- 📄 [日本語 (JA)](articles/greengrass-v2-intro-ja.md) &nbsp;|&nbsp; [Qiita](https://qiita.com/items/7527fb57bd74d8cb3ef9)
- 📄 [English (EN)](articles/greengrass-v2-intro-en.md)

</details>

<details>
<summary>AWS IoT Core MQTT ベストプラクティス / Best Practices</summary>

**Tags:** `aws` `iot` `mqtt`

- 📄 [日本語 (JA)](articles/iot-core-mqtt-bestpractice-ja.md) &nbsp;|&nbsp; [Qiita](https://qiita.com/items/f9d6d64a7b58125e0fda)
- 📄 [English (EN)](articles/iot-core-mqtt-bestpractice-en.md)

</details>

<details>
<summary>Lambda@Edge を使ったキオスク端末向け高速配信 / Lambda@Edge for Kiosk Fast Delivery</summary>

**Tags:** `aws` `lambda` `edge` `kiosk`

- 📄 [日本語 (JA)](articles/lambda-edge-kiosk-ja.md) &nbsp;|&nbsp; [Qiita](https://qiita.com/items/14e0e61175a3ca191199)
- 📄 [English (EN)](articles/lambda-edge-kiosk-en.md)

</details>

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
