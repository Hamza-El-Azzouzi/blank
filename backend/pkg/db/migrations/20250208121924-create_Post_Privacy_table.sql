
-- +migrate Up
CREATE TABLE `Post_Privacy` (
  `post_id` int,
  `user_id` int,
  FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
);

CREATE INDEX idx_post_privacy_post_user ON `Post_Privacy` (`post_id`, `user_id`);

-- +migrate Down

DROP TABLE `Post_Privacy`;