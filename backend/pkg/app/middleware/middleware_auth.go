package middleware

import (
	"context"
	"net/http"
	"strings"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"
)

type AuthMiddleware struct {
	AuthService    *services.AuthService
	SessionService *services.SessionService
}

const (
	ExpFullName = `^[a-zA-Z ]{3,20}$`
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

func (h *AuthMiddleware) Protect(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		publicRoutes := map[string]bool{
			"/api/login":     true,
			"/api/register":  true,
			"/api/integrity": true,
		}

		if _, ok := publicRoutes[r.URL.Path]; ok {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.SendResponses(w, http.StatusUnauthorized, "Unauthorized: No session token provided", nil)
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			utils.SendResponses(w, http.StatusUnauthorized, "Unauthorized: Invalid token format", nil)
			return
		}
		sessionID := tokenParts[1]
		user_id, ok := h.SessionService.CheckSession(sessionID)
		if !ok {
			utils.SendResponses(w, http.StatusUnauthorized, "Unauthorized: Invalid session", nil)
			return
		}
		r = r.WithContext(context.WithValue(r.Context(), "user_id", user_id))
		next.ServeHTTP(w, r)
	})
}
