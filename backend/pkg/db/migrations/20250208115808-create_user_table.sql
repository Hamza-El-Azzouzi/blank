
-- +migrate Up
CREATE TABLE `User` (
  `user_id` text PRIMARY KEY,
  `email` varchar(255) UNIQUE,
  `password` varchar(255),
  `first_name` varchar(255),
  `last_name` varchar(255),
  `date_of_birth` date NOT NULL, -- Format: YYYY-MM-DD
  `avatar` varchar(255),
  `nickname` varchar(255),
  `about_me` text,
  `is_public` boolean
);

CREATE INDEX idx_user_email ON `User` (`email`);
CREATE INDEX idx_user_nickname ON `User` (`nickname`);
CREATE INDEX idx_user_is_public ON `User` (`is_public`);

-- +migrate Down

DROP TABLE `User`;