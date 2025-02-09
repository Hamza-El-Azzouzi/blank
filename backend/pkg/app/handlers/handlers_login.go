package handlers

import (
	"encoding/json"
	"html"
	"net/http"
	"strconv"
	"strings"
	"time"

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
		utils.SendResponses(w, http.StatusBadRequest, "invalid JSON data", nil)
		return
	}

	user.FirstName = html.EscapeString(strings.TrimSpace(user.FirstName))
	user.LastName = html.EscapeString(strings.TrimSpace(user.LastName))
	user.Email = html.EscapeString(strings.TrimSpace(user.Email))
	user.Nickname = html.EscapeString(strings.TrimSpace(user.Nickname))
	user.DateOfBirth = html.EscapeString(strings.TrimSpace(user.DateOfBirth))
	user.AboutMe = html.EscapeString(strings.TrimSpace(user.AboutMe))

	if isValid, message := h.AuthMidlaware.ValidateFullName(user.FirstName); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := h.AuthMidlaware.ValidateFullName(user.LastName); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := h.AuthMidlaware.ValidateDateOfBirth(user.DateOfBirth); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := h.AuthMidlaware.ValidateNickname(user.Nickname); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := h.AuthMidlaware.ValidateAboutMe(user.AboutMe); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := h.AuthMidlaware.ValidateEmail(user.Email); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := h.AuthMidlaware.ValidatePassword(user.Password); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	status, message := h.AuthService.Register(user)
	utils.SendResponses(w, status, message, nil)
}

func (h *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var info models.LoginData
		err := json.NewDecoder(r.Body).Decode(&info)
		defer r.Body.Close()
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		user, err := h.AuthService.Login(info.EmailOrUserName, info.Passwd)
		if err != nil || user == nil {
			switch true {
			case err.Error() == "in email or username":
				// sendResponse(w, "Account Not found")
				return
			case strings.Contains(err.Error(), "password"):
				// sendResponse(w, "passwd")
				return
			}
		}
		sessionExpires := time.Now().Add(5 * 60 * time.Minute)
		sessionId := uuid.Must(uuid.NewV4()).String()
		userSession := h.SessionService.CreateSession(sessionId, sessionExpires, user.ID)
		if userSession != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		SetCookies(w, "sessionId", sessionId, sessionExpires)
		// sendResponse(w, "Done")
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func SetCookies(w http.ResponseWriter, name, value string, expires time.Time) {
	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		Expires:  expires,
		HttpOnly: false,
	}

	http.SetCookie(w, cookie)
}

func (h *AuthHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	activeUser, user := h.AuthMidlaware.IsUserLoggedIn(w, r)
	if !activeUser {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	sessionId, err := r.Cookie("sessionId")
	if err == nil || sessionId.Value != "" {
		err := h.SessionService.DeleteSession(sessionId.Value)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}
	h.MessageHandler.DisconnectClient(user.ID.String())
	SetCookies(w, "sessionId", "", time.Now().Add(-1*time.Hour))
	// sendResponse(w, "Done")
}

func (h *AuthHandler) UserIntegrity(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	sessionId, err := r.Cookie("sessionId")
	if err != nil && sessionId.Value == "" {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	exist := h.SessionService.CheckSession(sessionId.Value)
	if !exist {
		// sendResponse(w, "No User Found")
	} else {
		// sendResponse(w, "Done")
	}
}

func (h *AuthHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	pagination := pathParts[3]
	if pagination == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	nPagination, err := strconv.Atoi(pagination)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	sessionId, err := r.Cookie("sessionId")
	if err != nil {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	if sessionId.Value == "" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	existSessions := h.SessionService.CheckSession(sessionId.Value)
	if !existSessions {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	allUser, errUser := h.AuthService.GetUsers(sessionId.Value, nPagination)
	if errUser != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(&allUser)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (h *AuthHandler) SearchUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	var data map[string]string

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer r.Body.Close()
	sessionId, err := r.Cookie("sessionId")
	if err != nil {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	if sessionId.Value == "" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	existSessions := h.SessionService.CheckSession(sessionId.Value)
	if !existSessions {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	users, errUsers := h.AuthService.GetUserByUserName(data["search"], sessionId.Value)
	if errUsers != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(&users)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}
