package handlers

import (
	"encoding/json"
	"net/http"
	"sync"

	"real-time-forum/internal/middleware"
	"real-time-forum/internal/models"
	"real-time-forum/internal/services"
)

type ReactHandler struct {
	ReactService  *services.ReactService
	AuthMidlaware *middleware.AuthMiddleware
	mutex         sync.Mutex
}

func (rh *ReactHandler) React(w http.ResponseWriter, r *http.Request) {
	rh.mutex.Lock()
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var react models.React

	err := json.NewDecoder(r.Body).Decode(&react)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	logeddUser, user := rh.AuthMidlaware.IsUserLoggedIn(w, r)
	if !logeddUser {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	if react.Target == "post" {
		err := rh.ReactService.Create(user.ID, react.ID, "", react.Type, react.Target)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	} else {
		err := rh.ReactService.Create(user.ID, "", react.ID, react.Type, react.Target)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	}
	data, err := rh.ReactService.GetReacts(react.ID, react.Target)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(data)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
	rh.mutex.Unlock()
}
