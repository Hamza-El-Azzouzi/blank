-- +migrate Up
CREATE TABLE
    `Like` (
        `like_id` TEXT PRIMARY KEY,
        `user_id` TEXT NOT NULL,
        `comment_id` TEXT,
        `post_id` TEXT,
        `group_post_id` INT,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) on DELETE CASCADE ON UPDATE CASCADE,  
        FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) on DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (`comment_id`) REFERENCES `Comment` (`comment_id`) on DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (`group_post_id`) REFERENCES `Group_Post` (`group_post_id`) on DELETE CASCADE ON UPDATE CASCADE
        CHECK (
            ((`comment_id` IS NOT NULL AND `post_id` IS NULL AND `group_post_id` IS NULL) OR
            (`comment_id` IS NULL AND `post_id` IS NOT NULL AND `group_post_id` IS NULL) OR
            (`comment_id` IS NULL AND `post_id` IS NULL AND `group_post_id` IS NOT NULL))
        )
    );

-- +migrate Down
DROP TABLE `Like`;