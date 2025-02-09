package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"blank/pkg/app/middleware"
	"blank/pkg/app/services"

	"github.com/gofrs/uuid/v5"
)

type UserHandler struct {
	AuthService   *services.AuthService
	AuthMidlaware *middleware.AuthMiddleware
	PostService   *services.PostService
	UserService   *services.UserService
	AuthHandler   *AuthHandler
}

func (p *UserHandler) InfoGetter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 3 {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	var err error
	userID := uuid.Must(uuid.FromString("3b9d3a3a-f3e6-44bc-a9a2-f3ea812e7aa1"))
	user, err := p.UserService.GetUserInfo(userID)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}
