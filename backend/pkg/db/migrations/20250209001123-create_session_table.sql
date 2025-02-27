-- +migrate Up

CREATE TABLE
    `Session` (
        "session_id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        `created_at` timestamp DEFAULT (DATETIME ('now', 'localtime')),
        FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) on DELETE CASCADE ON UPDATE CASCADE
    );

CREATE INDEX idx_sessions_user_id ON `Session` (`user_id`);

-- +migrate Down
DROP TABLE `Session`;