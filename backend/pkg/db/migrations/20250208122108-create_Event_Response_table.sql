
-- +migrate Up
CREATE TABLE `Event_Response` (
  `event_id` int,
  `user_id` int,
  `response` varchar(255),
  FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`),
  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
);
CREATE INDEX idx_event_response_event_id ON `Event_Response` (`event_id`);
CREATE INDEX idx_event_response_user_id ON `Event_Response` (`user_id`);
CREATE INDEX idx_event_response_response ON `Event_Response` (`response`);

-- +migrate Down

DROP TABLE `Event_Response`;