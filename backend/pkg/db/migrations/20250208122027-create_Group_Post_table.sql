
-- +migrate Up

CREATE TABLE Group_Post (
  group_post_id text PRIMARY KEY,
  group_id text,
  user_id text,
  content text,
  image varchar(255),
  created_at timestamp DEFAULT (DATETIME ('now', 'localtime')),
  FOREIGN KEY (group_id) REFERENCES Group (group_id) on DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES User (user_id) on DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_group_post_group_id ON Group_Post (group_id);
CREATE INDEX idx_group_post_user_id ON Group_Post (user_id);
CREATE INDEX idx_group_post_created_at ON Group_Post (created_at);

-- +migrate Down

DROP TABLE Group_Post;