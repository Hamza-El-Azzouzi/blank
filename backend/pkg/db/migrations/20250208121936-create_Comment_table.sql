
-- +migrate Up

CREATE TABLE `Comment` (
  `comment_id` TEXT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `commentable_id` INT NOT NULL,
  `commentable_type` TEXT CHECK(`commentable_type` IN ('Post', 'Group_Post')) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES User(`user_id`)
);

CREATE INDEX idx_comment_post_id ON `Comment` (`commentable_id`);
CREATE INDEX idx_comment_user_id ON `Comment` (`user_id`);
CREATE INDEX idx_comment_created_at ON `Comment` (`created_at`);

-- +migrate Down

DROP TABLE `Comment`;