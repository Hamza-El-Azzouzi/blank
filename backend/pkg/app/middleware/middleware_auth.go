package middleware

import (
	"html"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
)

type AuthMiddleware struct {
	AuthService    *services.AuthService
	SessionService *services.SessionService
}

const (
	ExpFullName = `^[a-z]{3,20}$`
	ExpEmail    = `(?i)^[a-z0-9]+\.?[a-z0-9]+@[a-z0-9]+\.[a-z]{2,}$`
	ExpNickname = `^[a-zA-Z0-9_.-]{3,20}$`
)

func (h *AuthMiddleware) IsUserLoggedIn(w http.ResponseWriter, r *http.Request) (bool, *models.User) {
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		return false, nil
	}

	sessionId := cookie.Value
	userBySession, err := h.SessionService.GetUserService(sessionId)
	if err != nil {
		return false, nil
	}

	userById, err := h.AuthService.UserRepo.FindUser(userBySession, "byId")
	if err != nil || userById == nil {
		return false, nil
	}

	return true, userById
}

func (h *AuthMiddleware) ValidateFullName(name string) (bool, string) {
	if isValid, _ := regexp.MatchString(ExpFullName, name); !isValid {
		return false, "name can only contain characters, and connot axceed 20 characters"
	}

	return true, ""
}

func (h *AuthMiddleware) ValidateDateOfBirth(dateOfBirth string) (bool, string) {
	if _, err := time.Parse("2006-01-02", dateOfBirth); err != nil {
		return false, "invalid date format"
	}

	year, err := strconv.Atoi(strings.Split(dateOfBirth, "-")[0])
	if err != nil {
		return false, "invalid date format"
	}

	if year > 2009 {
		return false, "Our policy requires age to be bigger than 15"
	}

	return true, ""
}

func (h *AuthMiddleware) ValidateNickname(nickname string) (bool, string) {
	if nickname == "" {
		return true, ""
	}

	if isValid, _ := regexp.MatchString(ExpNickname, nickname); !isValid {
		return false, "name can only contain characters, and connot axceed 20 characters"
	}

	return true, ""
}

func (h *AuthMiddleware) ValidateAboutMe(aboutMe string) (bool, string) {
	aboutMe = html.EscapeString(strings.TrimSpace(aboutMe))
	if aboutMe == "" {
		return true, ""
	}

	if len(aboutMe) > 150 {
		return false, "about me section cannot axceed 150 character"
	}

	return true, ""
}

func (h *AuthMiddleware) ValidateEmail(email string) (bool, string) {
	email = html.EscapeString(strings.TrimSpace(email))

	if len(email) < 5 && len(email) > 50 {
		return false, "Email must be between 5 and 50 characters long"
	}

	if isValid, _ := regexp.MatchString(ExpEmail, email); !isValid {
		return false, "Invalid email format"
	}

	return true, ""
}

func (h *AuthMiddleware) ValidatePassword(password string) (bool, string) {
	if len(password) < 6 && len(password) > 50 {
		return false, "Password must be between 6 and 50 characters long"
	}
	if isValid, _ := regexp.MatchString("[A-Z]", password); !isValid {
		return false, "Password must contain at least one uppercase letter"
	}
	if isValid, _ := regexp.MatchString("[a-z]", password); !isValid {
		return false, "Password must contain at least one lowercase letter"
	}
	if isValid, _ := regexp.MatchString("[0-9]", password); !isValid {
		return false, "Password must contain at least one number"
	}
	return true, ""
}
