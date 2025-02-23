-- +migrate Up

CREATE TABLE
    `Like` (
        `like_id` TEXT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `likeable_id` INT NOT NULL,
        `likeable_type` TEXT CHECK (
        `likeable_type` IN ('Post', 'Comment', 'Group_Post')
        ) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES User (`user_id`)
    );

-- +migrate Down
DROP TABLE `Like`;