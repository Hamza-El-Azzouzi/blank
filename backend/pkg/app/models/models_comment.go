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

type CommentDetails struct {
	User          UserInfo  `json:"user"`
	CommentID     uuid.UUID `json:"comment_id"`
	Content       string    `json:"content"`
	LikeCount     int       `json:"like_count"`
	FormattedDate string    `json:"formatted_date"`
	CreatedAt     time.Time `json:"created_at"`
}

type CommentData struct {
	PostID  string `json:"post_id"`
	Content string `json:"content"`
}
