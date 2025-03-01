package models

import "github.com/gofrs/uuid/v5"

type Notification struct {
	Type    string  `json:"type"`
	Label   string  `json:"label"`
	Message Message `json:"message,omitempty"`
}

type Message struct {
	ID           uuid.UUID `json:"id,omitempty"`
	SenderID     uuid.UUID `json:"sender_id,omitempty"`
	ReceiverID   uuid.UUID `json:"receiver_id,omitempty"`
	ReceiverType string    `json:"receiver_type"`
	Content      string    `json:"content,omitempty"`
	SessionID    string    `json:"session_id,omitempty"`
}
