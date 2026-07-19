---
title: AWS Control Tower ランディングゾーン自動構築ガイド
tags: [aws, controltower, terraform, iac, landingzone]
private: false
qiita_id: null
---

# AWS Control Tower ランディングゾーン自動構築ガイド

AWS Control Tower を使用して、マルチアカウント環境のランディングゾーンを自動構築する手順を解説します。

## なぜ Control Tower が必要か

手動でのAWSアカウント管理は以下の問題を引き起こします：

- ガバナンスの崩壊
- セキュリティガードレールの欠如
- 属人的な設定管理

## アーキテクチャ概要

```
Management Account
├── Log Archive Account
├── Audit Account
└── Workload OUs
    ├── Production
    └── Development
```

## Terraform による自動化

```hcl
resource "aws_organizations_account" "workload" {
  name      = "workload-production"
  email     = "aws-prod@yourcompany.com"
  role_name = "OrganizationAccountAccessRole"
}
```

## ガードレール設定

| ガードレール | タイプ | 効果 |
|---|---|---|
| S3パブリックアクセス禁止 | 予防的 | SCP で強制 |
| CloudTrail 有効化 | 検出的 | 自動監査 |
| MFA 必須化 | 予防的 | IAM ポリシー |

## まとめ

Control Tower + Terraform により、新規アカウント発行からセキュリティ設定まで**15分で完了**します。


