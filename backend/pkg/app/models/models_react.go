package models

import (
	"database/sql"
	"time"

	"github.com/gofrs/uuid/v5"
)

type Reacts struct {
	ID            string
	UserID        uuid.UUID
	Post_id       sql.NullString
	Comment_id    sql.NullString
	Group_Post_id sql.NullString
	CreatedAt     time.Time
}

type React struct {
	ID     string `json:"targetId"`
	Target string `json:"targetType"`
}
