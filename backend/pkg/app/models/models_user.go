package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
	"github.com/gorilla/websocket"
)

type User struct {
	ID          uuid.UUID
	FirstName   string
	LastName    string
	Email       string
	Password    string
	DateOfBirth time.Time
	Nickname    string
	AboutMe     string
	Avatar      string
	IsPublic    bool
	CreatedAt   time.Time
}

type RegisterData struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DateOfBirth string `json:"dateOfBirth"`
	Avatar      string `json:"avatar,omitempty"`
	Nickname    string `json:"nickname,omitempty"`
	AboutMe     string `json:"aboutMe,omitempty"`
	AccountType string `json:"accountType"`
}

type LoginData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserInfo struct {
	UserID         uuid.UUID `json:"user_id"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Nickname       string    `json:"nickname,omitempty"`
	Email          string    `json:"email,omitempty"`
	About          string    `json:"about,omitempty"`
	DateOfBirth    string    `json:"date_of_birth,omitempty"`
	Avatar         string    `json:"avatar,omitempty"`
	IsPublic       bool      `json:"is_public,omitempty"`
	IsOwner        bool      `json:"is_owner,omitempty"`
	Following      int       `json:"following,omitempty"`
	Followers      int       `json:"followers,omitempty"`
	FollowStatus   string    `json:"follow_status,omitempty"`
	IsFollowing    bool      `json:"is_following,omitempty"`
	CanSendMessage bool      `json:"can_send_message,omitempty"`
	Has_requested  bool      `json:"has_requested"`
}

type ConnectedUser struct {
	Connections []*websocket.Conn
	User        *UserInfo
}
