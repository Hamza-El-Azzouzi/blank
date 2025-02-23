
-- +migrate Up
CREATE TABLE `Event_Response` (
  `event_id` text,
  `user_id` text,
  `response` varchar(255),
  PRIMARY KEY (`event_id`,`user_id`)
  FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`) on DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) on DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_event_response_event_id ON `Event_Response` (`event_id`);
CREATE INDEX idx_event_response_user_id ON `Event_Response` (`user_id`);
CREATE INDEX idx_event_response_response ON `Event_Response` (`response`);

-- +migrate Down

DROP TABLE `Event_Response`;