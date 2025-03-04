package models

import (
	"database/sql"
	"time"

	"github.com/gofrs/uuid/v5"
)

type Notification struct {
	ID            uuid.UUID      `json:"id,omitempty"`
	ReceiverID    uuid.UUID      `json:"receiver_id,omitempty"`
	UserID        uuid.NullUUID  `json:"user_id,omitempty"` // this is the user who caused the notification (like request follow)
	UserName      sql.NullString `json:"user_name,omitempty"`
	GroupID       uuid.NullUUID  `json:"group_id,omitempty"`
	GroupTitle    sql.NullString `json:"group_title,omitempty"`
	Seen          bool           `json:"seen,omitempty"`
	CreatedAt     time.Time      `json:"created_at,omitempty"`
	FormattedDate string         `json:"formatted_date,omitempty"`
	Label         string         `json:"label"`
	Type          string         `json:"type"`
	FirstName     string         `json:"first_name,omitempty"`
	LastName      string         `json:"last_name,omitempty"`
	Avatar        string         `json:"avatar,omitempty"`
	Message       Message        `json:"message,omitempty"`
}

type NotificationResponse struct {
	ID            string `json:"id,omitempty"`
	ReceiverID    string `json:"receiver_id,omitempty"`
	Type          string `json:"type"`
	UserID        string `json:"user_id,omitempty"`
	UserName      string `json:"user_name,omitempty"`
	GroupID       string `json:"group_id,omitempty"`
	GroupTitle    string `json:"group_title,omitempty"`
	Seen          bool   `json:"seen"`
	AllowAction   bool   `json:"allow_action,omitempty"`
	FormattedDate string `json:"formatted_date"`
}

type Message struct {
	ID           uuid.UUID `json:"id,omitempty"`
	SenderID     uuid.UUID `json:"sender_id,omitempty"`
	ReceiverID   uuid.UUID `json:"receiver_id,omitempty"`
	ReceiverType string    `json:"receiver_type"`
	Content      string    `json:"content,omitempty"`
	SessionID    string    `json:"session_id,omitempty"`
}
