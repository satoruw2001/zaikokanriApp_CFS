# 飲食店向け在庫管理・棚卸しアプリ

飲食店の「仕入れ登録」と「棚卸し」を画像活用とAIにより効率化し、正確な原価管理を行うWebアプリケーション。

## 技術スタック

- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage)
- **AI/OCR:** OpenAI API (GPT-4o)

## 主要機能

### 1. 商品マスタ管理
- 仕入先・商品・規格ごとのユニーク管理
- 商品画像、カテゴリー、入数（ケースあたりのバラ数）、標準原価の管理

### 2. 仕入れ登録（AI-OCR）
- 納品書画像のアップロード
- OpenAI API (GPT-4o) によるJSON抽出（品名・数量・金額）
- マスタとの名寄せ（学習機能付き）

### 3. 棚卸し（在庫カウント）
- 商品画像タイル表示
- ケース数とバラ数の併用入力
- 計算式: `在庫総数 = (ケース入力 × 入数) + バラ入力`

### 4. データ活用
- 仕入れ一覧、棚卸し結果のCSVダウンロード

## プロジェクト構成

```
ZaikokanriApp/
├── app/                    # Next.js App Router
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/            # Reactコンポーネント
│   └── ui/               # Shadcn/ui コンポーネント
├── lib/                   # ユーティリティ関数
│   ├── supabase.ts       # Supabaseクライアント
│   └── utils.ts          # 汎用ユーティリティ
├── supabase/             # Supabase設定
│   └── schema.sql        # データベーススキーマ
├── .env.example          # 環境変数サンプル
├── components.json       # Shadcn/ui設定
└── README.md            # このファイル
```

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env.local` にコピーして、必要な値を設定します。

```bash
cp .env.example .env.local
```

`.env.local` に以下の値を設定：
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `OPENAI_API_KEY`: OpenAI APIキー

### 3. Supabaseデータベースのセットアップ

Supabaseダッシュボードで `supabase/schema.sql` を実行してテーブルを作成します。

**重要**: データ保存エラーを防ぐため、RLSポリシーの設定が必要です。
詳細は [RLS_POLICY_SETUP.md](./RLS_POLICY_SETUP.md) を参照してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## データベース設計

### テーブル構成

- **stores**: 店舗情報
- **products**: 商品マスタ
- **ocr_product_aliases**: OCR名寄せ学習用
- **purchases**: 仕入れ情報
- **purchase_items**: 仕入れ明細
- **inventory_sessions**: 棚卸しセッション
- **inventory_records**: 棚卸し明細

詳細は `supabase/schema.sql` を参照してください。

## 開発ガイドライン

### コーディング規約
- TypeScriptの厳密な型チェックを使用
- Tailwind CSSでスタイリング
- Shadcn/uiコンポーネントを優先的に使用

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発

## ビルドとデプロイ

```bash
# 本番ビルド
npm run build

# 本番サーバー起動
npm run start
```

## ライセンス

Private
