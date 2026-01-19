-- Supabase Storage バケット作成スクリプト

-- 商品画像用バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- 納品書画像用バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('purchase-invoices', 'purchase-invoices', true);

-- 商品画像バケットのポリシー設定
-- 認証済みユーザーは画像をアップロード可能
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- 認証済みユーザーは画像を更新可能
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- 認証済みユーザーは画像を削除可能
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- すべてのユーザーは画像を閲覧可能（公開バケット）
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 納品書画像バケットのポリシー設定
-- 認証済みユーザーは納品書をアップロード可能
CREATE POLICY "Authenticated users can upload invoices"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'purchase-invoices');

-- 認証済みユーザーは納品書を更新可能
CREATE POLICY "Authenticated users can update invoices"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'purchase-invoices');

-- 認証済みユーザーは納品書を削除可能
CREATE POLICY "Authenticated users can delete invoices"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'purchase-invoices');

-- 認証済みユーザーのみ納品書を閲覧可能
CREATE POLICY "Authenticated users can view invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'purchase-invoices');
