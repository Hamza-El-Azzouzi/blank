package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type Post struct {
	ID        uuid.UUID
	UserID    any
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
	FirstName     string
	LastName      string
	FormattedDate string
	CommentCount  string
	LikeCount     int
	TotalCount    int
	Author        string
}

type PostByUser struct {
	ID            string    `json:"id"`
	Content       string    `json:"content"`
	Image         string    `json:"image,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	FormattedDate string    `json:"timestamp"`
	LikeCount     int       `json:"likes"`
	CommentCount  int       `json:"comments"`
	Privacy       string    `json:"privacy"`
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
	Content           string   `json:"content"`
	Privacy           string   `json:"privacy"`
	Image             string   `json:"image,omitempty"`
	SelectedFollowers []string `json:"selectedFollowers,omitempty"`
}
