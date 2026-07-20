# aws-content-relay-hub

# コンテンツリレーハブ
<details>
<summary><b>📂 docs/ フォルダの記事を見る</b></summary>

- [Content Relay Hub 日本語 (JA)](articles/content-relay-hub-overview-ja.md)
- [Content Relay Hub English (EN)](articles/content-relay-hub-overview-en.md)
- [Aws Well Architected 日本語 (JA)](articles/aws-well-architected-ja.md)
- [Qiita](https://qiita.com/items/8fa1ad7b17019c3969de)
- [Aws Greengrass V2 日本語 (JA)](articles/greengrass-v2-intro-ja.md)
- [Qiita](https://qiita.com/items/7527fb57bd74d8cb3ef9)
- [Aws Greengrass v2 English (EN)](articles/greengrass-v2-intro-en.md)
- [Aws Iot Mqtt 日本語 (JA)](articles/iot-core-mqtt-bestpractice-ja.md)
- [Qiita](https://qiita.com/items/f9d6d64a7b58125e0fda)
- [Aws Iot Mqtt English (EN)](articles/iot-core-mqtt-bestpractice-en.md)
- [Aws Lambda Edge 日本語 (JA)](articles/lambda-edge-kiosk-ja.md)
- [Qiita](https://qiita.com/items/14e0e61175a3ca191199)
- [Aws Lambda Edge English (EN)](articles/lambda-edge-kiosk-en.md)

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
