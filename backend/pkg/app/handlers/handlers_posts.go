package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"blank/pkg/app/middleware"
	"blank/pkg/app/models"
	"blank/pkg/app/services"
	"blank/pkg/app/utils"

	"github.com/gofrs/uuid/v5"
)

type PostHandler struct {
	AuthMidlaware  *middleware.AuthMiddleware
	PostService    *services.PostService
	CommentService *services.CommentService
}

func (p *PostHandler) Posts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}

	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusUnauthorized, "User Not Authorized", nil)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 4 {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	pagination := pathParts[3]
	if pagination == "" {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	nPagination, err := strconv.Atoi(pagination)
	if err != nil {
		utils.SendResponses(w, http.StatusNotFound, "Page Not Found", nil)
		return
	}
	posts, err := p.PostService.AllPosts(nPagination, userID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "success", posts)
}

func (p *PostHandler) PostsByUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) != 5 {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	pagination := pathParts[4]
	if pagination == "" {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}
	nPagination, err := strconv.Atoi(pagination)
	if err != nil {
		utils.SendResponses(w, http.StatusNotFound, "Not Found", nil)
		return
	}

	userID, err := uuid.FromString(r.PathValue("id"))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}
	authUserID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid user ID", nil)
		return
	}
	posts, err := p.PostService.PostsByUser(userID, authUserID, nPagination)
	if err != nil {

		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "success", posts)
}

func (p *PostHandler) PostSaver(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.SendResponses(w, http.StatusMethodNotAllowed, "Method Not Allowed", nil)
		return
	}
	var postData models.PostData

	err := json.NewDecoder(r.Body).Decode(&postData)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad Request", nil)
		return
	}
	defer r.Body.Close()

	if (postData.Content == "" && postData.Image == "") || len(postData.Content) > 5000 {
		utils.SendResponses(w, http.StatusBadRequest, "Bad Request", nil)
		return
	}
	userID, err := uuid.FromString(r.Context().Value("user_id").(string))
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Invalid authenticated user ID", nil)
		return
	}
	err = p.PostService.PostSave(userID, postData.Content, postData.Privacy, postData.Image, postData.SelectedFollowers)
	if err != nil {
		utils.SendResponses(w, http.StatusBadRequest, "Bad Request", nil)
		return
	}
	posts, err := p.PostService.AllPosts(0, userID)
	if err != nil {
		utils.SendResponses(w, http.StatusInternalServerError, "Internal Server Error", nil)
		return
	}
	utils.SendResponses(w, http.StatusOK, "success", posts[0])
}
