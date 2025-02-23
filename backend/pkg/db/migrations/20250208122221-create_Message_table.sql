
-- +migrate Up
CREATE TABLE `Message` (
  `message_id` text PRIMARY KEY,
  `sender_id` text,
  `receiver_id` text,
  `group_id` text,
  `content` text,
  `unread` boolean,
  `created_at` timestamp DEFAULT (DATETIME ('now', 'localtime')),
  FOREIGN KEY (`sender_id`) REFERENCES `User` (`user_id`) on DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `User` (`user_id`) on DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`group_id`) REFERENCES `Group` (`group_id`) on DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_message_sender_id ON `Message` (`sender_id`);
CREATE INDEX idx_message_receiver_id ON `Message` (`receiver_id`);
CREATE INDEX idx_message_group_id ON `Message` (`group_id`);
CREATE INDEX idx_message_created_at ON `Message` (`created_at`);

-- +migrate Down

DROP TABLE `Message`;