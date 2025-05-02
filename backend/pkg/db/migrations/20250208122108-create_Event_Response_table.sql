-- +migrate Up

CREATE TABLE
  Event_Response (
    response_id text PRIMARY KEY,
    event_id text NOT NULL,
    user_id text NOT NULL,
    response varchar(255),
    UNIQUE (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES Event (event_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User (user_id) ON DELETE CASCADE ON UPDATE CASCADE
  );

CREATE INDEX idx_event_response_event ON Event_Response (event_id);

CREATE INDEX idx_event_response_user ON Event_Response (user_id);

CREATE INDEX idx_event_response_response ON Event_Response (response);

-- +migrate Down
DROP TABLE Event_Response;