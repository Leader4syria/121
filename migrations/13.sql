
-- إضافة جدول مزودي الخدمات
CREATE TABLE service_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  api_url TEXT NOT NULL,
  api_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  last_sync_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- تحديث جدول المنتجات لإضافة الحقول الجديدة
ALTER TABLE products ADD COLUMN provider_id INTEGER;
ALTER TABLE products ADD COLUMN external_id TEXT;
ALTER TABLE products ADD COLUMN base_price REAL;
ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'manual';
ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'accept';
ALTER TABLE products ADD COLUMN qty_values TEXT;
ALTER TABLE products ADD COLUMN params TEXT;
ALTER TABLE products ADD COLUMN available BOOLEAN DEFAULT 1;

-- تحديث جدول الفئات لإضافة دعم الهرمية
ALTER TABLE categories ADD COLUMN parent_id INTEGER;
ALTER TABLE categories ADD COLUMN level INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN full_path TEXT;

-- إنشاء فهارس للأداء
CREATE INDEX idx_products_provider_id ON products(provider_id);
CREATE INDEX idx_products_external_id ON products(external_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
