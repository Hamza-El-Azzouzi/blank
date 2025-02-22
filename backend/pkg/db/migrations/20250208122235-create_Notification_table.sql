
-- +migrate Up
CREATE TABLE `Notification` (
  `notification_id` text PRIMARY KEY,
  `user_id` text,
  `type` varchar(255),
  `related_id` text,
  `unread` boolean,
  `created_at` timestamp DEFAULT (DATETIME ('now', 'localtime')),
  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) on DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_notification_user_id ON `Notification` (`user_id`);
CREATE INDEX idx_notification_type ON `Notification` (`type`);
CREATE INDEX idx_notification_created_at ON `Notification` (`created_at`);

-- +migrate Down

DROP TABLE `Notification`;