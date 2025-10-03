
-- Add permissions system for admins
CREATE TABLE admin_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  permission_key TEXT NOT NULL,
  permission_value BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permission_key)
);

-- Create index for better performance
CREATE INDEX idx_admin_permissions_user_id ON admin_permissions(user_id);
