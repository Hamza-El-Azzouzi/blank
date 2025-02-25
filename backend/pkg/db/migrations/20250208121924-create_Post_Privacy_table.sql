
-- +migrate Up

CREATE TABLE `Post_Privacy` (
  `post_id` text,
  `user_id` text,
  PRIMARY KEY (`post_id`,`user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) on DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) on DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_post_privacy_post_user ON `Post_Privacy` (`post_id`, `user_id`);

-- +migrate Down

DROP TABLE `Post_Privacy`;