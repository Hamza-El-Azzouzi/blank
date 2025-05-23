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
	Nickname       string    `json:"nickname"`
	Email          string    `json:"email"`
	About          string    `json:"about"`
	DateOfBirth    string    `json:"date_of_birth"`
	Avatar         string    `json:"avatar"`
	IsPublic       bool      `json:"is_public"`
	IsOwner        bool      `json:"is_owner"`
	Following      int       `json:"following"`
	Followers      int       `json:"followers"`
	FollowStatus   string    `json:"follow_status"`
	IsFollowing    bool      `json:"is_following"`
	CanSendMessage bool      `json:"can_send_message"`
	Has_requested  bool      `json:"has_requested"`
}

type ConnectedUser struct {
	Connections []*websocket.Conn
	User        *UserInfo
}
