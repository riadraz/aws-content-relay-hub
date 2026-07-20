# aws-content-relay-hub

# コンテンツリレーハブ
<details>
<summary><b>📂 docs/ フォルダの記事を見る</b></summary>

<table>
  <tr>
    <td>[AWSのセキュリティとコンプライアンス](docs/aws-security.md)</td>
    <td>[AWS Well-Architected フレームワーク](docs/aws-well-architected-ja.md)</td>
  </tr>
  <tr>
    <td>[AWSコスト最適化](docs/cost-optimization.md)</td>
    <td>[AWS DB移行](docs/db-migration.md)</td>
  </tr>
  <tr>
    <td>[AWS IoT Greengrass V2 入門](docs/greengrass-v2-intro-ja.md)</td>
    <td>[AWS IoT Core MQTT ベストプラクティス](docs/iot-core-mqtt-bestpractice-ja.md)</td>
  </tr>
  <tr>
    <td>[Lambda Edge キオスク](docs/lambda-edge-kiosk-ja.md)</td>
    <td>[AWS コンテンツリレーハブ](content-relay-hub-overview-ja.md)</td>
  </tr>
</table>

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
