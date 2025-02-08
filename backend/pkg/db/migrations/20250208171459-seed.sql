
-- +migrate Up
-- Insert sample users
INSERT INTO `User` (user_id, email, password, first_name, last_name, date_of_birth, nickname, is_public) 
VALUES 
(1, 'john@example.com', 'hashed_password', 'John', 'Doe', '1990-01-01', 'johndoe', true),
(2, 'jane@example.com', 'hashed_password', 'Jane', 'Smith', '1992-02-02', 'janesmith', true);

-- Insert sample groups
INSERT INTO `Group` (group_id, creator_id, title, description)
VALUES
(1, 1, 'Tech Enthusiasts', 'A group for technology lovers'),
(2, 2, 'Book Club', 'Discussion about books');

-- Insert sample posts
INSERT INTO `Post` (post_id, user_id, content, privacy_level, created_at)
VALUES
(1, 1, 'Hello World!', 'public', CURRENT_TIMESTAMP),
(2, 2, 'My first post!', 'public', CURRENT_TIMESTAMP);

-- +migrate Down

DELETE FROM `Post` WHERE post_id IN (1, 2);
DELETE FROM `Group` WHERE group_id IN (1, 2);
DELETE FROM `User` WHERE user_id IN (1, 2);

