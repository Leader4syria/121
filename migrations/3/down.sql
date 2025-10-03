
DROP TABLE admin_users;
DELETE FROM settings WHERE setting_key IN ('site_name', 'announcement_text', 'site_logo_url', 'primary_color', 'enable_registrations', 'min_deposit_amount', 'max_deposit_amount');
DELETE FROM banners;
DELETE FROM categories;
DELETE FROM products; 
DELETE FROM payment_methods;
