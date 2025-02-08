package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type Post struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	Title     string
	Content   string
	CreatedAt time.Time
}

type PostCategory struct {
	PostID     uuid.UUID
	CategoryID string
}

type PostWithUser struct {
	PostID        uuid.UUID
	Title         string
	Content       string
	CreatedAt     time.Time
	UserID        uuid.UUID
	Username      string
	FormattedDate string
	CategoryName  string
	CommentCount  string
	LikeCount     int
	DisLikeCount  int
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
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	Categories []string `json:"categories"`
}
