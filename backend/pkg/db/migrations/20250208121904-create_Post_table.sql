
-- +migrate Up
CREATE TABLE `Post` (
  `post_id` int PRIMARY KEY,
  `user_id` int,
  `content` text,
  `image` varchar(255),
  `privacy_level` varchar(255),
  `created_at` timestamp,
  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
);

CREATE INDEX idx_post_user_id ON `Post` (`user_id`);
CREATE INDEX idx_post_created_at ON `Post` (`created_at`);
CREATE INDEX idx_post_privacy_level ON `Post` (`privacy_level`);

-- +migrate Down

DROP TABLE `Post`;