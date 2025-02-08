package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type Reacts struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	PostID    *string
	CommentID *string
	ReactType string
	CreatedAt time.Time
}

type React struct {
	ID        string `json:"targetId"`
	Type      string `json:"type"`
	Target    string `json:"targetType"`
}
