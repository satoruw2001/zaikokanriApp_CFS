-- 飲食店向け在庫管理・棚卸しアプリ データベーススキーマ
-- このファイルをSupabase SQLエディタで実行してください

-- 店舗テーブル
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 商品マスタテーブル
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  unit_per_case INTEGER DEFAULT 1,
  cost_price NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- OCR名寄せ学習用テーブル
CREATE TABLE IF NOT EXISTS ocr_product_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  alias_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(product_id, alias_name)
);

-- 仕入れテーブル
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  image_url TEXT,
  total_amount NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 仕入れ明細テーブル
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity_case INTEGER DEFAULT 0,
  quantity_loose NUMERIC(10, 2) DEFAULT 0,
  subtotal NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 棚卸しセッションテーブル
CREATE TABLE IF NOT EXISTS inventory_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('draft', 'completed')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 棚卸し明細テーブル
CREATE TABLE IF NOT EXISTS inventory_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES inventory_sessions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  count_case INTEGER DEFAULT 0,
  count_loose NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(session_id, product_id)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_ocr_product_aliases_product_id ON ocr_product_aliases(product_id);
CREATE INDEX IF NOT EXISTS idx_ocr_product_aliases_alias_name ON ocr_product_aliases(alias_name);
CREATE INDEX IF NOT EXISTS idx_purchases_store_id ON purchases(store_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON purchase_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sessions_store_id ON inventory_sessions(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sessions_date ON inventory_sessions(date);
CREATE INDEX IF NOT EXISTS idx_inventory_records_session_id ON inventory_records(session_id);
CREATE INDEX IF NOT EXISTS idx_inventory_records_product_id ON inventory_records(product_id);

-- Row Level Security (RLS) の有効化
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_product_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_records ENABLE ROW LEVEL SECURITY;

-- 自動更新トリガー用の関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルに更新日時の自動更新トリガーを設定
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_items_updated_at ON purchase_items;
CREATE TRIGGER update_purchase_items_updated_at BEFORE UPDATE ON purchase_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_sessions_updated_at ON inventory_sessions;
CREATE TRIGGER update_inventory_sessions_updated_at BEFORE UPDATE ON inventory_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_records_updated_at ON inventory_records;
CREATE TRIGGER update_inventory_records_updated_at BEFORE UPDATE ON inventory_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLSポリシーの設定（開発用 - 認証済みユーザーに全アクセスを許可）
-- 本番環境では適切なポリシーに変更してください

-- stores
DROP POLICY IF EXISTS "Enable all for authenticated users" ON stores;
CREATE POLICY "Enable all for authenticated users" ON stores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- products
DROP POLICY IF EXISTS "Enable all for authenticated users" ON products;
CREATE POLICY "Enable all for authenticated users" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ocr_product_aliases
DROP POLICY IF EXISTS "Enable all for authenticated users" ON ocr_product_aliases;
CREATE POLICY "Enable all for authenticated users" ON ocr_product_aliases FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- purchases
DROP POLICY IF EXISTS "Enable all for authenticated users" ON purchases;
CREATE POLICY "Enable all for authenticated users" ON purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- purchase_items
DROP POLICY IF EXISTS "Enable all for authenticated users" ON purchase_items;
CREATE POLICY "Enable all for authenticated users" ON purchase_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- inventory_sessions
DROP POLICY IF EXISTS "Enable all for authenticated users" ON inventory_sessions;
CREATE POLICY "Enable all for authenticated users" ON inventory_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- inventory_records
DROP POLICY IF EXISTS "Enable all for authenticated users" ON inventory_records;
CREATE POLICY "Enable all for authenticated users" ON inventory_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
