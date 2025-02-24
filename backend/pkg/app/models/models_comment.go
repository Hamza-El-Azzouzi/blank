package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type Comment struct {
	ID             uuid.UUID
	UserID         uuid.UUID
	Commentable_id string
	Content        string
	Target         string
	CreatedAt      time.Time
}

type CommentDetails struct {
	User          UserInfo  `json:"user"`
	CommentID     uuid.UUID `json:"comment_id"`
	Content       string    `json:"content"`
	LikeCount     int       `json:"like_count"`
	HasLiked      bool      `json:"has_liked"`
	FormattedDate string    `json:"formatted_date"`
	CreatedAt     time.Time `json:"created_at"`
}

type CommentData struct {
	Commentable_id string `json:"commentable_id"`
	Content        string `json:"content"`
	Target         string `json:"target"`
}
