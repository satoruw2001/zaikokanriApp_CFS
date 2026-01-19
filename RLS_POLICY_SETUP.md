# RLS（Row Level Security）ポリシー設定ガイド

## ❗ 重要：データ保存エラーの解決方法

店舗や商品の登録時に「保存に失敗しました」というエラーが表示される場合、Supabase のRLSポリシーが設定されていないことが原因です。

## 🔧 解決手順

### 1. Supabaseダッシュボードにアクセス
1. [Supabase](https://supabase.com) にログイン
2. プロジェクトを選択
3. 左メニューから「SQL Editor」を選択

### 2. RLSポリシーを設定
以下のSQLを実行して、認証済みユーザーがすべてのテーブルにアクセスできるようにします。

```sql
-- 全てのテーブルに対して認証済みユーザーのフルアクセスを許可（開発用）
-- 本番環境では適切なポリシーに変更してください

-- stores テーブル
CREATE POLICY "Enable all for authenticated users" 
ON stores FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- products テーブル
CREATE POLICY "Enable all for authenticated users" 
ON products FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ocr_product_aliases テーブル
CREATE POLICY "Enable all for authenticated users" 
ON ocr_product_aliases FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- purchases テーブル
CREATE POLICY "Enable all for authenticated users" 
ON purchases FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- purchase_items テーブル
CREATE POLICY "Enable all for authenticated users" 
ON purchase_items FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- inventory_sessions テーブル
CREATE POLICY "Enable all for authenticated users" 
ON inventory_sessions FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- inventory_records テーブル
CREATE POLICY "Enable all for authenticated users" 
ON inventory_records FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
```

### 3. SQLを実行
1. 上記のSQLをコピー
2. SQL Editorに貼り付け
3. 「Run」ボタンをクリック

### 4. 確認
- アプリケーションで店舗や商品の登録を試してください
- エラーが表示されずに保存できれば成功です

## 📝 RLSポリシーとは？

Row Level Security（RLS）は、データベースの行レベルでアクセス制御を行う機能です。

### メリット
- ✅ データの安全性が向上
- ✅ ユーザーごとに異なるデータへのアクセスを制御
- ✅ バックエンドコードを変更せずにセキュリティを強化

### 現在の設定（開発用）
- **対象**: 認証済みユーザー（ログインしているユーザー）
- **権限**: すべての操作（SELECT, INSERT, UPDATE, DELETE）が可能
- **制限**: なし（`USING (true)`）

## ⚠️ 本番環境への移行時の注意

現在の設定は開発用です。本番環境では以下のような適切なポリシーに変更してください：

```sql
-- 例: ユーザーが所属する組織のデータのみ閲覧・編集可能
CREATE POLICY "Users can only access their organization's data" 
ON stores FOR ALL 
TO authenticated 
USING (organization_id = auth.jwt() ->> 'organization_id')
WITH CHECK (organization_id = auth.jwt() ->> 'organization_id');
```

## 🔍 トラブルシューティング

### エラー: "new row violates row-level security policy"
→ RLSポリシーが正しく設定されていません。上記のSQLを実行してください。

### エラー: "permission denied for table"
→ テーブルに対する権限がありません。Supabaseプロジェクトの管理者に確認してください。

### ポリシーを削除したい場合
```sql
-- ポリシーの削除
DROP POLICY IF EXISTS "Enable all for authenticated users" ON stores;
```

## 📚 参考資料

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
