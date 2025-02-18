package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"blank/pkg/app/middleware"
	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

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

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}
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
