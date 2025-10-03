
-- Admin users table
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mocha_user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions TEXT DEFAULT '{}',
  is_active BOOLEAN DEFAULT 1,
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Site settings table
INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES 
('site_name', 'سوق حلب'),
('announcement_text', 'مرحباً بكم في سوق حلب - منصة الخدمات الرقمية الرائدة'),
('site_logo_url', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=200&fit=crop'),
('primary_color', '#dc2626'),
('enable_registrations', '1'),
('min_deposit_amount', '10'),
('max_deposit_amount', '1000');

-- Sample banners
INSERT OR IGNORE INTO banners (title, image_url, link_url, sort_order) VALUES 
('عرض خاص', 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=800&h=400&fit=crop', '/categories', 1),
('خدمات متنوعة', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop', '/categories', 2),
('جودة عالية', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop', '/categories', 3);

-- Sample categories
INSERT OR IGNORE INTO categories (name_ar, name_en, description, image_url, sort_order) VALUES 
('وسائل التواصل الاجتماعي', 'Social Media', 'خدمات المتابعين والإعجابات', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop', 1),
('التسويق الرقمي', 'Digital Marketing', 'حلول التسويق والإعلان', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop', 2),
('تطوير المواقع', 'Web Development', 'تصميم وتطوير المواقع', 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=300&h=200&fit=crop', 3),
('التصميم الجرافيكي', 'Graphic Design', 'خدمات التصميم الإبداعي', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop', 4),
('الكتابة والترجمة', 'Writing & Translation', 'محتوى عالي الجودة', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=200&fit=crop', 5),
('الاستشارات', 'Consulting', 'استشارات مهنية متخصصة', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop', 6);

-- Sample products
INSERT OR IGNORE INTO products (category_id, name_ar, name_en, description, price, image_url, service_type, min_quantity, max_quantity) VALUES 
(1, 'متابعين إنستغرام', 'Instagram Followers', 'متابعين حقيقيين عالي الجودة', 5.00, 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop', 'package', 100, 10000),
(1, 'إعجابات فيسبوك', 'Facebook Likes', 'إعجابات سريعة وآمنة', 3.00, 'https://images.unsplash.com/photo-1633675254053-d96c7668c3b8?w=300&h=200&fit=crop', 'package', 50, 5000),
(2, 'حملة إعلانية', 'Ad Campaign', 'حملة إعلانية متكاملة', 50.00, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop', 'service', 1, 10),
(3, 'تطوير موقع', 'Website Development', 'موقع ويب احترافي', 200.00, 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=300&h=200&fit=crop', 'service', 1, 5);

-- Sample payment methods
INSERT OR IGNORE INTO payment_methods (name_ar, name_en, description_ar, instructions_ar, image_url, requires_receipt, requires_transaction_id, sort_order) VALUES 
('فودافون كاش', 'Vodafone Cash', 'الدفع عبر محفظة فودافون الإلكترونية', 'قم بتحويل المبلغ إلى رقم: 01xxxxxxxxx ثم ارفق صورة الإيصال', 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=300&h=200&fit=crop', 1, 1, 1),
('أورانج موني', 'Orange Money', 'الدفع عبر محفظة أورانج الإلكترونية', 'قم بتحويل المبلغ إلى رقم: 01xxxxxxxxx ثم ارفق صورة الإيصال', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop', 1, 1, 2),
('بايبال', 'PayPal', 'الدفع الآمن عبر بايبال', 'قم بإرسال المبلغ إلى: payments@example.com', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop', 1, 0, 3),
('فيزا/ماستركارد', 'Visa/Mastercard', 'الدفع بالبطاقة الائتمانية', 'سيتم توجيهك لبوابة الدفع الآمنة', 'https://images.unsplash.com/photo-1556742049-bebda4e38f71?w=300&h=200&fit=crop', 0, 0, 4);
