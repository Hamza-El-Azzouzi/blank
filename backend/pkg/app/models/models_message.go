package models

import (
	"time"
)

type ContactUser struct {
	UserID          string    `json:"user_id"`
	FirstName       string    `json:"first_name"`
	LastName        string    `json:"last_name"`
	Avatar          string    `json:"avatar"`
	LastMessage     string    `json:"last_message"`
	LastMessageTime time.Time `json:"last_message_time"`
	IsSeen          bool      `json:"is_seen"`
}

type MessageHistory struct {
	MessageID  string    `json:"message_id"`
	SenderID   string    `json:"sender_id"`
	ReceiverID string    `json:"receiver_id"`
	Content    string    `json:"content"`
	Seen       bool      `json:"seen"`
	CreatedAt  time.Time `json:"created_at"`
}
