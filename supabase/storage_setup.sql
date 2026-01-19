-- Supabase Storage バケット作成スクリプト

-- 商品画像用バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 納品書画像用バケット（purchase_imagesという名前で作成済みの場合はスキップ）
INSERT INTO storage.buckets (id, name, public)
VALUES ('purchase_images', 'purchase_images', true)
ON CONFLICT (id) DO NOTHING;

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

-- 納品書画像バケット（purchase_images）のポリシー設定
-- 認証済みユーザーは納品書をアップロード可能
CREATE POLICY "Authenticated users can upload purchase images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'purchase_images');

-- 認証済みユーザーは納品書を更新可能
CREATE POLICY "Authenticated users can update purchase images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'purchase_images');

-- 認証済みユーザーは納品書を削除可能
CREATE POLICY "Authenticated users can delete purchase images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'purchase_images');

-- すべてのユーザーは納品書を閲覧可能（公開バケット）
CREATE POLICY "Anyone can view purchase images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'purchase_images');
