package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type Comment struct {
	ID        uuid.UUID 
	UserID    uuid.UUID
	PostID    string
	Content   string
	CreatedAt time.Time
}
