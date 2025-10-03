
-- حذف الفهارس
DROP INDEX idx_categories_parent_id;
DROP INDEX idx_products_status;
DROP INDEX idx_products_external_id;
DROP INDEX idx_products_provider_id;

-- إزالة الأعمدة المضافة للفئات
ALTER TABLE categories DROP COLUMN full_path;
ALTER TABLE categories DROP COLUMN level;
ALTER TABLE categories DROP COLUMN parent_id;

-- إزالة الأعمدة المضافة للمنتجات
ALTER TABLE products DROP COLUMN available;
ALTER TABLE products DROP COLUMN params;
ALTER TABLE products DROP COLUMN qty_values;
ALTER TABLE products DROP COLUMN status;
ALTER TABLE products DROP COLUMN product_type;
ALTER TABLE products DROP COLUMN base_price;
ALTER TABLE products DROP COLUMN external_id;
ALTER TABLE products DROP COLUMN provider_id;

-- حذف جدول مزودي الخدمات
DROP TABLE service_providers;
