
-- Remove index and column
DROP INDEX idx_users_mocha_user_id;
ALTER TABLE users DROP COLUMN mocha_user_id;
