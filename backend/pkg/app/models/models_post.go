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
	PostID        uuid.UUID `json:"post_id"`
	Content       string    `json:"content"`
	Image         string    `json:"image"`
	CreatedAt     time.Time `json:"created_at"`
	UserID        uuid.UUID `json:"user_id"`
	FirstName     string    `json:"first_name"`
	LastName      string    `json:"last_name"`
	CommentCount  string    `json:"comment_count"`
	LikeCount     int       `json:"like_count"`
	TotalCount    int       `json:"total_count"`
	FormattedDate string    `json:"formatted_date"`
	Author        string    `json:"author"`
	HasLiked      bool      `json:"has_liked"`
	Avatar        string    `json:"avatar"`
}

type PostByUser struct {
	ID            string    `json:"post_id"`
	Content       string    `json:"content"`
	Image         string    `json:"image,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	FormattedDate string    `json:"formatted_date"`
	LikeCount     int       `json:"like_count"`
	CommentCount  int       `json:"comment_count"`
	Privacy       string    `json:"privacy"`
	HasLiked      bool      `json:"has_liked"`
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
