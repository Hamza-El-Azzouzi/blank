-- +migrate Up
CREATE TABLE `Group` (
  `group_id` int PRIMARY KEY,
  `creator_id` int,
  `title` varchar(255),
  `description` text,
  FOREIGN KEY (`creator_id`) REFERENCES `User` (`user_id`)
);

CREATE INDEX idx_group_creator_id ON `Group` (`creator_id`);
CREATE INDEX idx_group_title ON `Group` (`title`);

-- +migrate Down

DROP INDEX idx_group_creator_id ON `Group`;
DROP INDEX idx_group_title ON `Group`;
DROP TABLE `Group`;