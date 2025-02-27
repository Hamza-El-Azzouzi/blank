-- +migrate Up
CREATE TABLE
  `Comment` (
    `comment_id` text PRIMARY KEY,
    `user_id` text,
    `post_id` text,
    `group_post_id` text,
    `content` text,
    `image` text,
    `created_at` timestamp DEFAULT (DATETIME ('now', 'localtime')),
    CHECK (((`post_id` IS NULL AND `group_post_id` IS NOT NULL) OR
           (`post_id` IS NOT NULL AND `group_post_id` IS NULL))),
    FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) on DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`group_post_id`) REFERENCES `Group_Post` (`group_post_id`) on DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) on DELETE CASCADE ON UPDATE CASCADE
  );

CREATE INDEX idx_comment_post_id ON `Comment` (`post_id`);

CREATE INDEX idx_comment_user_id ON `Comment` (`user_id`);

CREATE INDEX idx_comment_created_at ON `Comment` (`created_at`);

-- +migrate Down
DROP TABLE `Comment`;