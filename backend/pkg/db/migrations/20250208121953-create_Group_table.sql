-- +migrate Up

CREATE TABLE
  `Group` (
    `group_id` text PRIMARY KEY,
    `creator_id` text,
    `title` varchar(255),
    `description` text,
    `created_at` TIMESTAMP DEFAULT (DATETIME ('now', 'localtime')),
    FOREIGN KEY (`creator_id`) REFERENCES `User` (`user_id`) on DELETE CASCADE ON UPDATE CASCADE
  );

CREATE INDEX idx_group_creator_id ON `Group` (`creator_id`);

CREATE INDEX idx_group_title ON `Group` (`title`);

-- +migrate Down
DROP INDEX idx_group_creator_id ON `Group`;

DROP INDEX idx_group_title ON `Group`;

DROP TABLE `Group`;