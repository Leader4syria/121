
-- Add missing columns to users table if they don't exist
ALTER TABLE users ADD COLUMN mocha_user_id TEXT;

-- Create unique index on mocha_user_id
CREATE UNIQUE INDEX idx_users_mocha_user_id ON users(mocha_user_id);
