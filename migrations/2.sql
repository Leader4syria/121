
CREATE TABLE payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  image_url TEXT,
  description_ar TEXT,
  description_en TEXT,
  instructions_ar TEXT,
  instructions_en TEXT,
  requires_receipt BOOLEAN DEFAULT 1,
  requires_transaction_id BOOLEAN DEFAULT 0,
  custom_fields TEXT,
  is_active BOOLEAN DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallet_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  transaction_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method_id INTEGER,
  receipt_image_url TEXT,
  transaction_id TEXT,
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO payment_methods (name_ar, name_en, image_url, description_ar, description_en, instructions_ar, instructions_en, requires_receipt, requires_transaction_id, sort_order) VALUES
('حوالة بنكية', 'Bank Transfer', 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=300&h=200&fit=crop', 'تحويل مصرفي مباشر', 'Direct bank transfer', 'يرجى إرسال الحوالة إلى الحساب المصرفي المحدد وإرفاق صورة الإيصال', 'Please send the transfer to the specified bank account and attach receipt image', 1, 0, 1),
('فودافون كاش', 'Vodafone Cash', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop', 'دفع عبر فودافون كاش', 'Payment via Vodafone Cash', 'أرسل المبلغ إلى الرقم المحدد وأدخل رقم العملية', 'Send amount to specified number and enter transaction ID', 0, 1, 2),
('أورانج موني', 'Orange Money', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop', 'دفع عبر أورانج موني', 'Payment via Orange Money', 'أرسل المبلغ إلى الرقم المحدد وأدخل رقم العملية', 'Send amount to specified number and enter transaction ID', 0, 1, 3),
('بطاقة ائتمانية', 'Credit Card', 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=300&h=200&fit=crop', 'دفع بالبطاقة الائتمانية', 'Credit card payment', 'ادفع باستخدام بطاقتك الائتمانية بشكل آمن', 'Pay securely using your credit card', 0, 0, 4);
