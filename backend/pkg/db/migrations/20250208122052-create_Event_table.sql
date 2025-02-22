
-- +migrate Up
CREATE TABLE `Event` (
  `event_id` text PRIMARY KEY,
  `group_id` text,
  `creator_id` text,
  `title` varchar(255),
  `description` text,
  `event_datetime` timestamp,
  `created_at` timestamp DEFAULT (DATETIME ('now', 'localtime')),
  FOREIGN KEY (`group_id`) REFERENCES `Group` (`group_id`) on DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`creator_id`) REFERENCES `User` (`user_id`) on DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_event_group_id ON `Event` (`group_id`);
CREATE INDEX idx_event_creator_id ON `Event` (`creator_id`);
CREATE INDEX idx_event_datetime ON `Event` (`event_datetime`);

-- +migrate Down

DROP TABLE `Event`;