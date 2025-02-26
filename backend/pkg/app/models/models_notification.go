package models

type Notification struct {
	Type    string  `json:"type"`
	Label   string  `json:"label"`
	Message Message `json:"message,omitempty"`
}

type Message struct {
	SenderID   string `json:"sender_id,omitempty"`
	ReceiverID string `json:"receiver_id,omitempty"`
	Content    string `json:"content,omitempty"`
	Type       string `json:"type"`
}
