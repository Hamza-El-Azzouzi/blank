
-- +migrate Up
-- Insert sample users
--- exemple uuid.NewV4  fdc16121-2efa-49d7-b7e4-b29b7fd7dc17
--- online generator https://www.uuidgenerator.net/version4
INSERT INTO `User` (user_id, email, password, first_name, last_name, date_of_birth, nickname, is_public) 
VALUES 
('fdc16121-2efa-49d7-b7e4-b29b7fd7dc17', 'john@example.com', 'hashed_password', 'John', 'Doe', '1990-01-01', 'johndoe', true),
('7af873b5-1173-4867-99ce-757046835a38', 'jane@example.com', 'hashed_password', 'Jane', 'Smith', '1992-02-02', 'janesmith', true);

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

