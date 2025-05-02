-- +migrate Up
CREATE TABLE
  Notification (
    notification_id text PRIMARY KEY,
    receiver_id text NOT NULL,
    type varchar(255),
    group_id text,
    user_id text,
    seen boolean DEFAULT 0,
    created_at timestamp DEFAULT (DATETIME('now', 'localtime')),
    CHECK (seen IN (0, 1)),
    CHECK (type IN ('follow_request', 'follow', 'group_invitation', 'join_request', 'event')),
    CHECK (((group_id IS NULL AND user_id IS NOT NULL) OR
           (group_id IS NOT NULL AND user_id IS NOT NULL) OR
           (group_id IS NOT NULL AND user_id IS NULL))),
    FOREIGN KEY (receiver_id) REFERENCES User (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (group_id) REFERENCES Group (group_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User (user_id) ON DELETE CASCADE ON UPDATE CASCADE
  );

CREATE INDEX idx_notification_user_id ON Notification (user_id);

CREATE INDEX idx_notification_type ON Notification (type);

CREATE INDEX idx_notification_created_at ON Notification (created_at);

-- +migrate Down
DROP TABLE Notification;