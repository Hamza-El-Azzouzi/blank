
-- +migrate Up
CREATE TABLE `Follow` (
  `follower_id` text,
  `following_id` text,
  `status` varchar(255),
  PRIMARY KEY (`follower_id`, `following_id`),
  FOREIGN KEY (`follower_id`) REFERENCES `User` (`user_id`),
  FOREIGN KEY (`following_id`) REFERENCES `User` (`user_id`)
);

CREATE INDEX idx_follow_follower_id ON `Follow` (`follower_id`);
CREATE INDEX idx_follow_following_id ON `Follow` (`following_id`);
CREATE INDEX idx_follow_status ON `Follow` (`status`);

-- +migrate Down

DROP TABLE `Follow`;