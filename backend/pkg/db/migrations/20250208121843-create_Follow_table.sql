
-- +migrate Up
CREATE TABLE `Follow` (
  `follower_id` text,
  `followed_id` text,
  `status` varchar(255),
  PRIMARY KEY (`follower_id`, `followed_id`),
  FOREIGN KEY (`follower_id`) REFERENCES `User` (`user_id`),
  FOREIGN KEY (`followed_id`) REFERENCES `User` (`user_id`)
);

CREATE INDEX idx_follow_follower_id ON `Follow` (`follower_id`);
CREATE INDEX idx_follow_followed_id ON `Follow` (`followed_id`);
CREATE INDEX idx_follow_status ON `Follow` (`status`);

-- +migrate Down

DROP TABLE `Follow`;