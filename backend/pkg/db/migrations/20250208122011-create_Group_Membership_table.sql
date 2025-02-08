
-- +migrate Up
CREATE TABLE `Group_Membership` (
  `group_id` int,
  `user_id` int,
  `status` varchar(255),
  FOREIGN KEY (`group_id`) REFERENCES `Group` (`group_id`),
  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
);
CREATE INDEX idx_group_membership_group_id ON `Group_Membership` (`group_id`);
CREATE INDEX idx_group_membership_user_id ON `Group_Membership` (`user_id`);
CREATE INDEX idx_group_membership_status ON `Group_Membership` (`status`);

-- +migrate Down

DROP TABLE `Group_Membership`;