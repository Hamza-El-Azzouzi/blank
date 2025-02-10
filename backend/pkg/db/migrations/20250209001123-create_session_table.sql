
-- +migrate Up
-- 000001_create_sessions_table.up.sql
CREATE TABLE `sessions` (
    "session_id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
);

CREATE INDEX idx_sessions_user_id ON `sessions` (`user_id`);

-- +migrate Down
DROP TABLE `sessions`;
