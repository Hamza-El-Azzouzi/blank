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

type GroupChatInfo struct {
	GroupID         string    `json:"group_id"`
	GroupName       string    `json:"group_name"`
	LastMessage     string    `json:"last_message,omitempty"`
	LastMessageTime time.Time `json:"last_message_time,omitempty"`
	SenderLastName  string    `json:"sender_last_name,omitempty"`
	IsSeen          bool      `json:"is_seen"`
}

type GroupMessageHistory struct {
	MessageID       string    `json:"message_id"`
	SenderID        string    `json:"sender_id"`
	GroupID         string    `json:"group_id"`
	Content         string    `json:"content"`
	Seen            bool      `json:"seen"`
	CreatedAt       time.Time `json:"created_at"`
	SenderFirstName string    `json:"sender_first_name"`
	SenderLastName  string    `json:"sender_last_name"`
	SenderAvatar    string    `json:"sender_avatar"`
}
