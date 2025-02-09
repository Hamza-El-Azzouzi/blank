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
}

type LoginData struct {
	EmailOrUserName string `json:"emailOrUSername"`
	Passwd          string `json:"password"`
}
