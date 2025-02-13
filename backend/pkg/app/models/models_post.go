package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type Post struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	Content   string
	Image     string
	Privacy   string
	CreatedAt time.Time
}

type PostWithUser struct {
	PostID        uuid.UUID
	Content       string
	Image         string
	CreatedAt     time.Time
	UserID        uuid.UUID
	Username      string
	FormattedDate string
	CommentCount  string
	LikeCount     int
	TotalCount    int
}

type CommentDetails struct {
	CommentID     uuid.UUID
	Content       string
	CreatedAt     time.Time
	UserID        uuid.UUID
	Username      string
	FormattedDate string
	LikeCount     int
	DisLikeCount  int
	TotalCount    int
}

type CommentData struct {
	Comment string `json:"content"`
	PostId  string `json:"postId"`
}

type PostData struct {
	Content string `json:"content"`
	Privacy string `json:"privacy"`
	Avatar  string `json:"avatar,omitempty"`
	Friendlist []string `json:"friendlist,omitempty"`
}
