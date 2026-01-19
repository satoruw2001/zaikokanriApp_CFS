# デプロイガイド

このアプリケーションを本番環境にデプロイする方法を説明します。

## 🚀 推奨デプロイ方法：Vercel

Next.jsを開発したVercel社が提供する無料ホスティングサービスを使用します。

### メリット
- ✅ **無料プラン**あり（趣味・個人プロジェクト向け）
- ✅ GitHubと連携して**自動デプロイ**
- ✅ Next.js 15に完全対応
- ✅ 環境変数の設定が簡単
- ✅ HTTPS対応（無料SSL証明書）
- ✅ カスタムドメイン対応

---

## 📋 デプロイ手順（Vercel）

### ステップ1: Vercelアカウントの作成

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. **GitHub**アカウントでサインアップ（推奨）

### ステップ2: プロジェクトをインポート

1. Vercelダッシュボードで「**Add New...**」→「**Project**」をクリック
2. 「**Import Git Repository**」を選択
3. GitHubから`zaikokanriApp_CFS`リポジトリを選択
4. 「**Import**」をクリック

### ステップ3: プロジェクト設定

**Configure Project**画面で以下を設定：

#### Framework Preset
- **Next.js**が自動検出されます（そのままでOK）

#### Root Directory
- `.`（ルートディレクトリ）のまま

#### Build and Output Settings
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

### ステップ4: 環境変数の設定

**Environment Variables**セクションで以下を追加：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key (将来のAI-OCR機能用)
```

**値の取得方法：**
1. **Supabaseダッシュボード** → Project Settings → API
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key
2. **OpenAI** → API Keys（将来実装時）

### ステップ5: デプロイ

1. 「**Deploy**」ボタンをクリック
2. ビルドとデプロイが自動的に開始されます（2〜3分）
3. 完了すると本番URLが表示されます

例: `https://zaikokanri-app-cfs.vercel.app`

---

## 🔄 自動デプロイの設定

GitHubにプッシュすると自動的にデプロイされます：

- **mainブランチ** → 本番環境に自動デプロイ
- **その他のブランチ** → プレビュー環境に自動デプロイ

### 手動デプロイを無効化する場合
Vercel Project Settings → Git → Production Branch

---

## 🌐 カスタムドメインの設定（オプション）

独自ドメインを使用する場合：

1. Vercelダッシュボード → プロジェクト → Settings → Domains
2. 「**Add Domain**」をクリック
3. ドメイン名を入力（例: `inventory.yourdomain.com`）
4. DNSレコードを設定（Vercelの指示に従う）

---

## ⚙️ Supabaseの本番環境設定

### 1. Redirect URLsの追加

Vercelのデプロイ後、SupabaseにRedirect URLsを追加：

1. **Supabaseダッシュボード** → Authentication → URL Configuration
2. **Site URL**: `https://your-vercel-url.vercel.app`
3. **Redirect URLs**に以下を追加:
   ```
   https://your-vercel-url.vercel.app/auth/callback
   https://your-vercel-url.vercel.app/**
   ```

### 2. CORS設定

SupabaseのAPIは自動的にVercelドメインからのリクエストを許可します。

---

## 🛠️ その他のデプロイ方法

### Netlify

1. [Netlify](https://netlify.com)にサインアップ
2. GitHubリポジトリをインポート
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. 環境変数を設定
5. Deploy

### 自前サーバー（VPS、AWS、GCPなど）

```bash
# ビルド
npm run build

# 本番サーバー起動
npm run start

# または PM2を使用
npm install -g pm2
pm2 start npm --name "zaikokanri-app" -- start
pm2 save
pm2 startup
```

**必要な環境:**
- Node.js 18以上
- npm
- PostgreSQL（Supabaseの代わり）

---

## 📊 デプロイ後の確認事項

### ✅ チェックリスト

- [ ] アプリケーションが正常に起動する
- [ ] ログイン・サインアップが動作する
- [ ] Supabase認証が正常に動作する
- [ ] 店舗・商品の登録が正常に動作する
- [ ] 画像アップロード機能が動作する（実装後）
- [ ] HTTPSで接続できる
- [ ] モバイルでも正常に表示される

### 🔍 トラブルシューティング

#### ビルドエラーが発生する
- `npm run build`をローカルで実行して確認
- TypeScriptエラーを修正
- 環境変数が正しく設定されているか確認

#### 認証エラーが発生する
- SupabaseのRedirect URLsが正しく設定されているか確認
- 環境変数が本番環境に設定されているか確認

#### データが表示されない
- RLSポリシーが設定されているか確認
- Supabaseの接続情報が正しいか確認

---

## 💰 費用について

### Vercel無料プラン
- ✅ 個人・趣味プロジェクト向け
- ✅ 月100GB帯域幅
- ✅ 自動HTTPS
- ✅ カスタムドメイン対応

### Vercel Proプラン（$20/月）
- 商用利用
- より多い帯域幅
- チームコラボレーション機能

### Supabase無料プラン
- ✅ 500MB データベース
- ✅ 1GB ファイルストレージ
- ✅ 50,000 月間アクティブユーザー

### Supabase Proプラン（$25/月）
- より大きなデータベース
- より多いストレージ
- 優先サポート

---

## 📱 モバイル対応

このアプリはレスポンシブデザインで、以下のデバイスに対応：
- 📱 iPhone / Android スマートフォン
- 📱 iPad / Android タブレット
- 💻 デスクトップ / ノートPC

---

## 🔒 セキュリティベストプラクティス

### 本番環境への移行前に

1. **環境変数の確認**
   - `.env.local`をGitにコミットしない
   - 本番環境で別の認証情報を使用

2. **RLSポリシーの見直し**
   - 開発用の`USING (true)`ポリシーを適切なものに変更
   - ユーザーごとのアクセス制御を実装

3. **エラーハンドリング**
   - 本番環境では詳細なエラーメッセージを表示しない
   - ログを適切に管理

---

## 📞 サポート

デプロイに関する問題が発生した場合：
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs

---

**準備ができたら、Vercelで簡単デプロイ！🚀**
