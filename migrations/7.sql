
ALTER TABLE payment_methods ADD COLUMN min_amount REAL DEFAULT 10.0;
ALTER TABLE payment_methods ADD COLUMN max_amount REAL DEFAULT 1000.0;
