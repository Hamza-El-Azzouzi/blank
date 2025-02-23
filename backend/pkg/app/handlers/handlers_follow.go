package handlers

import (
	"encoding/json"
	"net/http"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type FollowHandler struct {
	FollowService *services.FollowService
	UserService   *services.UserService
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
	err = f.FollowService.RequestFollow(follow)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
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
	err = f.FollowService.AcceptFollow(follow)
	if err != nil {
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
	err = f.FollowService.RefuseFollow(follow)
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

	offset := r.URL.Query().Get("offset")
	userId := r.Context().Value("user_id").(string)
	
	if offset != "" {
		lastUserID, err := uuid.FromString(offset)
		if err != nil {
			utils.SendResponses(w, http.StatusBadRequest, "The user that you try to unfollow doesn't exist", nil)
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

	offset := r.URL.Query().Get("offset")
	userId := r.Context().Value("user_id").(string)

	if offset != "" {
		lastUserID, err := uuid.FromString(offset)
		if err != nil {
			utils.SendResponses(w, http.StatusBadRequest, "The user that you try to unfollow doesn't exist", nil)
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
