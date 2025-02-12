package middleware

import (
	"net/http"

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
