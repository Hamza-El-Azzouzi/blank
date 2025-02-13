package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"blank/pkg/app/middleware"
	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type UserHandler struct {
	AuthService   *services.AuthService
	AuthMidlaware *middleware.AuthMiddleware
	PostService   *services.PostService
	UserService   *services.UserService
	AuthHandler   *AuthHandler
}

func (p *UserHandler) InfoGetter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	var err error
	userID, err := uuid.FromString(r.PathValue("id"))
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	
	user, err := p.UserService.GetUserInfo(userID)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (p *UserHandler) UpdateUserInfo(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 3 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var (
		err      error
		userID   uuid.UUID
		userInfo models.UserInfo
	)

	userID = uuid.Must(uuid.FromString("fdc16121-2efa-49d7-b7e4-b29b7fd7dc17"))
	err = json.NewDecoder(r.Body).Decode(&userInfo)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if isValid, message := utils.ValidateFullName(userInfo.FirstName); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidateFullName(userInfo.LastName); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidateDateOfBirth(userInfo.DateOfBirth); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidateNickname(userInfo.Nickname); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidateAboutMe(userInfo.About); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	if isValid, message := utils.ValidateEmail(userInfo.Email); !isValid {
		utils.SendResponses(w, http.StatusBadRequest, message, nil)
		return
	}

	err = p.UserService.UpdateUserInfo(userID, userInfo)
	if err != nil {
		if err.Error() == "UNIQUE constraint failed: User.email" {
			utils.SendResponses(w, http.StatusBadRequest, "email already exists", nil)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "success"})
}
