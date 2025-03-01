package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type UserHandler struct {
	UserService   *services.UserService
	FollowService *services.FollowService
}

func (u *UserHandler) InfoGetter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	var err error
	authUserID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	userID, err := uuid.FromString(r.PathValue("id"))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}

	exist := u.UserService.UserExist(userID)
	if !exist {
		utils.SendResponses(w, http.StatusNotFound, "User not found", nil)
		return
	}

	user, err := u.UserService.GetUserInfo(userID, authUserID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	user.IsOwner = userID == authUserID

	if !user.IsOwner {
		follow := models.FollowRequest{FollowerId: authUserID.String(), FollowingId: userID.String()}
		user.FollowStatus, err = u.FollowService.GetFollowStatus(follow)
		if err != nil {
			utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
			return
		}
	}

	utils.SendResponses(w, http.StatusOK, "", user)
}

func (u *UserHandler) UpdateUserInfo(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	if r.Header.Get("Content-Type") != "application/json" {
		utils.SendResponses(w, http.StatusUnsupportedMediaType, "content-Type must be application/json", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 3 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}

	var (
		err      error
		userID   uuid.UUID
		userInfo models.UserInfo
	)

	userID, err = uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	err = json.NewDecoder(r.Body).Decode(&userInfo)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid user ID", nil)
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

	err = u.UserService.UpdateUserInfo(userID, userInfo)
	if err != nil {
		if err.Error() == "UNIQUE constraint failed: User.email" {
			utils.SendResponses(w, http.StatusBadRequest, "email already exists", nil)
			return
		}
		utils.SendResponses(w, http.StatusInternalServerError, "Failed to update user info", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "success", nil)
}

func (u *UserHandler) AuthenticatedUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	authUserID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	user, err := u.UserService.GetAuthenticatedUser(authUserID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "", user)
}

func (u *UserHandler) SearchUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	query := r.URL.Query().Get("q")
	page := r.URL.Query().Get("page")
	pageNum := 1

	if page != "" {
		var err error
		pageNum, err = strconv.Atoi(page)
		if err != nil || pageNum < 1 {
			pageNum = 1
		}
	}

	users, hasMore, errUsers := u.UserService.SearchUsers(query, pageNum)
	if errUsers != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	response := map[string]interface{}{
		"users":   users,
		"hasMore": hasMore,
	}

	utils.SendResponses(w, http.StatusOK, "success", response)
}
