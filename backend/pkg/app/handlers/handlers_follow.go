package handlers

import (
	"encoding/json"
	"net/http"

	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"
)

type FollowHandler struct {
	FollowService *services.FollowService
}

func (f *FollowHandler) RequestFollow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
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
}

func (f *FollowHandler) AcceptFollow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
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
}

func (f *FollowHandler) RefuseFollow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
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
}

func (f *FollowHandler) DeleteFollowing(w http.ResponseWriter, r *http.Request) {
}

func (f *FollowHandler) DeleteFollower(w http.ResponseWriter, r *http.Request) {
}

func (f *FollowHandler) FollowerList(w http.ResponseWriter, r *http.Request) {
}

func (f *FollowHandler) FollowingList(w http.ResponseWriter, r *http.Request) {
}
