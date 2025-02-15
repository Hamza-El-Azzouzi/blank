package middleware

import (
	"fmt"
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

// Protect ensures only users with valid session_id can access the route
func (h *AuthMiddleware) Protect(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		publicRoutes := map[string]bool{
			"/api/login":    true,
			"/api/register": true,
		}

		// Skip authentication for public routes
		if _, ok := publicRoutes[r.URL.Path]; ok {
			fmt.Println("midd")
			next.ServeHTTP(w, r)
			return
		}
		authHeader := r.Header.Get("Authorization")

		// Check if Authorization header exists
		if authHeader == "" {
			utils.SendResponses(w,http.StatusUnauthorized,"Unauthorized: No session token provided",nil)
			// http.Error(w, "Unauthorized: No session token provided", http.StatusUnauthorized)
			return
		}

		// Extract session token (Expected format: "Bearer <session_id>")
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			utils.SendResponses(w,http.StatusUnauthorized,"Unauthorized: Invalid token format",nil)
			// http.Error(w, "Unauthorized: Invalid token format", http.StatusUnauthorized)
			return
		}
		sessionID := tokenParts[1]
		if !h.SessionService.CheckSession(sessionID) {
			utils.SendResponses(w,http.StatusUnauthorized,"Unauthorized: Invalid session",nil)
			// http.Error(w, "Unauthorized: Invalid session", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}
