
-- +migrate Up
CREATE TABLE `Comment` (
  `comment_id` int PRIMARY KEY,
  `post_id` int,
  `group_post_id` int,
  `user_id` int,
  `content` text,
  `created_at` timestamp,
  FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`),
  FOREIGN KEY (`group_post_id`) REFERENCES `Group_Post` (`group_post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
);

CREATE INDEX idx_comment_post_id ON `Comment` (`post_id`);
CREATE INDEX idx_comment_user_id ON `Comment` (`user_id`);
CREATE INDEX idx_comment_created_at ON `Comment` (`created_at`);

-- +migrate Down

DROP TABLE `Comment`;