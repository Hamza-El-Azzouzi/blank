package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"blank/pkg/app/middleware"
	"blank/pkg/app/models"
	"blank/pkg/app/services"

	"github.com/gofrs/uuid/v5"
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

	// logeddUser, user := rh.AuthMidlaware.IsUserLoggedIn(w, r)
	// if !logeddUser {
	// 	w.WriteHeader(http.StatusForbidden)
	// 	return
	// }
	userID := uuid.Must(uuid.FromString("fdc16121-2efa-49d7-b7e4-b29b7fd7dc17"))
	if react.Target == "post" {
		err := rh.ReactService.Create(userID, react.ID, "", react.Target)
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	} else {
		err := rh.ReactService.Create(userID, "", react.ID, react.Target)
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
