package middleware

import (
	"net/http"
	"regexp"
	"strconv"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
)

type AuthMiddleware struct {
	AuthService    *services.AuthService
	SessionService *services.SessionService
}

const (
	ExpEmail = `^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	ExpName  = `^[a-zA-Z0-9_.]{3,20}$`
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

func (h *AuthMiddleware) IsValidEmail(email string) bool {
	isValid, _ := regexp.MatchString(ExpEmail, email)
	return isValid
}

func (h *AuthMiddleware) IsValidGender(gender string) bool {
	return gender == "Male" || gender == "Female"
}

func (h *AuthMiddleware) IsValidAge(age string) bool {
	nAge, err := strconv.Atoi(age)
	if err != nil || nAge < 16 || nAge > 120 {
		return false
	}
	return true
}

func (h *AuthMiddleware) IsValidName(username string) bool {
	isValid, _ := regexp.MatchString(ExpName, username)
	return isValid
}

func (h *AuthMiddleware) IsmatchPassword(password string, confirmPassword string) bool {
	match := password == confirmPassword
	return match
}

func (h *AuthMiddleware) IsValidPassword(password string) bool {
	ExpPasswd := []string{".{8,20}", "[a-z]", "[A-Z]", "[0-9]", "[^\\d\\w]"}
	for _, test := range ExpPasswd {
		isValid, _ := regexp.MatchString(test, password)
		if !isValid {
			return false
		}
	}
	return true
}
