-- +migrate Up
CREATE TABLE `Like` (
        `like_id` text PRIMARY KEY NOT NULL,
        `user_id` text NOT NULL,
        `post_id` TEXT,
        `comment_id` TEXT,
        `created_at` timestamp,
        FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (`comment_id`) REFERENCES `Comment` (`comment_id`) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT unique_user_post_comment UNIQUE (`user_id`, `post_id`, `comment_id`),
        CHECK (
            (
                `post_id` IS NOT NULL
                AND `comment_id` IS NULL
            )
            OR (
                `post_id` IS NULL
                AND `comment_id` IS NOT NULL
            )
        )
    );

CREATE INDEX idx_like_post_id ON `Like` (`post_id`);

CREATE INDEX idx_like_comment_id ON `Like` (`comment_id`);

-- +migrate Down
DROP TABLE `Like`;