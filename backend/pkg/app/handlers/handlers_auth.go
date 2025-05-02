package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"blank/pkg/app/middleware"
	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type AuthHandler struct {
	AuthService    *services.AuthService
	AuthMidlaware  *middleware.AuthMiddleware
	SessionService *services.SessionService
	MessageHandler *MessageHandler
}
const InvalidJson = "invalid JSON data"
func (h *AuthHandler) HandleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "method not allowed", nil)
		return
	}

	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	var user models.RegisterData
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.SendResponses(w, http.StatusBadRequest, InvalidJson, nil)
		return
	}

	if isValid, message := utils.ValidateFullName(user.FirstName); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidateFullName(user.LastName); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidateDateOfBirth(user.DateOfBirth); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidateNickname(user.Nickname); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidateAboutMe(user.AboutMe); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidateEmail(user.Email); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidatePassword(user.Password); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	status, message := h.AuthService.Register(user)
	utils.SendResponses(w, status, message, nil)
}

func (h *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "method not allowed", nil)
		return
	}

	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	var userInfo models.LoginData
	if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
		utils.SendResponses(w, http.StatusBadRequest, InvalidJson, nil)
		return
	}

	user, message := h.AuthService.Login(userInfo.Email, userInfo.Password)
	if message != "" {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	sessionId := uuid.Must(uuid.NewV4()).String()

	if err := h.SessionService.CreateSession(sessionId, user.ID); err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "internal server error", nil)
		return
	}

	utils.SetCookies(w, "sessionId", sessionId)
	utils.SendResponses(w, http.StatusOK, "success", nil)
}

func (h *AuthHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	tokenParts := strings.Split(authHeader, " ")
	sessionID := tokenParts[1]
	err := h.SessionService.DeleteSession(sessionID)
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "internal server error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "success", nil)
}

type SessionData struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

func (h *AuthHandler) UserIntegrity(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	var session SessionData
	if err := json.NewDecoder(r.Body).Decode(&session); err != nil {
		utils.SendResponses(w, http.StatusBadRequest, InvalidJson, nil)
		return
	}
	userID, exist := h.SessionService.CheckSession(session.Value)
	if !exist {
		utils.SendResponses(w, http.StatusForbidden, "User Not Found", nil)
	} else {
		utils.SendResponses(w, http.StatusOK, "success", userID)
	}
}
