
-- Insert or update initial settings
INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES 
('site_name', 'سوق حلب'),
('site_description', 'منصة الخدمات الرقمية الرائدة في الشرق الأوسط'),
('announcement_text', 'مرحباً بكم في سوق حلب - منصة الخدمات الرقمية الرائدة! خصومات تصل إلى 50% على جميع الخدمات'),
('primary_color', '#dc2626'),
('secondary_color', '#059669'),
('support_email', 'support@markethalab.com'),
('support_phone', '+963123456789'),
('min_deposit_amount', '10'),
('max_deposit_amount', '1000');

-- Insert initial categories (only if not exists)
INSERT OR IGNORE INTO categories (name_ar, name_en, description, image_url, sort_order) VALUES 
('وسائل التواصل الاجتماعي', 'Social Media', 'خدمات زيادة المتابعين والإعجابات', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop', 1),
('التسويق الرقمي', 'Digital Marketing', 'خدمات التسويق والإعلانات الرقمية', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', 2),
('تصميم الجرافيك', 'Graphic Design', 'خدمات التصميم والجرافيك المتنوعة', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop', 3),
('كتابة المحتوى', 'Content Writing', 'خدمات كتابة المحتوى والمقالات', 'https://images.unsplash.com/photo-1486312338219-ce68e2c6b81d?w=400&h=300&fit=crop', 4),
('التطوير والبرمجة', 'Development', 'خدمات التطوير والبرمجة', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop', 5),
('الصوتيات', 'Audio Services', 'خدمات التسجيل والصوتيات', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop', 6);

-- Insert initial banners (only if not exists)
INSERT OR IGNORE INTO banners (title, image_url, link_url, sort_order) VALUES 
('خصم 50% على جميع خدمات وسائل التواصل', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=400&fit=crop', '/categories', 1),
('احصل على متابعين حقيقيين بأفضل الأسعار', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=400&fit=crop', '/categories', 2),
('خدمات التسويق الرقمي المتقدمة', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop', '/categories', 3);

-- Insert initial products (only if not exists)
INSERT OR IGNORE INTO products (category_id, name_ar, name_en, description, price, image_url, service_type, min_quantity, max_quantity) VALUES 
(1, 'متابعين إنستغرام عرب', 'Instagram Arabic Followers', 'متابعين عرب حقيقيين لحساب الإنستغرام الخاص بك', 5.99, 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=300&fit=crop', 'package', 100, 10000),
(1, 'إعجابات فيسبوك', 'Facebook Likes', 'إعجابات حقيقية لمنشورات الفيسبوك', 2.99, 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=300&fit=crop', 'package', 50, 5000),
(1, 'مشاهدات يوتيوب', 'YouTube Views', 'مشاهدات حقيقية لفيديوهات يوتيوب', 3.49, 'https://images.unsplash.com/photo-1611262588019-db6cc2032da3?w=400&h=300&fit=crop', 'package', 1000, 100000),
(2, 'حملة إعلانية متكاملة', 'Complete Ad Campaign', 'حملة إعلانية شاملة على جميع المنصات', 199.99, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', 'service', 1, 5),
(3, 'تصميم لوغو احترافي', 'Professional Logo Design', 'تصميم لوغو احترافي مميز لعلامتك التجارية', 49.99, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop', 'service', 1, 10),
(4, 'كتابة مقال 1000 كلمة', '1000 Word Article', 'مقال احترافي 1000 كلمة في أي موضوع', 15.99, 'https://images.unsplash.com/photo-1486312338219-ce68e2c6b81d?w=400&h=300&fit=crop', 'service', 1, 20);

-- Insert initial payment methods (only if not exists)
INSERT OR IGNORE INTO payment_methods (name_ar, name_en, description_ar, description_en, instructions_ar, instructions_en, image_url, sort_order) VALUES 
('فودافون كاش', 'Vodafone Cash', 'محفظة فودافون الإلكترونية', 'Vodafone Electronic Wallet', 'قم بتحويل المبلغ إلى رقم: 01234567890 وارسل صورة الإيصال', 'Transfer to: 01234567890 and send receipt image', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=150&fit=crop', 1),
('أورانج موني', 'Orange Money', 'محفظة أورانج الإلكترونية', 'Orange Electronic Wallet', 'قم بتحويل المبلغ إلى رقم: 01987654321 وارسل صورة الإيصال', 'Transfer to: 01987654321 and send receipt image', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=150&fit=crop', 2),
('إتصالات كاش', 'Etisalat Cash', 'محفظة اتصالات الإلكترونية', 'Etisalat Electronic Wallet', 'قم بتحويل المبلغ إلى رقم: 01147258369 وارسل صورة الإيصال', 'Transfer to: 01147258369 and send receipt image', 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=200&h=150&fit=crop', 3),
('بايبال', 'PayPal', 'الدفع عبر بايبال', 'Payment via PayPal', 'قم بإرسال المبلغ إلى: admin@markethalab.com', 'Send payment to: admin@markethalab.com', 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=200&h=150&fit=crop', 4);
