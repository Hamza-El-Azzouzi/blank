package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
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
	IsPublic    bool   `json:"isPublic,omitempty"`
}

type LoginData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserInfo struct {
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Nickname    string `json:"nickname"`
	Email       string `json:"email"`
	About       string `json:"about"`
	DateOfBirth string `json:"date_of_birth"`
	Avatar      string `json:"avatar"`
	IsPublic    string `json:"is_public"`
	Following   int    `json:"following"`
	Followers   int    `json:"followers"`
}
