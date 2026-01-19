# Supabase セットアップガイド

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 「New Project」をクリックして新しいプロジェクトを作成
3. プロジェクト名、データベースパスワードを設定

## 2. データベーステーブルの作成

### 方法1: SQLエディタを使用（推奨）

1. Supabaseダッシュボードの左メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. `supabase/schema.sql`の内容を全てコピー＆ペースト
4. 「Run」ボタンをクリックしてSQLを実行

### 方法2: Table Editorで手動作成

各テーブルを手動で作成する方法もありますが、SQLエディタの方が効率的です。

## 3. 環境変数の設定

1. Supabaseダッシュボードの左メニューから「Project Settings」→「API」を選択
2. 以下の値をコピー：
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. プロジェクトルートに`.env.local`ファイルを作成：

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI API Configuration (後で設定)
OPENAI_API_KEY=your-openai-api-key
\`\`\`

4. 実際の値に置き換えてください

## 4. Row Level Security (RLS) ポリシーの設定

schema.sqlでRLSは有効化されていますが、ポリシーはまだ設定されていません。
開発初期段階では、以下のポリシーを追加してください：

\`\`\`sql
-- 全てのテーブルに対して認証済みユーザーのフルアクセスを許可（開発用）
-- 本番環境では適切なポリシーに変更してください

-- stores
CREATE POLICY "Enable all for authenticated users" ON stores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- products
CREATE POLICY "Enable all for authenticated users" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ocr_product_aliases
CREATE POLICY "Enable all for authenticated users" ON ocr_product_aliases FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- purchases
CREATE POLICY "Enable all for authenticated users" ON purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- purchase_items
CREATE POLICY "Enable all for authenticated users" ON purchase_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- inventory_sessions
CREATE POLICY "Enable all for authenticated users" ON inventory_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- inventory_records
CREATE POLICY "Enable all for authenticated users" ON inventory_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
\`\`\`

## 5. 認証設定

1. Supabaseダッシュボードの「Authentication」→「Providers」を選択
2. Email認証が有効になっていることを確認
3. 必要に応じて他のプロバイダー（Google, GitHubなど）を有効化

## 6. 動作確認

1. 開発サーバーを起動：`npm run dev`
2. http://localhost:3000 にアクセス
3. 新規登録でユーザーを作成
4. ログインしてダッシュボードが表示されることを確認

## トラブルシューティング

### エラー: "Your project's URL and Key are required"

`.env.local`ファイルが正しく設定されているか確認してください。
ファイルはプロジェクトルート（package.jsonと同じ階層）に配置する必要があります。

### メール確認リンクが届かない

開発環境では、Supabaseダッシュボードの「Authentication」→「Users」から、
ユーザーのメール確認ステータスを手動で変更できます。
