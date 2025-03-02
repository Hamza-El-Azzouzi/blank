package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type Notification struct {
	ID            uuid.UUID `json:"id,omitempty"`
	ReceiverID    uuid.UUID `json:"receiver_id,omitempty"`
	Type          string    `json:"type"`
	UserID        uuid.UUID `json:"user_id,omitempty"` // this is the user who caused the notification (like request follow)
	UserName      string    `json:"user_name,omitempty"`
	GroupID       uuid.UUID `json:"group_id,omitempty"`
	GroupTitle    string    `json:"group_title,omitempty"`
	Avatar        string    `json:"avatar,omitempty"`
	Label         string    `json:"label"`
	Message       Message   `json:"message,omitempty"`
	Seen          bool      `json:"seen,omitempty"`
	CreatedAt     time.Time `json:"created_at,omitempty"`
	FormattedDate string    `json:"formatted_date,omitempty"`
}

type Message struct {
	ID           uuid.UUID `json:"id,omitempty"`
	SenderID     uuid.UUID `json:"sender_id,omitempty"`
	ReceiverID   uuid.UUID `json:"receiver_id,omitempty"`
	ReceiverType string    `json:"receiver_type"`
	Content      string    `json:"content,omitempty"`
	SessionID    string    `json:"session_id,omitempty"`
}
