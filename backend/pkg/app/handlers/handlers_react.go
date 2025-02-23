package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"blank/pkg/app/middleware"
	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type ReactHandler struct {
	ReactService  *services.ReactService
	AuthMidlaware *middleware.AuthMiddleware
}

func (rh *ReactHandler) React(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	var react models.React

	err := json.NewDecoder(r.Body).Decode(&react)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}
	defer r.Body.Close()

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}
	err = rh.ReactService.Create(userID, react.ID, react.Target)
	fmt.Println("create", err)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad request", nil)
		return
	}

	data, err := rh.ReactService.GetReacts(react.ID, react.Target)
	if err != nil {
		utils.SendResponses(w, http.StatusNotFound, "Internal Server Error", nil)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(data)
	if err != nil {
		utils.SendResponses(w, http.StatusNotFound, "Internal Server Error", nil)
	}
}
