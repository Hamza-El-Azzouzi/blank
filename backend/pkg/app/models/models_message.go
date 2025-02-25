package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
	"github.com/gorilla/websocket"
)

type Chat struct {
	Message string `json:"msg"`
	Sender  string `json:"session"`
	Reciver string `json:"id"`
}

type Message struct {
	SenderID   string `json:"sender_id,omitempty"`
	ReceiverID string `json:"receiver_id,omitempty"`
	Content    string `json:"content,omitempty"`
	Type       string `json:"type"`
}

type HistoryChat struct {
	SnederID   string `json:"senderID"`
	ReceiverID string `json:"receiverID"`
	Offset     int    `json:"offset"`
}
type Client struct {
	Conn     *websocket.Conn
	LastPing time.Time
}

type MessageWithTime struct {
	MessageID        uuid.UUID
	SenderID         uuid.UUID
	UserNameSender   string
	ReceiverID       uuid.UUID
	UserNameReceiver string
	Content          string
	Unreaded         bool
	CreatedAt        time.Time
	FormattedDate    string
}

type MarkAsRead struct {
	SenderID   string `json:"senderID"`
	ReceiverID string `json:"receiverID"`
}

type Session struct {
	SessionID string `json:"session"`
}
