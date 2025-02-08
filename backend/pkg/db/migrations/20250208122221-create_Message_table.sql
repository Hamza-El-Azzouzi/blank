
-- +migrate Up
CREATE TABLE `Message` (
  `message_id` int PRIMARY KEY,
  `sender_id` int,
  `receiver_id` int,
  `group_id` int,
  `content` text,
  `unread` boolean,
  `created_at` timestamp,
  FOREIGN KEY (`sender_id`) REFERENCES `User` (`user_id`),
  FOREIGN KEY (`receiver_id`) REFERENCES `User` (`user_id`),
  FOREIGN KEY (`group_id`) REFERENCES `Group` (`group_id`)
);
CREATE INDEX idx_message_sender_id ON `Message` (`sender_id`);
CREATE INDEX idx_message_receiver_id ON `Message` (`receiver_id`);
CREATE INDEX idx_message_group_id ON `Message` (`group_id`);
CREATE INDEX idx_message_created_at ON `Message` (`created_at`);

-- +migrate Down

DROP TABLE `Message`;