# aws-content-relay-hub

# コンテンツリレーハブ
<details>
<summary><b>📂 docs/ フォルダの記事を見る</b></summary>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; padding: 15px 0;">
  <div>• <a href="docs/aws-security.md">AWSのセキュリティとコンプライアンス</a></div>
  <div>• <a href="docs/aws-well-architected-ja.md">AWS Well-Architected フレームワーク</a></div>
  <div>• <a href="docs/cost-optimization.md">AWSコスト最適化</a></div>
  <div>• <a href="docs/db-migration.md">AWS DB移行</a></div>
  <div>• <a href="docs/greengrass-v2-intro-ja.md">AWS IoT Greengrass V2 入門</a></div>
  <div>• <a href="docs/iot-core-mqtt-bestpractice-ja.md">AWS IoT Core MQTT ベストプラクティス</a></div>
  <div>• <a href="docs/lambda-edge-kiosk-ja.md">Lambda Edge キオスク</a></div>
  <div>• <a href="content-relay-hub-overview-ja.md">AWS コンテンツリレーハブ</a></div>
</div>


</details>


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
