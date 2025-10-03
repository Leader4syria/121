
-- Recreate the admin_users table with exact same structure as before
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
