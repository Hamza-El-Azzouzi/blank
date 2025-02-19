package handlers

import (
	"net/http"

	"blank/pkg/app/services"
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
}

func (f *FollowHandler) FollowingList(w http.ResponseWriter, r *http.Request) {
}
