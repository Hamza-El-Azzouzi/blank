package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type FollowHandler struct {
	FollowService    *services.FollowService
	UserService      *services.UserService
	WebSocketService *services.WebSocketService
}

func (f *FollowHandler) RequestFollow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed hhhh", nil)
		return
	}

	var follow models.FollowRequest

	err := json.NewDecoder(r.Body).Decode(&follow)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	defer r.Body.Close()

	followingID, err := uuid.FromString(follow.FollowingId)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "The user that you try to follow doesn't exist", nil)
		return
	}

	if !f.UserService.UserExist(followingID) {
		utils.SendResponses(w, http.StatusBadRequest, "The user that you try to follow doesn't exist", nil)
		return
	}

	follow.FollowerId = r.Context().Value("user_id").(string)
	privacy, err := f.FollowService.RequestFollow(follow)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}

	if privacy == "private" {
		userID, _ := uuid.FromString(follow.FollowerId)
		FollowedUserID, _ := uuid.FromString(follow.FollowingId)
		user, err := f.UserService.GetPublicUserInfo(userID)
		if err != nil {
			utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
			return
		}
		f.WebSocketService.SendNotification([]uuid.UUID{FollowedUserID}, models.Notification{
			Type:      "follow_request",
			UserID:    uuid.NullUUID{UUID: userID, Valid: true},
			UserName:  sql.NullString{String: user.FirstName + " " + user.LastName, Valid: true},
			Label:     fmt.Sprintf(`New follow request from %s %s`, user.FirstName, user.LastName),
			CreatedAt: time.Now(),
		})
	}

	followStatus := make(map[string]string)
	followStatus["follow_status"], err = f.FollowService.GetFollowStatus(follow)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "success", followStatus)
}

func (f *FollowHandler) AcceptFollow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	var follow models.FollowRequest

	err := json.NewDecoder(r.Body).Decode(&follow)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "failed to decode body", nil)
		return
	}
	defer r.Body.Close()

	followingID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	followerID, err := uuid.FromString(follow.FollowerId)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid follower ID", nil)
		return
	}

	err = f.FollowService.AcceptFollow(followingID, followerID)
	if err != nil {
		fmt.Println(err)
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "success", nil)
}

func (f *FollowHandler) RefuseFollow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	var follow models.FollowRequest

	err := json.NewDecoder(r.Body).Decode(&follow)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	defer r.Body.Close()

	followingID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}

	followerID, err := uuid.FromString(follow.FollowerId)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid follower ID", nil)
		return
	}

	err = f.FollowService.RefuseFollow(followingID, followerID)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}

	utils.SendResponses(w, http.StatusOK, "success", nil)
}

func (f *FollowHandler) DeleteFollowing(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	var followData models.FollowRequest
	if err := json.NewDecoder(r.Body).Decode(&followData); err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid request body", nil)
		return
	}
	defer r.Body.Close()

	followingID, err := uuid.FromString(followData.FollowingId)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "The user that you try to follow doesn't exist", nil)
		return
	}

	if !f.UserService.UserExist(followingID) {
		utils.SendResponses(w, http.StatusBadRequest, "The user that you try to follow doesn't exist", nil)
		return
	}

	followData.FollowerId = r.Context().Value("user_id").(string)

	err = f.FollowService.DeleteFollow(followData)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}

	followStatus := make(map[string]string)
	followStatus["follow_status"], err = f.FollowService.GetFollowStatus(followData)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "success", followStatus)
}

func (f *FollowHandler) DeleteFollower(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	var followData models.FollowRequest
	if err := json.NewDecoder(r.Body).Decode(&followData); err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid request body", nil)
		return
	}
	defer r.Body.Close()

	followerID, err := uuid.FromString(followData.FollowerId)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "The user that you try to unfollow doesn't exist", nil)
		return
	}

	if !f.UserService.UserExist(followerID) {
		utils.SendResponses(w, http.StatusBadRequest, "The user that you try to unfollow doesn't exist", nil)
		return
	}

	followData.FollowingId = r.Context().Value("user_id").(string)

	err = f.FollowService.DeleteFollow(followData)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}

	followStatus := make(map[string]string)
	followStatus["follow_status"], err = f.FollowService.GetFollowStatus(followData)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "success", followStatus)
}

func (f *FollowHandler) FollowerList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}

	userId := r.PathValue("userId")
	userID, err := uuid.FromString(userId)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}

	if !f.UserService.UserExist(userID) {
		utils.SendResponses(w, http.StatusBadRequest, "The user that you try to get doesn't exist", nil)
		return
	}

	offset := r.URL.Query().Get("offset")
	if offset != "" {
		lastUserID, err := uuid.FromString(offset)
		if err != nil {
			utils.SendResponses(w, http.StatusBadRequest, "The user that you try to get doesn't exist", nil)
			return
		}
		if !f.UserService.UserExist(lastUserID) {
			utils.SendResponses(w, http.StatusBadRequest, "The user that you try to get doesn't exist", nil)
			return
		}
	}

	followers, err := f.FollowService.GetFollowers(userId, offset)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	utils.SendResponses(w, http.StatusOK, "success", followers)
}

func (f *FollowHandler) FollowingList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}

	userId := r.PathValue("userId")
	userID, err := uuid.FromString(userId)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}

	if !f.UserService.UserExist(userID) {
		utils.SendResponses(w, http.StatusBadRequest, "The user that you try to get doesn't exist", nil)
		return
	}

	offset := r.URL.Query().Get("offset")
	if offset != "" {
		lastUserID, err := uuid.FromString(offset)
		if err != nil {
			utils.SendResponses(w, http.StatusBadRequest, "The user that you try to get doesn't exist", nil)
			return
		}

		if !f.UserService.UserExist(lastUserID) {
			utils.SendResponses(w, http.StatusBadRequest, "The user that you try to get doesn't exist", nil)
			return
		}
	}

	following, err := f.FollowService.GetFollowing(userId, offset)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	utils.SendResponses(w, http.StatusOK, "success", following)
}

func (f *FollowHandler) SearchFollowers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	offset := r.URL.Query().Get("offset")
	if offset != "" {
		lastUserID, err := uuid.FromString(offset)
		if err != nil {
			utils.SendResponses(w, http.StatusBadRequest, "The user that you try to get doesn't exist", nil)
			return
		}

		if !f.UserService.UserExist(lastUserID) {
			utils.SendResponses(w, http.StatusBadRequest, "The user that you try to get doesn't exist", nil)
			return
		}
	}
	userId := r.PathValue("userId")
	query := r.URL.Query().Get("q")

	users, errUsers := f.FollowService.SearchFollowers(userId, offset, query)
	if errUsers != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "success", users)
}

func (f *FollowHandler) SearchFollowing(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	offset := r.URL.Query().Get("offset")
	if offset != "" {
		lastUserID, err := uuid.FromString(offset)
		if err != nil {
			utils.SendResponses(w, http.StatusBadRequest, "The user that you try to get doesn't exist", nil)
			return
		}

		if !f.UserService.UserExist(lastUserID) {
			utils.SendResponses(w, http.StatusBadRequest, "The user that you try to get doesn't exist", nil)
			return
		}
	}
	userId := r.PathValue("userId")
	query := r.URL.Query().Get("q")

	users, errUsers := f.FollowService.SearchFollowing(userId, offset, query)
	if errUsers != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "success", users)
}
