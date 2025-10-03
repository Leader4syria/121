
-- Remove initial data (only the ones we added)
DELETE FROM payment_methods WHERE name_ar IN ('فودافون كاش', 'أورانج موني', 'إتصالات كاش', 'بايبال');
DELETE FROM products WHERE name_ar IN ('متابعين إنستغرام عرب', 'إعجابات فيسبوك', 'مشاهدات يوتيوب', 'حملة إعلانية متكاملة', 'تصميم لوغو احترافي', 'كتابة مقال 1000 كلمة');
DELETE FROM banners WHERE title LIKE '%خصم 50%' OR title LIKE '%متابعين حقيقيين%' OR title LIKE '%التسويق الرقمي%';
DELETE FROM categories WHERE name_ar IN ('وسائل التواصل الاجتماعي', 'التسويق الرقمي', 'تصميم الجرافيك', 'كتابة المحتوى', 'التطوير والبرمجة', 'الصوتيات');
DELETE FROM settings WHERE setting_key IN ('site_description', 'support_email', 'support_phone', 'min_deposit_amount', 'max_deposit_amount');
