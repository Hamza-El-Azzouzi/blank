package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

type User struct {
	ID           uuid.UUID
	Age          string
	Gender       string
	FirstName    string
	LastName     string
	Username     string
	Email        string
	PasswordHash string
	CreatedAt    time.Time
}
type SignUpData struct {
	Username      string `json:"username"`
	Age           string `json:"age"`
	Gender        string `json:"gender"`
	FirstName     string `json:"first_name"`
	LastName      string `json:"last_name"`
	Email         string `json:"email"`
	Passwd        string `json:"password"`
	ConfirmPasswd string `json:"confirmPassword"`
}
type LoginData struct {
	EmailOrUserName string `json:"emailOrUSername"`
	Passwd          string `json:"password"`
}
type LoginReply struct {
	REplyMssg string
}
