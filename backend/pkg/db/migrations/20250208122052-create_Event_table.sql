
-- +migrate Up
CREATE TABLE `Event` (
  `event_id` int PRIMARY KEY,
  `group_id` int,
  `creator_id` int,
  `title` varchar(255),
  `description` text,
  `event_datetime` timestamp,
  FOREIGN KEY (`group_id`) REFERENCES `Group` (`group_id`),
  FOREIGN KEY (`creator_id`) REFERENCES `User` (`user_id`)
);
CREATE INDEX idx_event_group_id ON `Event` (`group_id`);
CREATE INDEX idx_event_creator_id ON `Event` (`creator_id`);
CREATE INDEX idx_event_datetime ON `Event` (`event_datetime`);

-- +migrate Down

DROP TABLE `Event`;