---
title: Lambda@Edge を使ったキオスク端末向け高速配信
tags: [aws, lambda, edge, kiosk]
private: false
qiita_id: null
lang: ja
---

# Lambda@Edge を使ったキオスク端末向け高速配信

英語版はこちら → [English Version](lambda-edge-kiosk-en.md)

---

## 概要

キオスク端末では、  
- レスポンス速度  
- キャッシュ制御  
- セキュリティ  
が重要です。

Lambda@Edge を使うことで、CloudFront のエッジロケーションで  
**即時レスポンス**を返すことができ、  
店舗や駅構内の端末でも高速表示が可能になります。

## ユースケース

- 駅の券売機 UI  
- 店舗のセルフレジ  
- 観光案内端末
