package handlers

import (
	"net/http"
	"strconv"

	"blank/pkg/app/services"
	"blank/pkg/app/utils"
)

type FollowHandler struct {
	FollowService *services.FollowService
}

func (f *FollowHandler) RequestFollow(w http.ResponseWriter, r *http.Request) {
}

func (f *FollowHandler) AcceptFollow(w http.ResponseWriter, r *http.Request) {
}

func (f *FollowHandler) RefuseFollow(w http.ResponseWriter, r *http.Request) {
}

func (f *FollowHandler) DeleteFollowing(w http.ResponseWriter, r *http.Request) {
}

func (f *FollowHandler) DeleteFollower(w http.ResponseWriter, r *http.Request) {
}

func (f *FollowHandler) FollowerList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	page := r.URL.Query().Get("page")
	offset, err := strconv.Atoi(page)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid page value", nil)
		return
	}

	offset = offset*20 - 20
	userId := r.Context().Value("user_id").(string)

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

	page := r.URL.Query().Get("page")
	offset, err := strconv.Atoi(page)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid page value", nil)
		return
	}

	offset = offset*20 - 20
	userId := r.Context().Value("user_id").(string)

	following, err := f.FollowService.GetFollowing(userId, offset)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	utils.SendResponses(w, http.StatusOK, "success", following)
}
