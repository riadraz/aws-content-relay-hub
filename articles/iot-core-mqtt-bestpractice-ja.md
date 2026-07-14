---
title: AWS IoT Core MQTT ベストプラクティス
tags: [aws, iot, mqtt]
private: false
qiita_id: null
lang: ja
---

# AWS IoT Core MQTT ベストプラクティス

英語版はこちら → [English Version](iot-core-mqtt-bestpractice-en.md)

---

## MQTT 設計の基本

- Topic は階層構造を意識  
- デバイスIDは固定フォーマット  
- JSON ペイロードは軽量化  
- QoS1 は必要な場合のみ  
- Shadow は状態管理に限定

## 推奨トピック構造

