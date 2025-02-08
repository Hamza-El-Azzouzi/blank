
-- +migrate Up
CREATE TABLE `Notification` (
  `notification_id` int PRIMARY KEY,
  `user_id` int,
  `type` varchar(255),
  `related_id` int,
  `unread` boolean,
  `created_at` timestamp,
  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
);

CREATE INDEX idx_notification_user_id ON `Notification` (`user_id`);
CREATE INDEX idx_notification_type ON `Notification` (`type`);
CREATE INDEX idx_notification_created_at ON `Notification` (`created_at`);

-- +migrate Down

DROP TABLE `Notification`;